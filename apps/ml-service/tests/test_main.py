from fastapi.testclient import TestClient

from app.main import app, models

client = TestClient(app)


def setup_function():
    models.clear()


def test_health():
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_train_and_predict():
    training_response = client.post(
        "/train",
        json={
            "sku": "LAPTOP-001",
            "history": [
                {
                    "date": f"2026-07-{day:02d}",
                    "demand": 10 + day,
                }
                for day in range(1, 11)
            ],
        },
    )

    assert training_response.status_code == 200
    assert (
        training_response.json()["status"]
        == "trained"
    )

    prediction_response = client.post(
        "/predict",
        json={
            "sku": "LAPTOP-001",
            "horizon_days": 7,
        },
    )

    assert prediction_response.status_code == 200

    result = prediction_response.json()

    assert result["sku"] == "LAPTOP-001"
    assert result["horizonDays"] == 7
    assert len(result["forecast"]) == 7
    assert result["totalPredictedDemand"] > 0


def test_unknown_sku_returns_404():
    response = client.post(
        "/predict",
        json={
            "sku": "UNKNOWN-001",
            "horizon_days": 7,
        },
    )

    assert response.status_code == 404