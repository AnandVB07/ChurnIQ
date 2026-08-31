import joblib
import pandas as pd
import numpy as np
from typing import Dict, Any, Union, List, Optional
from pathlib import Path

from src.config import (
    BEST_MODEL_FILE,
    PREPROCESSOR_FILE,
    MODEL_METADATA_FILE,
    get_risk_level
)
from src.preprocessing import ChurnPreprocessor
from src.explain import ShapExplainerService
from src.evaluate import load_model_metadata

class ChurnPredictor:
    """
    Production-ready prediction service encapsulating model loading,
    feature transformation, risk classification, SHAP explanations, and retention recommendations.
    """
    def __init__(
        self,
        model_path: Optional[Union[str, Path]] = None,
        preprocessor_path: Optional[Union[str, Path]] = None,
        metadata_path: Optional[Union[str, Path]] = None
    ):
        self.model_path = Path(model_path or BEST_MODEL_FILE)
        self.preprocessor_path = Path(preprocessor_path or PREPROCESSOR_FILE)
        self.metadata_path = Path(metadata_path or MODEL_METADATA_FILE)
        
        self.model = None
        self.preprocessor = None
        self.metadata = {}
        self.explainer_service = None
        self._is_loaded = False
        
        self.load_artifacts()
        
    def load_artifacts(self) -> bool:
        """Loads serialized model, preprocessor, and initializes SHAP explainer."""
        if not self.model_path.exists() or not self.preprocessor_path.exists():
            print(f"Artifacts missing: model exists={self.model_path.exists()}, preprocessor exists={self.preprocessor_path.exists()}")
            return False
            
        try:
            self.model = joblib.load(self.model_path)
            self.preprocessor = ChurnPreprocessor.load(self.preprocessor_path)
            self.metadata = load_model_metadata(self.metadata_path)
            
            # Initialize SHAP service
            feature_names = self.preprocessor.get_feature_names()
            self.explainer_service = ShapExplainerService(self.model, feature_names)
            self._is_loaded = True
            print("Successfully loaded model, preprocessor, and SHAP explainer.")
            return True
        except Exception as e:
            print(f"Error loading prediction artifacts: {e}")
            self._is_loaded = False
            return False
            
    def is_ready(self) -> bool:
        return self._is_loaded and self.model is not None and self.preprocessor is not None

    def predict(
        self,
        customer_data: Union[Dict[str, Any], pd.DataFrame]
    ) -> Dict[str, Any]:
        """
        Executes prediction on customer record, computes probability, risk tier,
        local SHAP explanations, and business recommendation.
        """
        if not self.is_ready():
            raise RuntimeError("Model or preprocessor artifacts are not loaded.")

        if isinstance(customer_data, dict):
            df = pd.DataFrame([customer_data])
        else:
            df = customer_data.copy()

        # Transform inputs using trained preprocessor
        X_trans = self.preprocessor.transform(df)

        # Calculate prediction & churn probability
        if hasattr(self.model, "predict_proba"):
            probs = self.model.predict_proba(X_trans)
            churn_prob = float(probs[0][1])
        else:
            churn_prob = float(self.model.predict(X_trans)[0])
            
        pred_label = "CHURN" if churn_prob >= 0.50 else "STAY"
        risk_level = get_risk_level(churn_prob)

        # Generate SHAP explanation
        shap_explanation = self.explainer_service.explain_instance(X_trans, top_k=5)
        top_factors = shap_explanation["top_factors"]

        # Generate rule-based retention recommendation
        recommendation = self.generate_recommendation(
            customer_data if isinstance(customer_data, dict) else df.iloc[0].to_dict(),
            churn_prob,
            risk_level,
            top_factors
        )

        return {
            "churn_probability": round(churn_prob, 4),
            "prediction": pred_label,
            "risk_level": risk_level,
            "top_factors": top_factors,
            "recommendation": recommendation,
            "model_name": self.metadata.get("model_name", "XGBoost Classifier"),
            "model_version": self.metadata.get("version", "1.0.0")
        }

    def generate_recommendation(
        self,
        customer: Dict[str, Any],
        churn_prob: float,
        risk_level: str,
        top_factors: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Rules-based business retention recommendation engine tailored to risk tier and driving factors.
        """
        contract = str(customer.get("Contract", ""))
        monthly_charges = float(customer.get("MonthlyCharges", 0.0))
        tenure = int(customer.get("tenure", 0))
        tech_support = str(customer.get("TechSupport", ""))
        payment_method = str(customer.get("PaymentMethod", ""))
        internet_service = str(customer.get("InternetService", ""))

        actions = []
        priority = "LOW"
        summary = "Customer shows stable engagement. Continue standard relationship management."

        if risk_level == "HIGH":
            priority = "URGENT"
            summary = "Critical churn risk detected. Immediate intervention recommended."
            
            if contract == "Month-to-month":
                actions.append("Offer a 15% discount on an annual contract lock-in plan.")
            if monthly_charges > 75:
                actions.append("Review billing plan and propose a tailored bundle or loyalty rate.")
            if tenure < 12:
                actions.append("Assign a dedicated customer success specialist for an onboarding health check.")
            if tech_support == "No":
                actions.append("Provide 6 months of complimentary Premium 24/7 Tech Support.")
            if "Electronic check" in payment_method:
                actions.append("Incentivize switching to automated credit card billing with a $10 one-time credit.")
                
            if not actions:
                actions.append("Initiate proactive outreach from the executive retention team.")

        elif risk_level == "MEDIUM":
            priority = "MODERATE"
            summary = "Moderate churn risk. Proactive retention measures advised."
            
            if contract == "Month-to-month":
                actions.append("Send an exclusive offer highlighting savings on long-term commitments.")
            if tech_support == "No":
                actions.append("Promote tech support and device protection security add-ons.")
            if monthly_charges > 85:
                actions.append("Offer a customized streaming/speed bundle to enhance perceived value.")
                
            if not actions:
                actions.append("Enroll customer in periodic loyalty check-in surveys.")

        else: # LOW
            priority = "LOW"
            summary = "Low churn risk. Focus on upselling and relationship strengthening."
            if internet_service == "DSL":
                actions.append("Present Fiber Optic upgrade opportunity when available.")
            actions.append("Keep active on quarterly satisfaction touchpoints.")

        return {
            "priority": priority,
            "summary": summary,
            "action_items": actions
        }

if __name__ == "__main__":
    sample_customer = {
        "gender": "Female",
        "SeniorCitizen": 0,
        "Partner": "No",
        "Dependents": "No",
        "tenure": 3,
        "PhoneService": "Yes",
        "MultipleLines": "No",
        "InternetService": "Fiber optic",
        "OnlineSecurity": "No",
        "OnlineBackup": "No",
        "DeviceProtection": "No",
        "TechSupport": "No",
        "StreamingTV": "Yes",
        "StreamingMovies": "Yes",
        "Contract": "Month-to-month",
        "PaperlessBilling": "Yes",
        "PaymentMethod": "Electronic check",
        "MonthlyCharges": 89.85,
        "TotalCharges": 269.55
    }
    
    predictor = ChurnPredictor()
    if predictor.is_ready():
        res = predictor.predict(sample_customer)
        print("Prediction result:", res)
    else:
        print("Predictor is not ready yet (train model first).")
