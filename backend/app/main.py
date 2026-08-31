from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from backend.app.database import init_db
from backend.app.services.prediction_service import get_prediction_service
from backend.app.routes import health, prediction, customers, analytics

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize DB and load ML prediction artifacts into memory once
    print("[INFO] Initializing Database tables...")
    init_db()
    
    print("[INFO] Pre-loading ML Model & Preprocessor artifacts...")
    predictor = get_prediction_service()
    if predictor.is_ready():
        print("[SUCCESS] ML Model and SHAP Explainer successfully loaded into memory.")
    else:
        print("[WARNING] Model artifacts not yet created. The service will load them once training completes.")
        
    yield
    print("[INFO] Shutting down Customer Churn Intelligence Backend...")

app = FastAPI(
    title="Customer Churn Intelligence API",
    description="Production-grade AI Churn Prediction, SHAP Explainability & Retention Intelligence API",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register route modules under /api prefix
app.include_router(health.router, prefix="/api")
app.include_router(prediction.router, prefix="/api")
app.include_router(customers.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")

@app.get("/")
def root():
    return {
        "message": "Customer Churn Intelligence System API",
        "docs_url": "/docs",
        "health_url": "/api/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
