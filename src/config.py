import os
from pathlib import Path
from typing import Dict, List

# Base Directories
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
RAW_DATA_DIR = DATA_DIR / "raw"
PROCESSED_DATA_DIR = DATA_DIR / "processed"
MODELS_DIR = BASE_DIR / "models"
MLRUNS_DIR = BASE_DIR / "mlruns"

# File Paths
RAW_DATA_FILE = RAW_DATA_DIR / "telco_churn.csv"
PROCESSED_TRAIN_FILE = PROCESSED_DATA_DIR / "train_processed.csv"
PROCESSED_TEST_FILE = PROCESSED_DATA_DIR / "test_processed.csv"

BEST_MODEL_FILE = MODELS_DIR / "best_model.pkl"
PREPROCESSOR_FILE = MODELS_DIR / "preprocessor.pkl"
MODEL_METADATA_FILE = MODELS_DIR / "model_metadata.json"

# Ensure directories exist
RAW_DATA_DIR.mkdir(parents=True, exist_ok=True)
PROCESSED_DATA_DIR.mkdir(parents=True, exist_ok=True)
MODELS_DIR.mkdir(parents=True, exist_ok=True)

# Dataset Configuration
TARGET_COL = "Churn"
ID_COL = "customerID"

NUMERICAL_COLS: List[str] = [
    "tenure",
    "MonthlyCharges",
    "TotalCharges"
]

CATEGORICAL_COLS: List[str] = [
    "gender",
    "SeniorCitizen",
    "Partner",
    "Dependents",
    "PhoneService",
    "MultipleLines",
    "InternetService",
    "OnlineSecurity",
    "OnlineBackup",
    "DeviceProtection",
    "TechSupport",
    "StreamingTV",
    "StreamingMovies",
    "Contract",
    "PaperlessBilling",
    "PaymentMethod"
]

ENGINEERED_NUMERICAL_COLS: List[str] = [
    "avg_monthly_spend",
    "charge_ratio",
    "service_count"
]

ENGINEERED_CATEGORICAL_COLS: List[str] = [
    "tenure_group",
    "is_long_term_contract",
    "has_tech_support"
]

# Business Risk Thresholds (Configurable)
RISK_THRESHOLDS: Dict[str, float] = {
    "LOW_MAX": 0.39,
    "MEDIUM_MAX": 0.69
}

def get_risk_level(probability: float) -> str:
    """Classifies churn probability into business risk tier."""
    if probability <= RISK_THRESHOLDS["LOW_MAX"]:
        return "LOW"
    elif probability <= RISK_THRESHOLDS["MEDIUM_MAX"]:
        return "MEDIUM"
    else:
        return "HIGH"

# Database Configuration (Environment variable with SQLite fallback)
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    f"sqlite:///{BASE_DIR / 'churn_system.db'}"
)

# MLflow Configuration (SQLite tracking store)
MLFLOW_DB_FILE = BASE_DIR / "mlflow.db"
MLFLOW_TRACKING_URI = os.getenv("MLFLOW_TRACKING_URI", f"sqlite:///{MLFLOW_DB_FILE.as_posix()}")
MLFLOW_EXPERIMENT_NAME = "Customer_Churn_Prediction"
