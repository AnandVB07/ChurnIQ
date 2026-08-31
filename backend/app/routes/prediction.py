from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List
import numpy as np
import datetime

from backend.app.database import get_db
from backend.app.models import Customer, Prediction, PredictionFactor
from backend.app.schemas import CustomerInput, PredictionResponse, FactorOut, RecommendationOut
from backend.app.services.prediction_service import get_prediction_service

router = APIRouter(tags=["Prediction"])

@router.post("/predict", response_model=PredictionResponse, status_code=status.HTTP_200_OK)
def predict_customer_churn(
    input_data: CustomerInput,
    db: Session = Depends(get_db)
):
    """
    Predicts churn probability, risk level, SHAP factor attribution,
    and targeted retention actions for a customer record.
    Saves customer and prediction to database.
    """
    predictor = get_prediction_service()
    if not predictor.is_ready():
        # Attempt reloading in case model was trained recently
        predictor.load_artifacts()
        if not predictor.is_ready():
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Model artifacts are not loaded. Please train the model via 'python -m src.train' first."
            )

    # Convert Pydantic input to dict for model
    data_dict = input_data.model_dump()
    
    # Calculate TotalCharges if omitted
    if data_dict.get("TotalCharges") is None:
        data_dict["TotalCharges"] = round(data_dict["MonthlyCharges"] * max(1, data_dict["tenure"]), 2)

    # Run ML prediction pipeline with SHAP & recommendation engine
    try:
        result = predictor.predict(data_dict)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prediction failed: {str(e)}"
        )

    # Generate customer ID if missing
    cust_id_str = input_data.customer_id
    if not cust_id_str or cust_id_str.strip() == "":
        cust_id_str = f"CUST-{np.random.randint(10000, 99999)}"

    # Find or create customer record
    customer = db.query(Customer).filter(Customer.customer_id == cust_id_str).first()
    if not customer:
        customer = Customer(
            customer_id=cust_id_str,
            gender=input_data.gender,
            senior_citizen=input_data.SeniorCitizen,
            partner=input_data.Partner,
            dependents=input_data.Dependents,
            tenure=input_data.tenure,
            phone_service=input_data.PhoneService,
            multiple_lines=input_data.MultipleLines,
            internet_service=input_data.InternetService,
            online_security=input_data.OnlineSecurity,
            online_backup=input_data.OnlineBackup,
            device_protection=input_data.DeviceProtection,
            tech_support=input_data.TechSupport,
            streaming_tv=input_data.StreamingTV,
            streaming_movies=input_data.StreamingMovies,
            contract=input_data.Contract,
            paperless_billing=input_data.PaperlessBilling,
            payment_method=input_data.PaymentMethod,
            monthly_charges=input_data.MonthlyCharges,
            total_charges=data_dict["TotalCharges"]
        )
        db.add(customer)
        db.flush()
    else:
        # Update existing customer attributes
        customer.tenure = input_data.tenure
        customer.contract = input_data.Contract
        customer.monthly_charges = input_data.MonthlyCharges
        customer.total_charges = data_dict["TotalCharges"]
        customer.tech_support = input_data.TechSupport
        customer.internet_service = input_data.InternetService
        customer.payment_method = input_data.PaymentMethod

    # Save Prediction
    pred_record = Prediction(
        customer_id=customer.id,
        churn_probability=result["churn_probability"],
        prediction=result["prediction"],
        risk_level=result["risk_level"],
        model_version=result["model_version"],
        retention_summary=result["recommendation"]["summary"],
        retention_actions=result["recommendation"]["action_items"]
    )
    db.add(pred_record)
    db.flush()

    # Save Top Factors
    for f in result["top_factors"]:
        factor_record = PredictionFactor(
            prediction_id=pred_record.id,
            feature=f["feature"],
            feature_label=f["feature_label"],
            shap_value=f["shap_value"],
            impact=f["impact"],
            abs_impact=f["abs_impact"]
        )
        db.add(factor_record)

    db.commit()
    db.refresh(pred_record)

    return {
        "id": pred_record.id,
        "customer_id": cust_id_str,
        "churn_probability": result["churn_probability"],
        "prediction": result["prediction"],
        "risk_level": result["risk_level"],
        "top_factors": result["top_factors"],
        "recommendation": result["recommendation"],
        "model_name": result["model_name"],
        "model_version": result["model_version"],
        "created_at": pred_record.created_at
    }

@router.get("/predictions", response_model=List[PredictionResponse])
def list_predictions(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """Retrieves recent predictions ordered chronologically."""
    predictions = (
        db.query(Prediction)
        .order_by(desc(Prediction.created_at))
        .offset(offset)
        .limit(limit)
        .all()
    )
    
    out = []
    for p in predictions:
        out.append({
            "id": p.id,
            "customer_id": p.customer.customer_id if p.customer else f"CUST-{p.customer_id}",
            "churn_probability": p.churn_probability,
            "prediction": p.prediction,
            "risk_level": p.risk_level,
            "top_factors": [
                {
                    "feature": f.feature,
                    "feature_label": f.feature_label or f.feature,
                    "shap_value": f.shap_value,
                    "impact": f.impact,
                    "abs_impact": f.abs_impact
                } for f in p.factors
            ],
            "recommendation": {
                "priority": "URGENT" if p.risk_level == "HIGH" else "MODERATE" if p.risk_level == "MEDIUM" else "LOW",
                "summary": p.retention_summary or "",
                "action_items": p.retention_actions or []
            },
            "model_name": "XGBoost Classifier",
            "model_version": p.model_version or "1.0.0",
            "created_at": p.created_at
        })
    return out
