from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
from datetime import datetime

class CustomerInput(BaseModel):
    customer_id: Optional[str] = Field(None, description="Optional custom customer ID. Auto-generated if not provided.")
    gender: str = Field("Female", description="Gender (Male, Female)")
    SeniorCitizen: int = Field(0, description="Senior citizen indicator (0 or 1)")
    Partner: str = Field("No", description="Partner status (Yes, No)")
    Dependents: str = Field("No", description="Dependents status (Yes, No)")
    tenure: int = Field(1, ge=0, le=120, description="Number of months customer has been with company")
    PhoneService: str = Field("Yes", description="Phone service (Yes, No)")
    MultipleLines: str = Field("No", description="Multiple lines (Yes, No, No phone service)")
    InternetService: str = Field("Fiber optic", description="Internet service provider (DSL, Fiber optic, No)")
    OnlineSecurity: str = Field("No", description="Online security add-on (Yes, No, No internet service)")
    OnlineBackup: str = Field("No", description="Online backup add-on (Yes, No, No internet service)")
    DeviceProtection: str = Field("No", description="Device protection add-on (Yes, No, No internet service)")
    TechSupport: str = Field("No", description="Tech support add-on (Yes, No, No internet service)")
    StreamingTV: str = Field("Yes", description="Streaming TV (Yes, No, No internet service)")
    StreamingMovies: str = Field("Yes", description="Streaming movies (Yes, No, No internet service)")
    Contract: str = Field("Month-to-month", description="Contract term (Month-to-month, One year, Two year)")
    PaperlessBilling: str = Field("Yes", description="Paperless billing (Yes, No)")
    PaymentMethod: str = Field("Electronic check", description="Payment method")
    MonthlyCharges: float = Field(79.85, ge=0, description="Monthly subscription charges")
    TotalCharges: Optional[float] = Field(None, ge=0, description="Total historical spend (optional, estimated from tenure if omitted)")

class FactorOut(BaseModel):
    feature: str
    feature_label: str
    shap_value: float
    impact: str
    abs_impact: float
    
    model_config = ConfigDict(from_attributes=True)

class RecommendationOut(BaseModel):
    priority: str
    summary: str
    action_items: List[str]

class PredictionResponse(BaseModel):
    id: Optional[int] = None
    customer_id: str
    churn_probability: float
    prediction: str
    risk_level: str
    top_factors: List[FactorOut]
    recommendation: RecommendationOut
    model_name: str
    model_version: str
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class CustomerSummary(BaseModel):
    id: int
    customer_id: str
    gender: Optional[str] = None
    senior_citizen: int = 0
    tenure: int
    contract: Optional[str] = None
    internet_service: Optional[str] = None
    monthly_charges: float
    total_charges: float
    latest_prediction: Optional[str] = None
    latest_probability: Optional[float] = None
    latest_risk_level: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class CustomerListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    customers: List[CustomerSummary]

class CustomerDetailResponse(BaseModel):
    id: int
    customer_id: str
    gender: Optional[str] = None
    senior_citizen: int = 0
    partner: Optional[str] = None
    dependents: Optional[str] = None
    tenure: int
    phone_service: Optional[str] = None
    multiple_lines: Optional[str] = None
    internet_service: Optional[str] = None
    online_security: Optional[str] = None
    online_backup: Optional[str] = None
    device_protection: Optional[str] = None
    tech_support: Optional[str] = None
    streaming_tv: Optional[str] = None
    streaming_movies: Optional[str] = None
    contract: Optional[str] = None
    paperless_billing: Optional[str] = None
    payment_method: Optional[str] = None
    monthly_charges: float
    total_charges: float
    actual_churn: Optional[int] = None
    created_at: datetime
    predictions: List[PredictionResponse] = []

    model_config = ConfigDict(from_attributes=True)

class AnalyticsResponse(BaseModel):
    total_customers: int
    overall_churn_rate: float
    high_risk_count: int
    medium_risk_count: int
    low_risk_count: int
    avg_churn_probability: float
    churn_by_contract: List[Dict[str, Any]]
    churn_by_internet: List[Dict[str, Any]]
    churn_by_tenure: List[Dict[str, Any]]
    churn_by_payment: List[Dict[str, Any]]
    risk_distribution: List[Dict[str, Any]]
    recent_predictions: List[PredictionResponse]

class ModelMetadataResponse(BaseModel):
    model_name: str
    version: str
    training_date: Optional[str] = None
    metrics: Dict[str, float]
    confusion_matrix: Dict[str, Any]
    hyperparameters: Dict[str, Any]
    global_feature_importance: List[Dict[str, Any]]
