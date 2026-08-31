import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "service" in data

def test_customers_endpoint():
    response = client.get("/api/customers?page=1&page_size=5")
    assert response.status_code == 200
    data = response.json()
    assert "customers" in data
    assert "total" in data
    assert len(data["customers"]) <= 5

def test_analytics_endpoint():
    response = client.get("/api/analytics")
    assert response.status_code == 200
    data = response.json()
    assert "total_customers" in data
    assert "overall_churn_rate" in data
    assert "risk_distribution" in data
    assert "churn_by_contract" in data

def test_predict_validation_error():
    # Sending invalid data (missing required fields or invalid tenure)
    response = client.post("/api/predict", json={"tenure": -5})
    assert response.status_code == 422  # Unprocessable entity
