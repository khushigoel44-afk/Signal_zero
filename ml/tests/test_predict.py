import sys
from pathlib import Path

from fastapi.testclient import TestClient

sys.path.append(str(Path(__file__).resolve().parents[1]))
from main import app

client = TestClient(app)


def test_predict_endpoint():
    payload = {
        "speed": 32.5,
        "distance": 14.2,
        "hour_of_day": 9,
        "day_of_week": 2,
        "historical_avg_speed": 38.1,
        "segment_index": 4,
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "predicted_eta_minutes" in data
    assert "confidence" in data
    assert "delay_probability" in data


def test_model_status():
    response = client.get("/model/status")
    assert response.status_code == 200
    assert "model_loaded" in response.json()
