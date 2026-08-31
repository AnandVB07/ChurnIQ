from fastapi import APIRouter
from backend.app.services.prediction_service import get_prediction_service
from src.config import BEST_MODEL_FILE, PREPROCESSOR_FILE

router = APIRouter(tags=["Health"])

@router.get("/health")
def health_check():
    """System health check endpoint verifying ML model and service readiness."""
    predictor = get_prediction_service()
    model_ready = predictor.is_ready()
    
    return {
        "status": "healthy",
        "service": "Customer Churn Intelligence API",
        "version": "1.0.0",
        "ml_model_loaded": model_ready,
        "model_file_exists": BEST_MODEL_FILE.exists(),
        "preprocessor_file_exists": PREPROCESSOR_FILE.exists()
    }
