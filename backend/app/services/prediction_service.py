from typing import Dict, Any, Optional
from src.predict import ChurnPredictor
from src.config import BEST_MODEL_FILE, PREPROCESSOR_FILE

_predictor_instance: Optional[ChurnPredictor] = None

def get_prediction_service() -> ChurnPredictor:
    """Returns singleton instance of ChurnPredictor."""
    global _predictor_instance
    if _predictor_instance is None:
        _predictor_instance = ChurnPredictor()
    return _predictor_instance

def reload_prediction_service() -> bool:
    """Forces reloading model and preprocessor artifacts into memory."""
    global _predictor_instance
    _predictor_instance = ChurnPredictor()
    return _predictor_instance.is_ready()
