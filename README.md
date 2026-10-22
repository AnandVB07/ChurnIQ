# ChurnIQ — Customer Churn Intelligence & Retention Platform

[![FastAPI](https://img.shields.io/badge/FastAPI-0.111.0-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat&logo=react&logoColor=black)](https://reactjs.org)
[![XGBoost](https://img.shields.io/badge/XGBoost-3.4.1-EB392E?style=flat)](https://xgboost.ai)
[![SHAP](https://img.shields.io/badge/SHAP-TreeExplainer-FF6F00?style=flat)](https://shap.readthedocs.io)
[![MLflow](https://img.shields.io/badge/MLflow-Tracking-0194E2?style=flat&logo=mlflow&logoColor=white)](https://mlflow.org)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat&logo=docker&logoColor=white)](https://docker.com)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

An enterprise-grade Customer Churn Prediction & Retention Intelligence System. The platform predicts customer attrition risk using tuned gradient boosted decision trees (XGBoost), calculates calibrated churn probabilities, classifies business risk tiers, generates local and global feature attributions via SHAP TreeExplainer, and delivers targeted business retention interventions.

---

## System Architecture

```
                                 ┌─────────────────────────┐
                                 │     React Dashboard     │
                                 │  (Vite + Tailwind CSS)  │
                                 └────────────┬────────────┘
                                              │ HTTP / JSON
                                              ▼
                                 ┌─────────────────────────┐
                                 │      FastAPI REST       │
                                 │    Prediction Engine    │
                                 └────────────┬────────────┘
                                              │
                      ┌───────────────────────┴───────────────────────┐
                      ▼                                               ▼
         ┌─────────────────────────┐                     ┌─────────────────────────┐
         │  PostgreSQL / SQLAlchemy│                     │    Scikit-Learn / SHAP  │
         │  • Customers            │                     │  • Preprocessor (pkl)   │
         │  • Predictions          │                     │  • Tuned XGBoost (pkl)  │
         │  • Prediction Factors   │                     │  • TreeExplainer Engine │
         └─────────────────────────┘                     └─────────────────────────┘
```

---

## Core Product Workflow

1. **Customer Ingestion & Validation**: Raw profile attributes (demographics, tenure, contracts, subscribed services, monthly/total spend) are validated via Pydantic schemas.
2. **Feature Engineering**: Calculates domain features including `avg_monthly_spend`, `charge_ratio`, `service_count`, and `tenure_group`.
3. **Leakage-Free Preprocessing**: Applies the fitted Scikit-Learn `ColumnTransformer` with median imputation, `StandardScaler`, and `OneHotEncoder`.
4. **XGBoost Inference**: Evaluates calibrated churn probability $P(\text{Churn} = 1)$ and assigns binary classification.
5. **Business Risk Tiering**: Maps probabilities into configurable risk tiers:
   - **LOW**: $P \le 0.39$
   - **MEDIUM**: $0.40 \le P \le 0.69$
   - **HIGH**: $P \ge 0.70$
6. **Local SHAP Attribution**: Computes exact Shapley values to pinpoint top factors pushing risk up or down for each customer.
7. **Retention Recommendation Engine**: Translates risk level and driving factors into targeted business interventions.
8. **Relational Persistence**: Saves customer profile, prediction score, and attribution factors to PostgreSQL.
9. **Interactive Dashboard**: Displays gauges, factor breakdowns, cohort analyses, and real-time streams.

---

## Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Machine Learning** | Python 3.11+, Scikit-Learn, XGBoost, SHAP, Imbalanced-Learn, Pandas, NumPy, Joblib |
| **Backend REST API** | FastAPI, Uvicorn, Pydantic V2, SQLAlchemy, Psycopg2, SQLite (Local Fallback) |
| **Database** | PostgreSQL 15 (Docker) / SQLite3 (Zero-setup local development) |
| **Frontend UI** | React 18, Vite, Tailwind CSS (Electric Violet Theme), Lucide React, Recharts, Axios |
| **MLOps & Tracking** | MLflow Experiment Tracking, Model Registry Metadata |
| **Testing & CI** | Pytest, FastAPI TestClient, Vite Production Builder |
| **Containerization** | Docker, Docker Compose, Multi-stage Nginx Build |

---

## Folder Structure

```
customer-churn-intelligence/
├── data/
│   ├── raw/
│   │   └── telco_churn.csv            # 7,043 Telco Customer Churn dataset
│   ├── processed/
│   └── README.md                      # Feature dictionary and data documentation
│
├── notebooks/
│   ├── 01_data_understanding.ipynb    # Ingestion & distribution inspection
│   ├── 02_eda.ipynb                   # Exploratory data analysis & visualizations
│   ├── 03_preprocessing.ipynb         # Leakage-free transformations & pipelines
│   ├── 04_model_training.ipynb        # Multi-model training & comparison
│   ├── 05_model_evaluation.ipynb      # Metrics, ROC-AUC, confusion matrices
│   └── 06_shap_explainability.ipynb   # SHAP Waterfall & feature importance
│
├── src/
│   ├── __init__.py
│   ├── config.py                      # Global paths, risk thresholds, MLflow config
│   ├── data_loader.py                 # Automated download & synthetic fallback
│   ├── preprocessing.py               # ColumnTransformer & ChurnPreprocessor
│   ├── feature_engineering.py         # Domain features & spend ratios
│   ├── train.py                       # Comparison, tuning, MLflow logging, export
│   ├── evaluate.py                    # Metric calculation & metadata persistence
│   ├── predict.py                     # ChurnPredictor inference service
│   └── explain.py                     # ShapExplainerService wrapper
│
├── models/
│   ├── best_model.pkl                 # Serialized Tuned XGBoost model
│   ├── preprocessor.pkl               # Serialized ColumnTransformer pipeline
│   └── model_metadata.json            # Evaluated test metrics, confusion matrix & SHAP
│
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                    # FastAPI app, CORS, lifespan startup loader
│   │   ├── database.py                # SQLAlchemy engine & session maker
│   │   ├── models.py                  # Customer, Prediction, PredictionFactor models
│   │   ├── schemas.py                 # Pydantic validation schemas
│   │   ├── services/
│   │   │   ├── prediction_service.py  # Singleton ML artifact manager
│   │   │   ├── shap_service.py        # Instance SHAP computation
│   │   │   ├── recommendation_service.py # Business retention rules engine
│   │   │   └── analytics_service.py   # Aggregates & database seeder
│   │   └── routes/
│   │       ├── health.py              # GET /api/health
│   │       ├── prediction.py          # POST /api/predict, GET /api/predictions
│   │       ├── customers.py           # GET /api/customers, GET /api/customers/{id}
│   │       └── analytics.py           # GET /api/analytics, GET /api/model/metadata
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/                # MetricCard, RiskBadge, ProbabilityGauge, ShapFactorBar
│   │   ├── pages/                     # Dashboard, Predict, Explorer, Details, Analytics, ModelInsights
│   │   ├── layouts/                   # AppLayout with sidebar & header
│   │   ├── services/                  # api.js (Axios layer)
│   │   ├── context/                   # ThemeContext (Dark/Light toggle)
│   │   └── styles/                    # index.css (Electric Violet CSS variables)
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── Dockerfile
│
├── tests/
│   ├── conftest.py
│   ├── test_preprocessing.py          # Transformers & leakage checks
│   ├── test_prediction.py             # Risk levels & recommendation logic
│   └── test_api.py                    # FastAPI endpoint tests
│
├── Dockerfile                         # Backend container definition
├── docker-compose.yml                 # Full stack orchestration (DB, API, UI)
├── requirements.txt                   # Root Python dependencies
├── pytest.ini
├── .env.example
├── .gitignore
└── README.md
```

---

## Installation & Local Development

### 1. Clone & Setup Python Virtual Environment
```bash
git clone https://github.com/your-username/customer-churn-intelligence.git
cd customer-churn-intelligence

python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt -r requirements-dev.txt
```

### 2. Train Models & Generate Artifacts
Run the end-to-end training pipeline to download data, train and compare models, run hyperparameter tuning via GridSearchCV, and export serialized artifacts:
```bash
python -m src.train
```

### 3. Run Backend API Server
```bash
uvicorn backend.app.main:app --reload --port 8000
```
- API Documentation (Swagger UI): `http://127.0.0.1:8000/docs`
- Health Check: `http://127.0.0.1:8000/api/health`

### 4. Run React Frontend
In a new terminal:
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## Docker Deployment

To launch the full production environment (PostgreSQL 15, FastAPI Backend, and Nginx React Frontend):

```bash
docker compose up --build
```
- Frontend UI: `http://localhost:3000`
- Backend API: `http://localhost:8000/docs`
- PostgreSQL: `localhost:5432`

---

## API Reference

### Health Check
- `GET /api/health`
  - Verifies database connectivity and confirms whether serialized ML models are loaded into memory.

### Predictive Inference
- `POST /api/predict`
  - Accepts customer attributes, calculates churn probability, predicts class, classifies risk tier, extracts top 5 SHAP factors, generates retention recommendation, and saves record.
```json
{
  "gender": "Female",
  "SeniorCitizen": 0,
  "Partner": "No",
  "Dependents": "No",
  "tenure": 3,
  "PhoneService": "Yes",
  "MultipleLines": "No",
  "InternetService": "Fiber optic",
  "OnlineSecurity": "No",
  "OnlineBackup": "No",
  "DeviceProtection": "No",
  "TechSupport": "No",
  "StreamingTV": "Yes",
  "StreamingMovies": "Yes",
  "Contract": "Month-to-month",
  "PaperlessBilling": "Yes",
  "PaymentMethod": "Electronic check",
  "MonthlyCharges": 89.85,
  "TotalCharges": 269.55
}
```
**Response Sample**:
```json
{
  "id": 1,
  "customer_id": "CUST-48291",
  "churn_probability": 0.8241,
  "prediction": "CHURN",
  "risk_level": "HIGH",
  "top_factors": [
    {
      "feature": "Contract_Month-to-month",
      "feature_label": "Month-to-Month Contract",
      "shap_value": 0.6807,
      "impact": "INCREASES_RISK",
      "abs_impact": 0.6807
    },
    {
      "feature": "charge_ratio",
      "feature_label": "Monthly-to-Total Spend Ratio",
      "shap_value": 0.3609,
      "impact": "INCREASES_RISK",
      "abs_impact": 0.3609
    }
  ],
  "recommendation": {
    "priority": "URGENT",
    "summary": "High churn risk detected. Immediate proactive intervention required.",
    "action_items": [
      "Offer a 15% discount on an annual contract lock-in plan.",
      "Review billing plan and propose a tailored bundle or loyalty rate.",
      "Assign a dedicated customer success specialist for an onboarding health check.",
      "Provide 6 months of complimentary Premium 24/7 Tech Support."
    ]
  },
  "model_name": "Tuned XGBoost",
  "model_version": "1.0.0"
}
```

### Customer Management & Analytics
- `GET /api/customers?page=1&page_size=15&search=...&risk_level=HIGH`
- `GET /api/customers/{customer_id}`
- `GET /api/predictions?limit=20`
- `GET /api/analytics`
- `GET /api/model/metadata`

---

## Machine Learning Interview Deep-Dive

### 1. Why is Customer Churn a Classification Problem?
Customer churn represents binary attrition ($y \in \{0, 1\}$) over a defined business horizon (e.g. within the next 30-90 days). The objective is estimating the posterior probability $P(Y = 1 \mid X)$ rather than predicting continuous spend.

### 2. Why Compare Logistic Regression, Random Forest, and XGBoost?
- **Logistic Regression (Baseline)**: Provides a linear decision boundary benchmark. Fast, interpretable, and establishes whether nonlinear interactions are necessary.
- **Decision Tree**: Non-parametric tree baseline to observe decision split thresholds.
- **Random Forest**: Bagging ensemble that reduces variance, handles non-linearities, and averages out individual tree overfitting.
- **XGBoost**: Gradient boosted decision tree that builds shallow trees sequentially to minimize residual loss. Handles sparse one-hot encoded categories, regularizes tree complexity ($\gamma, \lambda$), and achieves superior ROC-AUC on tabular data.

### 3. Why Accuracy is Insufficient & Why Recall Matters in Churn
In telecom datasets with ~26% churn rate, a naive majority-class classifier predicting "No Churn" for everyone achieves **74% accuracy**, yet fails to detect a single churner.
- **False Negative (FN)**: Customer is predicted to stay, but actually churns. **Cost = Lost Lifetime Value (LTV)** (high business cost).
- **False Positive (FP)**: Customer is predicted to churn, but would have stayed. **Cost = Cost of retention offer/discount** (low cost).
Because $Cost(FN) \gg Cost(FP)$, **Recall** and **ROC-AUC** are the primary decision metrics. The tuned model prioritizes high Recall (~80%) to capture the vast majority of at-risk revenue.

### 4. Preventing Data Leakage
Data leakage occurs when information from outside the training dataset is used to build the model:
1. **Train/Test Split First**: Splitting occurs strictly before computing any statistics.
2. **ColumnTransformer Fitting**: Imputer medians and StandardScaler means/standard deviations are learned **only** on $X_{\text{train}}$. $X_{\text{test}}$ and production inference inputs are transformed using the saved preprocessor parameters without re-fitting.
3. **Resampling / Class Weighting**: Imbalance handling (e.g. `scale_pos_weight` or SMOTE) is applied strictly within training folds, never globally before splitting.

### 5. What SHAP (SHapley Additive exPlanations) Does
SHAP applies cooperative game theory (Shapley values) to compute the marginal contribution of each feature to the difference between the model's output and the expected baseline:
$$f(x) = \phi_0 + \sum_{i=1}^{M} \phi_i$$
Where $\phi_0$ is the base value (expected churn probability across the population) and $\phi_i$ is the exact impact of feature $i$. Unlike black-box predictions, SHAP reveals *why* a customer is at risk (e.g., Month-to-Month contract adding +0.68 to risk, while Long Tenure subtracting -0.12).

---

## Running Automated Tests

Run the full pytest suite:
```bash
python -m pytest -v
```
**Test Coverage**:
- `tests/test_preprocessing.py`: Imputation, dtype conversions, feature engineering, transformer shapes.
- `tests/test_prediction.py`: Risk tier boundaries, retention recommendation rules.
- `tests/test_api.py`: FastAPI TestClient integration for `/api/health`, `/api/customers`, `/api/predict`, and `/api/analytics`.

---

## License
MIT License. Created for production-grade customer retention and machine learning engineering portfolios.
