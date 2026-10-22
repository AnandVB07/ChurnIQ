"""Vercel entrypoint for the FastAPI app and the built Vite frontend."""

from pathlib import Path

from fastapi.staticfiles import StaticFiles
from backend.app.main import app

# Vercel serves these built assets from its CDN. API routes remain handled by
# FastAPI and take precedence over the frontend fallback.
frontend_dir = Path(__file__).resolve().parent / "frontend" / "dist"
if hasattr(app, "frontend"):
    app.frontend("/", directory=str(frontend_dir))
elif frontend_dir.exists():
    # Local FastAPI uses StaticFiles; Vercel can promote the same directory to
    # its CDN when its FastAPI frontend integration is available.
    app.mount("/", StaticFiles(directory=frontend_dir, html=True), name="frontend")
