import pytest
from src.config import get_risk_level
from backend.app.services.recommendation_service import build_retention_recommendation

def test_risk_level_mapping():
    assert get_risk_level(0.15) == "LOW"
    assert get_risk_level(0.39) == "LOW"
    assert get_risk_level(0.40) == "MEDIUM"
    assert get_risk_level(0.69) == "MEDIUM"
    assert get_risk_level(0.70) == "HIGH"
    assert get_risk_level(0.95) == "HIGH"

def test_retention_recommendations():
    high_risk_customer = {
        "Contract": "Month-to-month",
        "MonthlyCharges": 95.0,
        "tenure": 2,
        "TechSupport": "No",
        "PaymentMethod": "Electronic check",
        "InternetService": "Fiber optic"
    }
    
    rec = build_retention_recommendation(
        customer=high_risk_customer,
        churn_prob=0.88,
        risk_level="HIGH",
        top_factors=[]
    )
    
    assert rec["priority"] == "URGENT"
    assert len(rec["action_items"]) >= 3
    assert any("annual contract" in action.lower() or "discount" in action.lower() for action in rec["action_items"])
    assert any("tech support" in action.lower() for action in rec["action_items"])

def test_low_risk_recommendation():
    low_risk_customer = {
        "Contract": "Two year",
        "MonthlyCharges": 45.0,
        "tenure": 48,
        "TechSupport": "Yes",
        "PaymentMethod": "Credit card (automatic)",
        "InternetService": "DSL"
    }
    
    rec = build_retention_recommendation(
        customer=low_risk_customer,
        churn_prob=0.12,
        risk_level="LOW",
        top_factors=[]
    )
    
    assert rec["priority"] == "LOW"
    assert len(rec["action_items"]) >= 1
