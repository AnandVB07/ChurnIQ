import json
import numpy as np
import pandas as pd
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    brier_score_loss,
    confusion_matrix,
    classification_report
)

from src.config import MODEL_METADATA_FILE, MODELS_DIR

def evaluate_model(
    model: Any,
    X_test: np.ndarray,
    y_test: np.ndarray,
    model_name: str,
    feature_names: List[str],
    hyperparameters: Optional[Dict[str, Any]] = None,
    global_feature_importance: Optional[List[Dict[str, Any]]] = None,
    version: str = "1.0.0"
) -> Dict[str, Any]:
    """
    Evaluates model performance against held-out test data and generates comprehensive metadata.
    """
    y_pred = model.predict(X_test)
    
    if hasattr(model, "predict_proba"):
        y_prob = model.predict_proba(X_test)[:, 1]
    elif hasattr(model, "decision_function"):
        # Map decision function to 0-1 via sigmoid
        df_vals = model.decision_function(X_test)
        y_prob = 1 / (1 + np.exp(-df_vals))
    else:
        y_prob = y_pred.astype(float)
        
    acc = float(accuracy_score(y_test, y_pred))
    prec = float(precision_score(y_test, y_pred, zero_division=0))
    rec = float(recall_score(y_test, y_pred, zero_division=0))
    f1 = float(f1_score(y_test, y_pred, zero_division=0))
    roc_auc = float(roc_auc_score(y_test, y_prob))
    brier = float(brier_score_loss(y_test, y_prob))
    
    cm = confusion_matrix(y_test, y_pred)
    tn, fp, fn, tp = cm.ravel()
    
    metrics = {
        "accuracy": round(acc, 4),
        "precision": round(prec, 4),
        "recall": round(rec, 4),
        "f1": round(f1, 4),
        "roc_auc": round(roc_auc, 4),
        "brier_score": round(brier, 4)
    }
    
    cm_dict = {
        "true_negative": int(tn),
        "false_positive": int(fp),
        "false_negative": int(fn),
        "true_positive": int(tp),
        "matrix": [[int(tn), int(fp)], [int(fn), int(tp)]]
    }
    
    metadata = {
        "model_name": model_name,
        "version": version,
        "training_date": datetime.now(timezone.utc).isoformat(),
        "total_test_samples": len(y_test),
        "churn_rate_test": round(float(np.mean(y_test)), 4),
        "metrics": metrics,
        "confusion_matrix": cm_dict,
        "hyperparameters": hyperparameters or {},
        "features": feature_names,
        "global_feature_importance": global_feature_importance or []
    }
    
    return metadata

def save_model_metadata(metadata: Dict[str, Any], filepath: Optional[str] = None):
    """Saves model evaluation metadata to JSON file."""
    path = filepath or MODEL_METADATA_FILE
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)
    print(f"Saved model metadata to {path}")
    
def load_model_metadata(filepath: Optional[str] = None) -> Dict[str, Any]:
    """Loads model evaluation metadata from JSON file."""
    path = filepath or MODEL_METADATA_FILE
    if not path.exists():
        return {}
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)
