import pandas as pd
import numpy as np
from typing import Union, Dict, Any

def create_features(df: Union[pd.DataFrame, Dict[str, Any]]) -> pd.DataFrame:
    """
    Applies domain-specific feature engineering to customer records.
    Works seamlessly on both pandas DataFrame and dictionary inputs.
    """
    if isinstance(df, dict):
        df = pd.DataFrame([df])
    else:
        df = df.copy()

    # Ensure numeric columns are strictly float/int
    for col in ["tenure", "MonthlyCharges", "TotalCharges"]:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0.0)

    # 1. Average Monthly Spend (historical actual vs expected)
    if "TotalCharges" in df.columns and "tenure" in df.columns:
        df["avg_monthly_spend"] = df["TotalCharges"] / (df["tenure"] + 1)
        df["charge_ratio"] = df["MonthlyCharges"] / (df["TotalCharges"] + 1.0)
    else:
        df["avg_monthly_spend"] = 0.0
        df["charge_ratio"] = 0.0

    # 2. Total active value-added services count
    service_cols = [
        "OnlineSecurity", "OnlineBackup", "DeviceProtection",
        "TechSupport", "StreamingTV", "StreamingMovies"
    ]
    count_services = pd.Series(0, index=df.index)
    for col in service_cols:
        if col in df.columns:
            count_services += (df[col] == "Yes").astype(int)
    df["service_count"] = count_services

    # 3. Tenure Binned Groups
    if "tenure" in df.columns:
        conditions = [
            df["tenure"] <= 12,
            (df["tenure"] > 12) & (df["tenure"] <= 24),
            (df["tenure"] > 24) & (df["tenure"] <= 48),
            (df["tenure"] > 48) & (df["tenure"] <= 60),
            df["tenure"] > 60
        ]
        choices = ["0-12m", "13-24m", "25-48m", "49-60m", ">60m"]
        df["tenure_group"] = np.select(conditions, choices, default="0-12m")
    else:
        df["tenure_group"] = "0-12m"

    # 4. Long-term contract binary indicator
    if "Contract" in df.columns:
        df["is_long_term_contract"] = df["Contract"].isin(["One year", "Two year"]).astype(int).astype(str)
    else:
        df["is_long_term_contract"] = "0"

    # 5. Dedicated Tech Support indicator
    if "TechSupport" in df.columns:
        df["has_tech_support"] = (df["TechSupport"] == "Yes").astype(int).astype(str)
    else:
        df["has_tech_support"] = "0"

    return df
