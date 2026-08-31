from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Any

from backend.app.database import get_db
from backend.app.schemas import AnalyticsResponse, ModelMetadataResponse
from backend.app.services.analytics_service import get_analytics_overview
from src.evaluate import load_model_metadata

router = APIRouter(tags=["Analytics"])

@router.get("/analytics", response_model=AnalyticsResponse)
def get_analytics(db: Session = Depends(get_db)):
    """Computes overall business churn analytics and risk distributions."""
    try:
        overview = get_analytics_overview(db)
        return overview
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate analytics: {str(e)}"
        )

@router.get("/model/metadata", response_model=ModelMetadataResponse)
def get_model_metadata():
    """Returns actual trained model evaluation metrics, confusion matrix, and global SHAP importance."""
    meta = load_model_metadata()
    if not meta or not meta.get("metrics"):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Model evaluation results are not available yet. Please train the model via 'python -m src.train'."
        )
    return {
        "model_name": meta.get("model_name", "XGBoost Classifier"),
        "version": meta.get("version", "1.0.0"),
        "training_date": meta.get("training_date"),
        "metrics": meta.get("metrics", {}),
        "confusion_matrix": meta.get("confusion_matrix", {}),
        "hyperparameters": meta.get("hyperparameters", {}),
        "global_feature_importance": meta.get("global_feature_importance", [])
    }
