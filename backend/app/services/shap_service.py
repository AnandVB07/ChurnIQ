from typing import Dict, Any, List
import numpy as np
from src.explain import ShapExplainerService

def compute_instance_shap(
    explainer_service: ShapExplainerService,
    transformed_features: np.ndarray,
    top_k: int = 5
) -> Dict[str, Any]:
    """Computes SHAP factors for an individual customer."""
    return explainer_service.explain_instance(transformed_features, top_k=top_k)
