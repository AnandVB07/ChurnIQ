import pandas as pd
import numpy as np
from typing import Tuple, List, Optional
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
import joblib

from src.config import (
    NUMERICAL_COLS,
    CATEGORICAL_COLS,
    ENGINEERED_NUMERICAL_COLS,
    ENGINEERED_CATEGORICAL_COLS,
    TARGET_COL,
    ID_COL,
    PREPROCESSOR_FILE
)
from src.feature_engineering import create_features

ALL_NUMERICAL = NUMERICAL_COLS + ENGINEERED_NUMERICAL_COLS
ALL_CATEGORICAL = CATEGORICAL_COLS + ENGINEERED_CATEGORICAL_COLS

def clean_raw_data(df: pd.DataFrame) -> pd.DataFrame:
    """
    Cleans raw customer churn dataframe:
    - Strips whitespace from strings
    - Fixes TotalCharges dtype (replaces blank spaces with NaN, then imputes with 0.0 or MonthlyCharges*tenure)
    - Normalizes Churn target to binary 0/1 if present
    """
    df = df.copy()
    
    # Clean whitespace in column names
    df.columns = df.columns.str.strip()
    
    # Clean TotalCharges
    if "TotalCharges" in df.columns:
        df["TotalCharges"] = pd.to_numeric(df["TotalCharges"].astype(str).str.strip(), errors="coerce")
        # For new customers with tenure 0, TotalCharges is 0
        df["TotalCharges"] = df["TotalCharges"].fillna(df["MonthlyCharges"] * df["tenure"]).fillna(0.0)
        
    # Clean SeniorCitizen to string category for consistent encoding
    if "SeniorCitizen" in df.columns:
        df["SeniorCitizen"] = df["SeniorCitizen"].astype(str)
        
    # Normalize Churn target
    if TARGET_COL in df.columns:
        if df[TARGET_COL].dtype == object:
            df[TARGET_COL] = df[TARGET_COL].astype(str).str.strip().map({"Yes": 1, "No": 0, "1": 1, "0": 0})
        df[TARGET_COL] = df[TARGET_COL].fillna(0).astype(int)
        
    return df

def build_preprocessor_pipeline() -> ColumnTransformer:
    """
    Constructs an unfitted Scikit-Learn ColumnTransformer for numerical scaling and categorical one-hot encoding.
    """
    num_pipeline = Pipeline([
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler())
    ])
    
    cat_pipeline = Pipeline([
        ("imputer", SimpleImputer(strategy="constant", fill_value="Missing")),
        ("onehot", OneHotEncoder(handle_unknown="ignore", sparse_output=False))
    ])
    
    preprocessor = ColumnTransformer(
        transformers=[
            ("num", num_pipeline, ALL_NUMERICAL),
            ("cat", cat_pipeline, ALL_CATEGORICAL)
        ],
        remainder="drop"
    )
    return preprocessor

class ChurnPreprocessor:
    """
    Encapsulates feature engineering, column transformation, and feature name extraction.
    """
    def __init__(self):
        self.transformer: ColumnTransformer = build_preprocessor_pipeline()
        self.feature_names: List[str] = []
        self.is_fitted: bool = False
        
    def fit(self, X: pd.DataFrame, y: Optional[pd.Series] = None):
        X_clean = clean_raw_data(X)
        X_feat = create_features(X_clean)
        self.transformer.fit(X_feat)
        self.is_fitted = True
        self._extract_feature_names()
        return self
        
    def transform(self, X: pd.DataFrame) -> np.ndarray:
        if not self.is_fitted:
            raise ValueError("ChurnPreprocessor is not fitted yet. Call fit() first.")
        X_clean = clean_raw_data(X)
        X_feat = create_features(X_clean)
        return self.transformer.transform(X_feat)
        
    def fit_transform(self, X: pd.DataFrame, y: Optional[pd.Series] = None) -> np.ndarray:
        return self.fit(X, y).transform(X)
        
    def _extract_feature_names(self):
        """Extracts the output feature names from the fitted ColumnTransformer."""
        feature_names = []
        try:
            # Scikit-learn >= 1.0 get_feature_names_out
            names = self.transformer.get_feature_names_out()
            feature_names = [n.replace("num__", "").replace("cat__", "") for n in names]
        except Exception:
            # Fallback manual reconstruction
            feature_names.extend(ALL_NUMERICAL)
            cat_encoder = self.transformer.named_transformers_["cat"].named_steps["onehot"]
            cat_cols = ALL_CATEGORICAL
            for col, cats in zip(cat_cols, cat_encoder.categories_):
                for cat in cats:
                    feature_names.append(f"{col}_{cat}")
        self.feature_names = feature_names
        
    def get_feature_names(self) -> List[str]:
        return self.feature_names
        
    def save(self, filepath: Optional[str] = None):
        path = filepath or PREPROCESSOR_FILE
        joblib.dump(self, path)
        print(f"Saved preprocessor to {path}")
        
    @classmethod
    def load(cls, filepath: Optional[str] = None) -> "ChurnPreprocessor":
        path = filepath or PREPROCESSOR_FILE
        obj = joblib.load(path)
        return obj

def prepare_train_test_data(
    df: pd.DataFrame,
    test_size: float = 0.2,
    random_state: int = 42
) -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray, ChurnPreprocessor]:
    """
    Performs train-test split BEFORE preprocessing to strictly prevent data leakage.
    Fits preprocessor solely on training data.
    """
    from sklearn.model_selection import train_test_split
    
    df_clean = clean_raw_data(df)
    
    X = df_clean.drop(columns=[TARGET_COL, ID_COL], errors="ignore")
    y = df_clean[TARGET_COL].values
    
    X_train_df, X_test_df, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=random_state, stratify=y
    )
    
    preprocessor = ChurnPreprocessor()
    X_train = preprocessor.fit_transform(X_train_df)
    X_test = preprocessor.transform(X_test_df)
    
    return X_train, X_test, y_train, y_test, preprocessor
