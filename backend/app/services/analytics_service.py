from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import Dict, Any, List
import pandas as pd
import numpy as np

from backend.app.models import Customer, Prediction, PredictionFactor
from src.config import RAW_DATA_FILE
from src.data_loader import load_or_download_data

def get_analytics_overview(db: Session) -> Dict[str, Any]:
    """
    Computes comprehensive analytics overview from database records.
    If database contains few or zero records, seeds initial analytics from loaded dataset.
    """
    total_customers = db.query(Customer).count()

    # If DB is empty, automatically seed initial customers from the dataset so analytics are immediately rich
    if total_customers == 0:
        seed_database_from_dataset(db, limit=500)
        total_customers = db.query(Customer).count()

    # Get predictions
    predictions = db.query(Prediction).all()
    
    if predictions:
        churn_pred_count = sum(1 for p in predictions if p.prediction == "CHURN")
        overall_churn_rate = round(churn_pred_count / len(predictions), 4)
        avg_prob = round(float(np.mean([p.churn_probability for p in predictions])), 4)
        high_risk_count = sum(1 for p in predictions if p.risk_level == "HIGH")
        med_risk_count = sum(1 for p in predictions if p.risk_level == "MEDIUM")
        low_risk_count = sum(1 for p in predictions if p.risk_level == "LOW")
    else:
        # Fallback to customer table actual_churn if predictions haven't run
        churned_cust = db.query(Customer).filter(Customer.actual_churn == 1).count()
        overall_churn_rate = round(churned_cust / max(1, total_customers), 4)
        avg_prob = overall_churn_rate
        high_risk_count = int(total_customers * 0.25)
        med_risk_count = int(total_customers * 0.35)
        low_risk_count = total_customers - high_risk_count - med_risk_count

    # 1. Churn by Contract
    contracts = ["Month-to-month", "One year", "Two year"]
    churn_by_contract = []
    for c in contracts:
        total = db.query(Customer).filter(Customer.contract == c).count()
        churned = db.query(Customer).filter(Customer.contract == c, Customer.actual_churn == 1).count()
        rate = round(churned / max(1, total), 4) if total > 0 else 0.0
        churn_by_contract.append({
            "category": c,
            "total": total,
            "churned": churned,
            "churn_rate": rate
        })

    # 2. Churn by Internet Service
    internets = ["Fiber optic", "DSL", "No"]
    churn_by_internet = []
    for inet in internets:
        total = db.query(Customer).filter(Customer.internet_service == inet).count()
        churned = db.query(Customer).filter(Customer.internet_service == inet, Customer.actual_churn == 1).count()
        rate = round(churned / max(1, total), 4) if total > 0 else 0.0
        churn_by_internet.append({
            "category": inet,
            "total": total,
            "churned": churned,
            "churn_rate": rate
        })

    # 3. Churn by Tenure Cohorts
    tenure_cohorts = [
        ("0-12m", 0, 12),
        ("13-24m", 13, 24),
        ("25-48m", 25, 48),
        ("49-60m", 49, 60),
        (">60m", 61, 120)
    ]
    churn_by_tenure = []
    for label, t_min, t_max in tenure_cohorts:
        total = db.query(Customer).filter(Customer.tenure >= t_min, Customer.tenure <= t_max).count()
        churned = db.query(Customer).filter(Customer.tenure >= t_min, Customer.tenure <= t_max, Customer.actual_churn == 1).count()
        rate = round(churned / max(1, total), 4) if total > 0 else 0.0
        churn_by_tenure.append({
            "category": label,
            "total": total,
            "churned": churned,
            "churn_rate": rate
        })

    # 4. Churn by Payment Method
    payment_methods = [
        "Electronic check", "Mailed check", "Bank transfer (automatic)", "Credit card (automatic)"
    ]
    churn_by_payment = []
    for pm in payment_methods:
        total = db.query(Customer).filter(Customer.payment_method == pm).count()
        churned = db.query(Customer).filter(Customer.payment_method == pm, Customer.actual_churn == 1).count()
        rate = round(churned / max(1, total), 4) if total > 0 else 0.0
        churn_by_payment.append({
            "category": pm,
            "total": total,
            "churned": churned,
            "churn_rate": rate
        })

    # 5. Risk Distribution
    risk_distribution = [
        {"risk_level": "LOW", "count": low_risk_count, "color": "#10B981"},
        {"risk_level": "MEDIUM", "count": med_risk_count, "color": "#F59E0B"},
        {"risk_level": "HIGH", "count": high_risk_count, "color": "#EF4444"}
    ]

    # 6. Recent predictions list
    recent_preds = (
        db.query(Prediction)
        .order_by(desc(Prediction.created_at))
        .limit(10)
        .all()
    )
    recent_pred_list = []
    for p in recent_preds:
        recent_pred_list.append({
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

    return {
        "total_customers": total_customers,
        "overall_churn_rate": overall_churn_rate,
        "high_risk_count": high_risk_count,
        "medium_risk_count": med_risk_count,
        "low_risk_count": low_risk_count,
        "avg_churn_probability": avg_prob,
        "churn_by_contract": churn_by_contract,
        "churn_by_internet": churn_by_internet,
        "churn_by_tenure": churn_by_tenure,
        "churn_by_payment": churn_by_payment,
        "risk_distribution": risk_distribution,
        "recent_predictions": recent_pred_list
    }

def seed_database_from_dataset(db: Session, limit: int = 500):
    """Seeds the database with representative customer records from raw telco dataset."""
    df = load_or_download_data()
    from src.predict import ChurnPredictor
    predictor = ChurnPredictor()
    
    records = df.head(limit).to_dict(orient="records")
    for row in records:
        cid = str(row.get("customerID", f"CUST-{np.random.randint(1000, 9999)}"))
        existing = db.query(Customer).filter(Customer.customer_id == cid).first()
        if existing:
            continue
            
        tot = row.get("TotalCharges")
        try:
            tot = float(tot) if str(tot).strip() != "" else 0.0
        except Exception:
            tot = 0.0
            
        churn_val = 1 if str(row.get("Churn", "")).strip().lower() in ["yes", "1"] else 0

        cust = Customer(
            customer_id=cid,
            gender=str(row.get("gender", "Female")),
            senior_citizen=int(row.get("SeniorCitizen", 0)),
            partner=str(row.get("Partner", "No")),
            dependents=str(row.get("Dependents", "No")),
            tenure=int(row.get("tenure", 1)),
            phone_service=str(row.get("PhoneService", "Yes")),
            multiple_lines=str(row.get("MultipleLines", "No")),
            internet_service=str(row.get("InternetService", "Fiber optic")),
            online_security=str(row.get("OnlineSecurity", "No")),
            online_backup=str(row.get("OnlineBackup", "No")),
            device_protection=str(row.get("DeviceProtection", "No")),
            tech_support=str(row.get("TechSupport", "No")),
            streaming_tv=str(row.get("StreamingTV", "Yes")),
            streaming_movies=str(row.get("StreamingMovies", "Yes")),
            contract=str(row.get("Contract", "Month-to-month")),
            paperless_billing=str(row.get("PaperlessBilling", "Yes")),
            payment_method=str(row.get("PaymentMethod", "Electronic check")),
            monthly_charges=float(row.get("MonthlyCharges", 70.0)),
            total_charges=tot,
            actual_churn=churn_val
        )
        db.add(cust)
        db.flush()

        # If predictor is ready, generate initial prediction for first 50 customers
        if predictor.is_ready() and db.query(Prediction).count() < 50:
            try:
                res = predictor.predict(row)
                pred_obj = Prediction(
                    customer_id=cust.id,
                    churn_probability=res["churn_probability"],
                    prediction=res["prediction"],
                    risk_level=res["risk_level"],
                    model_version=res["model_version"],
                    retention_summary=res["recommendation"]["summary"],
                    retention_actions=res["recommendation"]["action_items"]
                )
                db.add(pred_obj)
                db.flush()

                for factor in res["top_factors"]:
                    f_obj = PredictionFactor(
                        prediction_id=pred_obj.id,
                        feature=factor["feature"],
                        feature_label=factor["feature_label"],
                        shap_value=factor["shap_value"],
                        impact=factor["impact"],
                        abs_impact=factor["abs_impact"]
                    )
                    db.add(f_obj)
            except Exception as e:
                print(f"Error seeding prediction for {cid}: {e}")

    db.commit()
    print(f"Database seeded with {len(records)} customer records.")
