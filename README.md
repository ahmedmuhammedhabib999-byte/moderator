# ModForge AI Studio

AI-powered game modding platform where users can generate and edit mods using natural language prompts.

## Getting Started

First, install dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- ShadCN UI
- FastAPI (Python) backend with PostgreSQL/SQLite
- OpenAI API
- Zod for schema validation
- Monaco Editor for script editing

## Backend (Python)

The backend is built with FastAPI and requires Python 3.10+.

1. Install Python (if not already installed).
2. From `backend/`, create and activate a virtual environment.
3. Install dependencies:

```bash
pip install -r requirements.txt
```

4. Run the backend server:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`.

## Features

- AI Assistant Panel: Chat interface for natural language prompts
- Structured Mod Engine: Schemas for settings, weapons, characters, maps, scripts
- Project System: Create, upload, save drafts, version history
- Mod Editors: Form-based and Monaco for editing
- Live Preview: Before/after comparisons
- Export System: Build mod packages
- Safety Rules: Validate and restrict unsafe changes

## Database Schema

- users
- projects
- project_versions
- settings
- weapons
- characters
- maps
- textures
- scripts
- ai_requests
- ai_responses