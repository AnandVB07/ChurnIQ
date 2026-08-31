import os
import joblib
import pandas as pd
import numpy as np
from typing import Dict, Any, Tuple
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier
from sklearn.model_selection import GridSearchCV
import mlflow
import mlflow.sklearn
import mlflow.xgboost

from src.config import (
    BEST_MODEL_FILE,
    PREPROCESSOR_FILE,
    MODEL_METADATA_FILE,
    MLFLOW_TRACKING_URI,
    MLFLOW_EXPERIMENT_NAME,
    MODELS_DIR
)
from src.data_loader import load_or_download_data
from src.preprocessing import prepare_train_test_data, ChurnPreprocessor
from src.evaluate import evaluate_model, save_model_metadata
from src.explain import ShapExplainerService

def train_and_compare_models(
    X_train: np.ndarray,
    y_train: np.ndarray,
    X_test: np.ndarray,
    y_test: np.ndarray,
    feature_names: list
) -> Tuple[Any, str, Dict[str, Any], Dict[str, Any]]:
    """
    Trains multiple candidate models, compares their test metrics,
    logs results to MLflow, and selects the optimal model.
    """
    # Calculate positive weight ratio for XGBoost
    neg_count = np.sum(y_train == 0)
    pos_count = np.sum(y_train == 1)
    scale_pos_weight = float(neg_count / max(1, pos_count))
    
    models = {
        "Logistic Regression": LogisticRegression(
            class_weight="balanced",
            max_iter=1000,
            random_state=42
        ),
        "Decision Tree": DecisionTreeClassifier(
            class_weight="balanced",
            max_depth=6,
            min_samples_split=20,
            random_state=42
        ),
        "Random Forest": RandomForestClassifier(
            class_weight="balanced",
            n_estimators=150,
            max_depth=8,
            min_samples_split=10,
            random_state=42
        ),
        "XGBoost": XGBClassifier(
            scale_pos_weight=scale_pos_weight,
            n_estimators=150,
            max_depth=4,
            learning_rate=0.05,
            subsample=0.8,
            colsample_bytree=0.8,
            eval_metric="logloss",
            random_state=42
        )
    }

    # Setup MLflow
    try:
        mlflow.set_tracking_uri(MLFLOW_TRACKING_URI)
        mlflow.set_experiment(MLFLOW_EXPERIMENT_NAME)
    except Exception as e:
        print(f"MLflow setup notice: {e}")

    results = {}
    fitted_models = {}

    print("\n" + "="*50)
    print("STARTING MODEL COMPARISON & TRAINING")
    print("="*50)

    for name, model in models.items():
        print(f"\nTraining candidate model: {name}...")
        model.fit(X_train, y_train)
        fitted_models[name] = model
        
        meta = evaluate_model(
            model=model,
            X_test=X_test,
            y_test=y_test,
            model_name=name,
            feature_names=feature_names,
            hyperparameters=model.get_params() if hasattr(model, "get_params") else {}
        )
        results[name] = meta
        
        m = meta["metrics"]
        print(f"  [{name}] -> Accuracy: {m['accuracy']:.4f} | Recall: {m['recall']:.4f} | Precision: {m['precision']:.4f} | F1: {m['f1']:.4f} | ROC-AUC: {m['roc_auc']:.4f}")

        # Log run to MLflow
        try:
            with mlflow.start_run(run_name=name):
                mlflow.log_param("model_type", name)
                if hasattr(model, "get_params"):
                    for k, v in model.get_params().items():
                        if isinstance(v, (int, float, str, bool)):
                            mlflow.log_param(k, v)
                for metric_name, val in m.items():
                    mlflow.log_metric(metric_name, val)
        except Exception as e:
            print(f"  Notice: MLflow logging skipped: {e}")

    # Hyperparameter tuning on XGBoost
    print("\n" + "-"*50)
    print("PERFORMING HYPERPARAMETER TUNING ON XGBOOST (GridSearchCV)")
    print("-"*50)
    param_grid = {
        "max_depth": [3, 4, 5],
        "learning_rate": [0.03, 0.08],
        "n_estimators": [100, 200],
        "subsample": [0.8, 1.0]
    }
    xgb_base = XGBClassifier(
        scale_pos_weight=scale_pos_weight,
        eval_metric="logloss",
        random_state=42
    )
    grid_search = GridSearchCV(
        xgb_base,
        param_grid,
        scoring="roc_auc",
        cv=3,
        n_jobs=-1,
        verbose=0
    )
    grid_search.fit(X_train, y_train)
    best_xgb = grid_search.best_estimator_
    print(f"Best XGBoost Params: {grid_search.best_params_}")
    
    tuned_meta = evaluate_model(
        model=best_xgb,
        X_test=X_test,
        y_test=y_test,
        model_name="Tuned XGBoost",
        feature_names=feature_names,
        hyperparameters=grid_search.best_params_
    )
    results["Tuned XGBoost"] = tuned_meta
    fitted_models["Tuned XGBoost"] = best_xgb
    
    tm = tuned_meta["metrics"]
    print(f"  [Tuned XGBoost] -> Accuracy: {tm['accuracy']:.4f} | Recall: {tm['recall']:.4f} | Precision: {tm['precision']:.4f} | F1: {tm['f1']:.4f} | ROC-AUC: {tm['roc_auc']:.4f}")

    # Select Best Model based on ROC-AUC + Recall harmonic mean / ROC-AUC
    best_name = max(results.keys(), key=lambda k: results[k]["metrics"]["roc_auc"])
    best_model = fitted_models[best_name]
    best_meta = results[best_name]

    print("\n" + "="*50)
    print(f"SELECTED BEST MODEL: {best_name} (ROC-AUC: {best_meta['metrics']['roc_auc']:.4f})")
    print("="*50)

    return best_model, best_name, best_meta, results

def run_pipeline() -> Dict[str, Any]:
    """
    Executes the entire end-to-end ML training and artifact generation pipeline.
    """
    print("Step 1: Ingesting dataset...")
    df = load_or_download_data()

    print("Step 2: Preprocessing and train/test splitting (strictly avoiding data leakage)...")
    X_train, X_test, y_train, y_test, preprocessor = prepare_train_test_data(df)
    feature_names = preprocessor.get_feature_names()
    print(f"Generated {len(feature_names)} features for modeling.")

    # Save Preprocessor
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    preprocessor.save(PREPROCESSOR_FILE)

    print("Step 3: Training and comparing models...")
    best_model, best_name, best_meta, all_results = train_and_compare_models(
        X_train, y_train, X_test, y_test, feature_names
    )

    print("Step 4: Computing SHAP Global Feature Importance...")
    try:
        sample_size = min(200, len(X_test))
        X_sample = X_test[:sample_size]
        explainer = ShapExplainerService(best_model, feature_names)
        global_importance = explainer.compute_global_importance(X_sample, top_k=20)
        best_meta["global_feature_importance"] = global_importance
        print(f"Extracted {len(global_importance)} global SHAP importance ranks.")
    except Exception as e:
        print(f"Notice: SHAP calculation warning: {e}")
        best_meta["global_feature_importance"] = []

    print("Step 5: Persisting best model and metadata...")
    joblib.dump(best_model, BEST_MODEL_FILE)
    save_model_metadata(best_meta, MODEL_METADATA_FILE)

    print("\nML Pipeline successfully completed! Artifacts saved in 'models/'.")
    return {
        "best_model_name": best_name,
        "metrics": best_meta["metrics"],
        "all_results": {k: v["metrics"] for k, v in all_results.items()}
    }

if __name__ == "__main__":
    run_pipeline()
