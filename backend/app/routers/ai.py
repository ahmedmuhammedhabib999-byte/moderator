import os
import json
import openai
from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from .. import models
from ..database import SessionLocal
from ..schemas import AIPromptRequest, AIResponse
from ..auth import get_current_user

router = APIRouter()

# Load environment variables (especially OPENAI_API_KEY) when running locally
load_dotenv()

openai.api_key = os.getenv("OPENAI_API_KEY")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def call_openai(prompt: str) -> dict:
    if not openai.api_key:
        # Fallback dummy response when API key isn't configured
        return {
            "type": "settings",
            "changes": [
                {
                    "field": "difficulty",
                    "value": "hard",
                    "description": "Increase difficulty as requested",
                }
            ],
        }

    system_prompt = (
        "You are a game modding assistant."
        " Respond with a JSON object only, with this exact structure:"
        " {\"type\": \"<category>\", \"changes\": [{\"field\": \"<name>\", \"value\": <value>, \"description\": \"<text>\"}]}"
        " Do not include any markup, backticks, or extra text."
    )

    completion = openai.ChatCompletion.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt},
        ],
        temperature=0.4,
        max_tokens=800,
    )

    content = completion.choices[0].message.content

    try:
        import json

        return json.loads(content)
    except Exception:
        # Expect response already a dict or not JSON
        if isinstance(content, dict):
            return content
        return {
            "type": "settings",
            "changes": [
                {
                    "field": "difficulty",
                    "value": "hard",
                    "description": "Unable to parse OpenAI output",
                }
            ],
        }


def clamp_value(field: str, value: object) -> object:
    # Enforce safe ranges for numeric values based on common mod fields.
    try:
        if isinstance(value, (int, float)):
            if field in ["damage", "health", "armor"]:
                return max(0, min(1000, float(value)))
            if field in ["recoil"]:
                return max(0.0, min(1.0, float(value)))
            if field in ["speed"]:
                return max(0, min(500, float(value)))
            if field in ["jumpHeight"]:
                return max(0, min(100, float(value)))
            if field in ["gravity"]:
                return max(0, min(100, float(value)))
            if field in ["timeLimit"]:
                return max(0, min(3600, float(value)))
            if field in ["maxPlayers"]:
                return max(1, min(128, int(value)))
            # Generic clamp for unknown numeric values
            return max(0, min(10000, float(value)))
    except Exception:
        pass
    return value


def sanitize_ai_response(ai_response: AIResponse) -> AIResponse:
    # Limit number of changes to avoid runaway modifications
    MAX_CHANGES = 20
    changes = ai_response.changes[:MAX_CHANGES]

    safe_changes = []
    for change in changes:
        field = change.field.strip()[:64]
        value = clamp_value(field, change.value)
        description = (change.description or "")[:256]
        safe_changes.append({"field": field, "value": value, "description": description})

    return AIResponse(type=ai_response.type, changes=safe_changes)


@router.post("/prompt", response_model=AIResponse)
def prompt_ai(
    request: AIPromptRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if not request.prompt.strip():
        raise HTTPException(status_code=400, detail="Prompt cannot be empty")

    response_data = call_openai(request.prompt)

    # Try to parse and validate OpenAI response
    try:
        ai_response = AIResponse.parse_obj(response_data)
        ai_response = sanitize_ai_response(ai_response)
    except Exception:
        # If parsing fails, fall back to a safe stub
        ai_response = AIResponse(
            type="settings",
            changes=[
                {
                    "field": "difficulty",
                    "value": "hard",
                    "description": "Could not parse OpenAI response, using safe default",
                }
            ],
        )

    # Save request + response for auditing
    db_request = models.AIRequest(user_id=current_user.id, prompt=request.prompt)
    db.add(db_request)
    db.commit()
    db.refresh(db_request)

    db_response = models.AIResponse(request_id=db_request.id, response=ai_response.dict())
    db.add(db_response)
    db.commit()

    return ai_response


@router.post("/projects/{project_id}/analyze")
def analyze_project_files(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Analyze uploaded files in a project and return metadata."""
    project = (
        db.query(models.Project)
        .filter(models.Project.id == project_id, models.Project.user_id == current_user.id)
        .first()
    )
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    files = db.query(models.UploadedFile).filter(models.UploadedFile.project_id == project_id).all()
    
    analysis = {
        "project_id": project_id,
        "total_files": len(files),
        "files": []
    }
    
    for file in files:
        file_analysis = {
            "id": file.id,
            "name": file.filename,
            "type": file.file_type,
            "size": file.file_size,
            "content_preview": file.file_content[:200] if len(file.file_content) > 0 else "",
        }
        analysis["files"].append(file_analysis)
    
    return analysis


@router.post("/projects/{project_id}/apply-changes")
def apply_ai_changes(
    project_id: int,
    changes: dict,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Apply AI-generated changes to project files."""
    project = (
        db.query(models.Project)
        .filter(models.Project.id == project_id, models.Project.user_id == current_user.id)
        .first()
    )
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    file_id = changes.get("file_id")
    modifications = changes.get("modifications", [])
    
    file = (
        db.query(models.UploadedFile)
        .filter(models.UploadedFile.id == file_id, models.UploadedFile.project_id == project_id)
        .first()
    )
    if not file:
        raise HTTPException(status_code=404, detail="File not found")
    
    # Apply modifications based on file type
    try:
        if file.file_type in ['json', 'yaml', 'lua']:
            content = file.file_content
            
            # Simple modification: apply field changes
            if file.file_type == 'json':
                data = json.loads(content)
                for mod in modifications:
                    field = mod.get("field")
                    value = mod.get("value")
                    data[field] = value
                file.file_content = json.dumps(data, indent=2)
            else:
                # For YAML/LUA, do simple text replacement
                for mod in modifications:
                    field = mod.get("field")
                    value = mod.get("value")
                    old_line = f'{field}:'
                    new_line = f'{field}: {value}'
                    file.file_content = file.file_content.replace(old_line, new_line)
        
        db.add(file)
        db.commit()
        
        return {
            "success": True,
            "file_id": file.id,
            "message": f"Applied {len(modifications)} changes to {file.filename}"
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to apply changes: {str(e)}")
