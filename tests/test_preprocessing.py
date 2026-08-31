import pytest
import pandas as pd
import numpy as np
from src.preprocessing import clean_raw_data, prepare_train_test_data, ChurnPreprocessor
from src.feature_engineering import create_features

def test_clean_raw_data():
    raw_df = pd.DataFrame({
        "customerID": ["1234-ABCD", "5678-EFGH"],
        "TotalCharges": [" 29.85 ", " "],
        "MonthlyCharges": [29.85, 50.0],
        "tenure": [1, 0],
        "Churn": ["Yes", "No"],
        "SeniorCitizen": [0, 1]
    })
    
    cleaned = clean_raw_data(raw_df)
    assert cleaned["TotalCharges"].iloc[0] == 29.85
    assert cleaned["TotalCharges"].iloc[1] == 0.0  # Imputed for tenure 0
    assert cleaned["Churn"].tolist() == [1, 0]
    assert cleaned["SeniorCitizen"].iloc[0] == "0"

def test_create_features():
    df = pd.DataFrame({
        "tenure": [6, 36],
        "MonthlyCharges": [70.0, 90.0],
        "TotalCharges": [420.0, 3240.0],
        "OnlineSecurity": ["No", "Yes"],
        "OnlineBackup": ["Yes", "Yes"],
        "DeviceProtection": ["No", "Yes"],
        "TechSupport": ["No", "Yes"],
        "StreamingTV": ["No", "Yes"],
        "StreamingMovies": ["No", "Yes"],
        "Contract": ["Month-to-month", "Two year"]
    })
    
    feat_df = create_features(df)
    assert "avg_monthly_spend" in feat_df.columns
    assert "service_count" in feat_df.columns
    assert "tenure_group" in feat_df.columns
    assert "is_long_term_contract" in feat_df.columns
    assert "has_tech_support" in feat_df.columns
    
    assert feat_df["service_count"].iloc[0] == 1
    assert feat_df["service_count"].iloc[1] == 6
    assert feat_df["tenure_group"].iloc[0] == "0-12m"
    assert feat_df["tenure_group"].iloc[1] == "25-48m"
    assert feat_df["is_long_term_contract"].iloc[0] == "0"
    assert feat_df["is_long_term_contract"].iloc[1] == "1"

def test_preprocessor_fit_transform():
    from src.data_loader import generate_synthetic_telco_churn
    df = generate_synthetic_telco_churn(100)
    
    X_train, X_test, y_train, y_test, preprocessor = prepare_train_test_data(df, test_size=0.2)
    
    assert len(X_train) == 80
    assert len(X_test) == 20
    assert X_train.shape[1] == X_test.shape[1]
    assert len(preprocessor.get_feature_names()) == X_train.shape[1]
    assert not np.isnan(X_train).any()
    assert not np.isnan(X_test).any()
