# Backend (FastAPI) for ModForge AI Studio

This backend provides authentication and a basic project API used by the frontend.

## Setup

1. Install Python 3.10+.
2. From this folder (`backend/`), create a virtual environment:

```bash
python -m venv venv
```

3. Activate the virtual environment:
- Windows (PowerShell): `venv\Scripts\Activate.ps1`
- Windows (cmd): `venv\\Scripts\\activate.bat`
- macOS/Linux: `source venv/bin/activate`

4. Install dependencies:

```bash
pip install -r requirements.txt
```

5. Create a `.env` file (optional) to set your OpenAI key and secret key:

```env
OPENAI_API_KEY=your_openai_api_key
SECRET_KEY=your_jwt_secret
```

6. Run the server:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## API Endpoints

- `POST /api/v1/register` — Register a new user
- `POST /api/v1/login` — Login and receive JWT token
- `GET /api/v1/projects` — List projects for current user
- `POST /api/v1/projects` — Create a new project
- `GET /api/v1/projects/{id}` — Get a project
- `PATCH /api/v1/projects/{id}` — Update a project
- `DELETE /api/v1/projects/{id}` — Delete a project
- `POST /api/v1/ai/prompt` — Send prompt to AI to generate mod changes
