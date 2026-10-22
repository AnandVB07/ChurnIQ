"""Vercel entrypoint for the FastAPI app and the built Vite frontend."""

from backend.app.main import app

# Vercel serves these built assets from its CDN. API routes remain handled by
# FastAPI and take precedence over the frontend fallback.
app.frontend("/", directory="frontend/dist")
