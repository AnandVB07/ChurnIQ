# ChurnIQ

<p align="center">
  <strong>Turn churn signals into timely customer-retention actions.</strong><br />
  An explainable churn-prediction workspace for exploring customer risk, understanding model decisions, and prioritizing follow-up.
</p>

<p align="center">
  <a href="https://fastapi.tiangolo.com/"><img src="https://img.shields.io/badge/API-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" /></a>
  <a href="https://react.dev/"><img src="https://img.shields.io/badge/UI-React-149ECA?style=for-the-badge&logo=react&logoColor=white" alt="React" /></a>
  <a href="https://xgboost.ai/"><img src="https://img.shields.io/badge/Model-XGBoost-EA4335?style=for-the-badge" alt="XGBoost" /></a>
  <a href="https://shap.readthedocs.io/"><img src="https://img.shields.io/badge/Explainability-SHAP-6A5ACD?style=for-the-badge" alt="SHAP" /></a>
  <a href="https://www.docker.com/"><img src="https://img.shields.io/badge/Run-Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" /></a>
</p>

---

## At a glance

ChurnIQ uses a trained XGBoost model to estimate customer churn probability. It turns that score into a risk tier, explains contributing factors with SHAP, and presents retention suggestions in a React dashboard.

<p align="center">
  <strong>ROC-AUC&nbsp; 0.8479</strong> &nbsp;·&nbsp;
  <strong>Recall&nbsp; 79.95%</strong> &nbsp;·&nbsp;
  <strong>Precision&nbsp; 51.73%</strong> &nbsp;·&nbsp;
  <strong>F1&nbsp; 0.6282</strong>
</p>

<sub>Stored evaluation snapshot from the held-out test set in models/model_metadata.json. Results describe this dataset and are not a guarantee of future performance.</sub>

## Product flow

~~~mermaid
flowchart TD
    records["Telco customer records"] --> features["Validate fields and engineer customer features"]
    features --> prep["Apply fitted scikit-learn preprocessing"]
    prep --> model["Tuned XGBoost model"]
    model --> score["Churn probability and configurable risk tier"]
    score --> explain["SHAP factors and retention suggestions"]
    dashboard["React dashboard"] <--> api["FastAPI REST API"]
    api --> features
    api --> store["SQLAlchemy storage"]
    store --> db["PostgreSQL in Docker or SQLite locally"]
    trainer["Training and evaluation pipeline"] --> model
    trainer --> tracking["MLflow experiment tracking"]
~~~

## What’s included

- **Customer risk assessment** — submit a customer profile and get a churn probability with a LOW, MEDIUM, or HIGH tier.
- **Explainable predictions** — see the customer attributes that raise or lower the score.
- **Retention guidance** — surface practical follow-up suggestions alongside each prediction.
- **Portfolio analytics** — review customer counts, churn distribution, contract patterns, and recent predictions.
- **Model insights** — view evaluation metrics, confusion matrix, tuned parameters, and global feature importance.
- **Model development** — compare baseline classifiers, tune XGBoost, export artifacts, and track experiments with MLflow.

## Technology

| Layer | Stack |
| --- | --- |
| Frontend | React 18, Vite 5, Tailwind CSS 3, Recharts, Axios, Lucide |
| API | Python, FastAPI, Pydantic, Uvicorn |
| Machine learning | pandas, NumPy, scikit-learn, XGBoost, SHAP, Joblib |
| Persistence | SQLAlchemy, PostgreSQL 15 in Docker Compose, SQLite fallback |
| Training | MLflow, imbalanced-learn, GridSearchCV |
| Delivery | Docker, Docker Compose, Vercel configuration |

## Run locally

### 1. Install Python dependencies

~~~bash
python -m venv .venv
# Windows: .venv\Scripts\activate
source .venv/bin/activate
pip install -r requirements.txt -r requirements-dev.txt
~~~

### 2. Start the API

The repository includes trained model artifacts. To retrain and refresh them, run the training command first.

~~~bash
python -m src.train
uvicorn backend.app.main:app --reload --port 8000
~~~

The API docs are available at http://127.0.0.1:8000/docs.

### 3. Start the dashboard

In a second terminal:

~~~bash
cd frontend
npm install
npm run dev
~~~

### Docker Compose

From the repository root, start PostgreSQL, the FastAPI service, and the frontend container:

~~~bash
docker compose up --build
~~~

## API

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | /api/health | Check API and model status |
| POST | /api/predict | Score a customer and return risk, SHAP factors, and guidance |
| GET | /api/customers | Browse customers |
| GET | /api/customers/{customer_id} | View one customer |
| GET | /api/predictions | Read recent predictions |
| GET | /api/analytics | Load dashboard aggregates |
| GET | /api/model/metadata | Read model evaluation details |

## Repository map

- src/ — data preparation, feature engineering, training, evaluation, inference, and SHAP services.
- backend/app/ — FastAPI routes, schemas, database models, and application services.
- frontend/src/ — dashboard pages, reusable components, and API client.
- notebooks/ — data exploration, training, evaluation, and explainability notebooks.
- models/ — checked-in model, preprocessor, and evaluation metadata.
- PROJECT_LEARNING_GUIDE.md — deeper walkthrough of the project and ML decisions.

## License

No LICENSE file is currently included in this repository.
