import shap
import numpy as np
import pandas as pd
from typing import Dict, Any, List, Optional
import joblib

FEATURE_HUMAN_NAMES = {
    "tenure": "Tenure with Company",
    "MonthlyCharges": "Monthly Subscription Fee",
    "TotalCharges": "Total Historical Spend",
    "avg_monthly_spend": "Average Monthly Spend Rate",
    "charge_ratio": "Monthly-to-Total Spend Ratio",
    "service_count": "Number of Active Subscribed Services",
    "Contract_Month-to-month": "Month-to-Month Contract",
    "Contract_One year": "One-Year Contract",
    "Contract_Two year": "Two-Year Contract",
    "InternetService_Fiber optic": "Fiber Optic High-Speed Internet",
    "InternetService_DSL": "DSL Internet Service",
    "InternetService_No": "No Internet Service",
    "PaymentMethod_Electronic check": "Electronic Check Payment Method",
    "PaymentMethod_Mailed check": "Mailed Check Payment Method",
    "PaymentMethod_Bank transfer (automatic)": "Automatic Bank Transfer",
    "PaymentMethod_Credit card (automatic)": "Automatic Credit Card Billing",
    "OnlineSecurity_No": "Lack of Online Security Add-on",
    "OnlineSecurity_Yes": "Active Online Security Protection",
    "TechSupport_No": "Lack of Dedicated Tech Support",
    "TechSupport_Yes": "Active Dedicated Tech Support",
    "PaperlessBilling_Yes": "Paperless Invoicing Enabled",
    "PaperlessBilling_No": "Paper Invoicing",
    "SeniorCitizen_1": "Senior Citizen Customer",
    "Partner_No": "No Partner on Account",
    "Dependents_No": "No Dependents on Account"
}

class ShapExplainerService:
    """
    Computes global and local SHAP explanations for customer churn predictions.
    """
    def __init__(self, model: Any, feature_names: List[str]):
        self.model = model
        self.feature_names = feature_names
        self.explainer = None
        self._init_explainer()
        
    def _init_explainer(self):
        try:
            # TreeExplainer is fast and exact for tree-based models like XGBoost and Random Forest
            self.explainer = shap.TreeExplainer(self.model)
        except Exception:
            # Fallback to general Explainer
            self.explainer = shap.Explainer(self.model)

    def explain_instance(
        self,
        transformed_features: np.ndarray,
        top_k: int = 5
    ) -> Dict[str, Any]:
        """
        Calculates local SHAP contributions for an individual customer.
        Returns top factors driving risk up or down.
        """
        # Ensure 2D array
        if transformed_features.ndim == 1:
            transformed_features = transformed_features.reshape(1, -1)
            
        shap_values = self.explainer.shap_values(transformed_features)
        
        # Handle binary classification output formats
        if isinstance(shap_values, list):
            # Binary classifier list of arrays [class 0, class 1]
            values = shap_values[1][0] if len(shap_values) > 1 else shap_values[0][0]
        elif isinstance(shap_values, np.ndarray):
            if shap_values.ndim == 3:
                values = shap_values[0, :, 1]
            elif shap_values.ndim == 2:
                values = shap_values[0]
            else:
                values = shap_values
        else:
            values = np.array(shap_values.values)[0]
            
        expected_val = 0.0
        if hasattr(self.explainer, "expected_value"):
            exp = self.explainer.expected_value
            if isinstance(exp, (list, np.ndarray)):
                expected_val = float(exp[1] if len(exp) > 1 else exp[0])
            else:
                expected_val = float(exp)

        factors = []
        for name, val in zip(self.feature_names, values):
            human_label = FEATURE_HUMAN_NAMES.get(name, name.replace("_", " ").title())
            factors.append({
                "feature": name,
                "feature_label": human_label,
                "shap_value": float(val),
                "impact": "INCREASES_RISK" if val > 0 else "DECREASES_RISK",
                "abs_impact": float(abs(val))
            })
            
        # Sort by absolute magnitude
        factors.sort(key=lambda x: x["abs_impact"], reverse=True)
        top_factors = factors[:top_k]
        
        return {
            "base_value": expected_val,
            "top_factors": top_factors,
            "all_factors": factors
        }

    def compute_global_importance(
        self,
        X_sample: np.ndarray,
        top_k: int = 15
    ) -> List[Dict[str, Any]]:
        """
        Computes mean absolute SHAP values across a representative sample.
        """
        shap_values = self.explainer.shap_values(X_sample)
        if isinstance(shap_values, list):
            values = shap_values[1] if len(shap_values) > 1 else shap_values[0]
        elif isinstance(shap_values, np.ndarray) and shap_values.ndim == 3:
            values = shap_values[:, :, 1]
        else:
            values = shap_values
            
        mean_abs_shap = np.mean(np.abs(values), axis=0)
        
        importances = []
        for name, score in zip(self.feature_names, mean_abs_shap):
            human_label = FEATURE_HUMAN_NAMES.get(name, name.replace("_", " ").title())
            importances.append({
                "feature": name,
                "feature_label": human_label,
                "importance": float(score)
            })
            
        importances.sort(key=lambda x: x["importance"], reverse=True)
        return importances[:top_k]
