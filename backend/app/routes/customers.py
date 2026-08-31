from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, or_
from typing import Optional, List

from backend.app.database import get_db
from backend.app.models import Customer, Prediction
from backend.app.schemas import (
    CustomerListResponse, CustomerSummary, CustomerDetailResponse, PredictionResponse
)
from backend.app.services.analytics_service import seed_database_from_dataset

router = APIRouter(tags=["Customers"])

@router.get("/customers", response_model=CustomerListResponse)
def list_customers(
    search: Optional[str] = Query(None, description="Search by customer ID"),
    risk_level: Optional[str] = Query(None, description="Filter by risk tier (LOW, MEDIUM, HIGH)"),
    contract: Optional[str] = Query(None, description="Filter by contract type"),
    internet_service: Optional[str] = Query(None, description="Filter by internet service"),
    page: int = Query(1, ge=1),
    page_size: int = Query(15, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Lists customers with searching, filtering, and pagination."""
    query = db.query(Customer)

    # Initial seeding if completely empty
    if query.count() == 0:
        seed_database_from_dataset(db, limit=500)
        query = db.query(Customer)

    if search:
        query = query.filter(Customer.customer_id.ilike(f"%{search.strip()}%"))
    if contract:
        query = query.filter(Customer.contract == contract)
    if internet_service:
        query = query.filter(Customer.internet_service == internet_service)

    total_count = query.count()
    offset = (page - 1) * page_size
    customers_db = query.order_by(desc(Customer.created_at)).offset(offset).limit(page_size).all()

    summary_list = []
    for c in customers_db:
        latest_pred = c.predictions[0] if c.predictions else None
        
        # If filtering by risk level, check latest prediction
        if risk_level and (not latest_pred or latest_pred.risk_level != risk_level.upper()):
            continue

        summary_list.append(
            CustomerSummary(
                id=c.id,
                customer_id=c.customer_id,
                gender=c.gender,
                senior_citizen=c.senior_citizen or 0,
                tenure=c.tenure or 0,
                contract=c.contract,
                internet_service=c.internet_service,
                monthly_charges=c.monthly_charges or 0.0,
                total_charges=c.total_charges or 0.0,
                latest_prediction=latest_pred.prediction if latest_pred else ("CHURN" if c.actual_churn == 1 else "STAY" if c.actual_churn == 0 else None),
                latest_probability=latest_pred.churn_probability if latest_pred else (0.85 if c.actual_churn == 1 else 0.15 if c.actual_churn == 0 else None),
                latest_risk_level=latest_pred.risk_level if latest_pred else ("HIGH" if c.actual_churn == 1 else "LOW" if c.actual_churn == 0 else None),
                created_at=c.created_at
            )
        )

    return CustomerListResponse(
        total=total_count,
        page=page,
        page_size=page_size,
        customers=summary_list
    )

@router.get("/customers/{customer_id}", response_model=CustomerDetailResponse)
def get_customer_details(
    customer_id: str,
    db: Session = Depends(get_db)
):
    """Retrieves full profile, metrics, and prediction history for a single customer."""
    # Search by customer_id string or integer PK
    customer = None
    if customer_id.isdigit():
        customer = db.query(Customer).filter(Customer.id == int(customer_id)).first()
    if not customer:
        customer = db.query(Customer).filter(Customer.customer_id == customer_id).first()

    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Customer '{customer_id}' not found."
        )

    pred_responses = []
    for p in customer.predictions:
        factors = [
            {
                "feature": f.feature,
                "feature_label": f.feature_label or f.feature,
                "shap_value": f.shap_value,
                "impact": f.impact,
                "abs_impact": f.abs_impact
            } for f in p.factors
        ]
        pred_responses.append(
            PredictionResponse(
                id=p.id,
                customer_id=customer.customer_id,
                churn_probability=p.churn_probability,
                prediction=p.prediction,
                risk_level=p.risk_level,
                top_factors=factors,
                recommendation={
                    "priority": "URGENT" if p.risk_level == "HIGH" else "MODERATE" if p.risk_level == "MEDIUM" else "LOW",
                    "summary": p.retention_summary or "",
                    "action_items": p.retention_actions or []
                },
                model_name="XGBoost Classifier",
                model_version=p.model_version or "1.0.0",
                created_at=p.created_at
            )
        )

    return CustomerDetailResponse(
        id=customer.id,
        customer_id=customer.customer_id,
        gender=customer.gender,
        senior_citizen=customer.senior_citizen or 0,
        partner=customer.partner,
        dependents=customer.dependents,
        tenure=customer.tenure or 0,
        phone_service=customer.phone_service,
        multiple_lines=customer.multiple_lines,
        internet_service=customer.internet_service,
        online_security=customer.online_security,
        online_backup=customer.online_backup,
        device_protection=customer.device_protection,
        tech_support=customer.tech_support,
        streaming_tv=customer.streaming_tv,
        streaming_movies=customer.streaming_movies,
        contract=customer.contract,
        paperless_billing=customer.paperless_billing,
        payment_method=customer.payment_method,
        monthly_charges=customer.monthly_charges or 0.0,
        total_charges=customer.total_charges or 0.0,
        actual_churn=customer.actual_churn,
        created_at=customer.created_at,
        predictions=pred_responses
    )

@router.post("/customers/seed")
def trigger_seed_data(
    limit: int = Query(500, ge=10, le=5000),
    db: Session = Depends(get_db)
):
    """Manually triggers seeding customers from the dataset."""
    seed_database_from_dataset(db, limit=limit)
    count = db.query(Customer).count()
    return {"message": f"Seeding complete. Total customers in DB: {count}"}
