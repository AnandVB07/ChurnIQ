import datetime
from sqlalchemy import (
    Column, Integer, String, Float, DateTime, ForeignKey, Text, JSON
)
from sqlalchemy.orm import relationship
from backend.app.database import Base

class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(String(50), unique=True, index=True, nullable=False)
    
    # Profile & Demographics
    gender = Column(String(20), nullable=True)
    senior_citizen = Column(Integer, default=0)
    partner = Column(String(10), nullable=True)
    dependents = Column(String(10), nullable=True)
    
    # Subscription & Services
    tenure = Column(Integer, default=0)
    phone_service = Column(String(10), nullable=True)
    multiple_lines = Column(String(30), nullable=True)
    internet_service = Column(String(30), nullable=True)
    online_security = Column(String(30), nullable=True)
    online_backup = Column(String(30), nullable=True)
    device_protection = Column(String(30), nullable=True)
    tech_support = Column(String(30), nullable=True)
    streaming_tv = Column(String(30), nullable=True)
    streaming_movies = Column(String(30), nullable=True)
    
    # Contract & Billing
    contract = Column(String(30), nullable=True)
    paperless_billing = Column(String(10), nullable=True)
    payment_method = Column(String(50), nullable=True)
    monthly_charges = Column(Float, default=0.0)
    total_charges = Column(Float, default=0.0)
    actual_churn = Column(Integer, nullable=True)  # 0: No, 1: Yes, or None if prospective
    
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

    # Relationships
    predictions = relationship("Prediction", back_populates="customer", cascade="all, delete-orphan", order_by="desc(Prediction.created_at)")

class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    
    churn_probability = Column(Float, nullable=False)
    prediction = Column(String(20), nullable=False)  # "CHURN" or "STAY"
    risk_level = Column(String(20), nullable=False)  # "LOW", "MEDIUM", "HIGH"
    model_version = Column(String(50), default="1.0.0")
    
    # Recommendation metadata
    retention_summary = Column(Text, nullable=True)
    retention_actions = Column(JSON, nullable=True)  # List of action strings
    
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

    # Relationships
    customer = relationship("Customer", back_populates="predictions")
    factors = relationship("PredictionFactor", back_populates="prediction", cascade="all, delete-orphan")

class PredictionFactor(Base):
    __tablename__ = "prediction_factors"

    id = Column(Integer, primary_key=True, index=True)
    prediction_id = Column(Integer, ForeignKey("predictions.id"), nullable=False)
    
    feature = Column(String(100), nullable=False)
    feature_label = Column(String(150), nullable=True)
    shap_value = Column(Float, nullable=False)
    impact = Column(String(50), nullable=False)  # "INCREASES_RISK" or "DECREASES_RISK"
    abs_impact = Column(Float, nullable=False)

    # Relationships
    prediction = relationship("Prediction", back_populates="factors")
