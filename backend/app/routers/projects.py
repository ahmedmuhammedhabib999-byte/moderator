from datetime import datetime
import zipfile
import io
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from .. import models, schemas
from ..auth import get_current_user, get_db

router = APIRouter()

@router.post("/projects", response_model=schemas.Project)
def create_project(
    project: schemas.ProjectCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    db_project = models.Project(
        name=project.name,
        description=project.description,
        user_id=current_user.id,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

@router.get("/projects", response_model=list[schemas.Project])
def list_projects(
    db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)
):
    return db.query(models.Project).filter(models.Project.user_id == current_user.id).all()

@router.get("/projects/{project_id}", response_model=schemas.Project)
def get_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    project = (
        db.query(models.Project)
        .filter(models.Project.id == project_id, models.Project.user_id == current_user.id)
        .first()
    )
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

@router.patch("/projects/{project_id}", response_model=schemas.Project)
def update_project(
    project_id: int,
    project_in: schemas.ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    project = (
        db.query(models.Project)
        .filter(models.Project.id == project_id, models.Project.user_id == current_user.id)
        .first()
    )
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if project_in.name is not None:
        project.name = project_in.name
    if project_in.description is not None:
        project.description = project_in.description
    project.updated_at = datetime.utcnow()
    db.add(project)
    db.commit()
    db.refresh(project)
    return project

@router.delete("/projects/{project_id}")
def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    project = (
        db.query(models.Project)
        .filter(models.Project.id == project_id, models.Project.user_id == current_user.id)
        .first()
    )
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    db.delete(project)
    db.commit()
    return {"ok": True}


@router.get("/projects/{project_id}/data", response_model=schemas.ModDataResponse)
def get_project_data(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    project = (
        db.query(models.Project)
        .filter(models.Project.id == project_id, models.Project.user_id == current_user.id)
        .first()
    )
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    settings = (
        db.query(models.Settings)
        .filter(models.Settings.project_id == project_id)
        .first()
    )
    weapons = (
        db.query(models.Weapon)
        .filter(models.Weapon.project_id == project_id)
        .all()
    )
    characters = (
        db.query(models.Character)
        .filter(models.Character.project_id == project_id)
        .all()
    )
    maps = (
        db.query(models.Map)
        .filter(models.Map.project_id == project_id)
        .all()
    )
    scripts = (
        db.query(models.Script)
        .filter(models.Script.project_id == project_id)
        .all()
    )

    return schemas.ModDataResponse(
        project_id=project.id,
        settings=settings.data if settings else None,
        weapons=[w.data for w in weapons] if weapons else None,
        characters=[c.data for c in characters] if characters else None,
        maps=[m.data for m in maps] if maps else None,
        scripts=[s.data for s in scripts] if scripts else None,
    )


@router.put("/projects/{project_id}/data", response_model=schemas.ModDataResponse)
def update_project_data(
    project_id: int,
    data: schemas.ModData,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    project = (
        db.query(models.Project)
        .filter(models.Project.id == project_id, models.Project.user_id == current_user.id)
        .first()
    )
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    def upsert(table, existing, incoming):
        if existing:
            existing.data = incoming
        else:
            db.add(table(project_id=project_id, data=incoming))

    current_settings = (
        db.query(models.Settings)
        .filter(models.Settings.project_id == project_id)
        .first()
    )
    if data.settings is not None:
        upsert(models.Settings, current_settings, data.settings.dict())

    if data.weapons is not None:
        db.query(models.Weapon).filter(models.Weapon.project_id == project_id).delete()
        for weapon in data.weapons:
            db.add(models.Weapon(project_id=project_id, data=weapon.dict()))

    if data.characters is not None:
        db.query(models.Character).filter(models.Character.project_id == project_id).delete()
        for character in data.characters:
            db.add(models.Character(project_id=project_id, data=character.dict()))

    if data.maps is not None:
        db.query(models.Map).filter(models.Map.project_id == project_id).delete()
        for map_obj in data.maps:
            db.add(models.Map(project_id=project_id, data=map_obj.dict()))

    if data.scripts is not None:
        db.query(models.Script).filter(models.Script.project_id == project_id).delete()
        for script in data.scripts:
            db.add(models.Script(project_id=project_id, data=script.dict()))

    db.commit()

    return schemas.ModDataResponse(
        project_id=project.id,
        settings=data.settings,
        weapons=data.weapons,
        characters=data.characters,
        maps=data.maps,
        scripts=data.scripts,
    )


@router.get("/projects/{project_id}/export")
def export_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    project = (
        db.query(models.Project)
        .filter(models.Project.id == project_id, models.Project.user_id == current_user.id)
        .first()
    )
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Get mod data
    mod_data = get_project_data(project_id, db, current_user)

    # Create ZIP in memory
    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
        # Add mod data as JSON files
        if mod_data.settings:
            zip_file.writestr('settings.json', mod_data.settings.json())
        if mod_data.weapons:
            zip_file.writestr('weapons.json', str(mod_data.weapons))
        if mod_data.characters:
            zip_file.writestr('characters.json', str(mod_data.characters))
        if mod_data.maps:
            zip_file.writestr('maps.json', str(mod_data.maps))
        if mod_data.scripts:
            zip_file.writestr('scripts.json', str(mod_data.scripts))

    zip_buffer.seek(0)

    return FileResponse(
        zip_buffer,
        media_type='application/zip',
        filename=f"{project.name.replace(' ', '_')}_mod.zip"
    )


@router.post("/projects/{project_id}/upload")
async def upload_files(
    project_id: int,
    files: list[UploadFile] = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    project = (
        db.query(models.Project)
        .filter(models.Project.id == project_id, models.Project.user_id == current_user.id)
        .first()
    )
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    uploaded = []
    for file in files:
        # Read file content
        content = await file.read()
        
        # Get file type from extension
        file_type = file.filename.split('.')[-1].lower() if file.filename else 'unknown'
        
        # Decode text files, store as-is for binary
        try:
            file_content = content.decode('utf-8')
        except:
            file_content = content.hex()  # Store binary as hex string
        
        # Create UploadedFile record
        db_file = models.UploadedFile(
            project_id=project_id,
            filename=file.filename,
            file_type=file_type,
            file_content=file_content,
            file_size=len(content),
        )
        db.add(db_file)
        uploaded.append({
            "name": file.filename,
            "type": file_type,
            "size": len(content)
        })
    
    db.commit()
    return {"uploaded": uploaded, "count": len(uploaded)}


@router.get("/projects/{project_id}/files")
def list_project_files(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    project = (
        db.query(models.Project)
        .filter(models.Project.id == project_id, models.Project.user_id == current_user.id)
        .first()
    )
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    files = db.query(models.UploadedFile).filter(models.UploadedFile.project_id == project_id).all()
    return [
        {
            "id": f.id,
            "name": f.filename,
            "type": f.file_type,
            "size": f.file_size,
        }
        for f in files
    ]


@router.get("/projects/{project_id}/files/{file_id}")
def get_project_file(
    project_id: int,
    file_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    project = (
        db.query(models.Project)
        .filter(models.Project.id == project_id, models.Project.user_id == current_user.id)
        .first()
    )
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    file = (
        db.query(models.UploadedFile)
        .filter(models.UploadedFile.id == file_id, models.UploadedFile.project_id == project_id)
        .first()
    )
    if not file:
        raise HTTPException(status_code=404, detail="File not found")
    
    return {
        "id": file.id,
        "name": file.filename,
        "type": file.file_type,
        "size": file.file_size,
        "content": file.file_content,
    }
