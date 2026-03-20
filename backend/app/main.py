import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from . import models
from .database import engine
from .routers import users, projects, ai

# Load .env into environment variables for local development
load_dotenv()

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="ModForge AI Studio API")

# Enable CORS so the frontend can call this API from different ports/hosts.
# In production, set CORS_ALLOWED_ORIGINS to a comma-separated list of allowed URLs.
raw_origins = os.getenv("CORS_ALLOWED_ORIGINS", "")
if raw_origins:
    origins = [o.strip() for o in raw_origins.split(",") if o.strip()]
else:
    origins = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://localhost:3003",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:3002",
        "http://127.0.0.1:3003",
        "https://moderator-1-zi2v.onrender.com",
        "https://your-frontend-name.vercel.app",  # replace with your real frontend URL
        "https://your-frontend-name.onrender.com", # optional alternate
    ]

# When using wildcard origins, do not enable credentials as it is not allowed by CORS.
allow_credentials = not (len(origins) == 1 and origins[0] == "*")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=allow_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router, prefix="/api/v1")
app.include_router(projects.router, prefix="/api/v1")
app.include_router(ai.router, prefix="/api/v1")

@app.get("/")
def read_root():
    return {"message": "ModForge AI Studio Backend"}