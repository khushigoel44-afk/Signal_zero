import json
import os
from contextlib import asynccontextmanager
from datetime import UTC, datetime
from pathlib import Path
from typing import List

import joblib
import numpy as np
import pandas as pd
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from sklearn.ensemble import GradientBoostingRegressor, RandomForestClassifier
from sklearn.metrics import accuracy_score, mean_absolute_error
from sklearn.model_selection import train_test_split

load_dotenv()

MODEL_DIR = Path(os.getenv("MODEL_DIR", "./model"))
MODEL_DIR.mkdir(parents=True, exist_ok=True)
SEED = int(os.getenv("SEED", "42"))
FEATURES = [
    "speed",
    "distance",
    "hour_of_day",
    "day_of_week",
    "historical_avg_speed",
    "segment_index",
]

REG_PATH = MODEL_DIR / "model.pkl"
CLF_PATH = MODEL_DIR / "scaler.pkl"
META_PATH = MODEL_DIR / "train_lookup.json"
ONNX_PATH = MODEL_DIR / "model.onnx"

@asynccontextmanager
async def lifespan(_: FastAPI):
    ensure_models()
    yield


app = FastAPI(title="OGTPS ML Service", version="1.0.0", lifespan=lifespan)

regressor = None
classifier = None
metadata = {"mae": None, "accuracy": None, "last_trained": None}


class PredictRequest(BaseModel):
    speed: float = Field(..., ge=0)
    distance: float = Field(..., ge=0)
    hour_of_day: int = Field(..., ge=0, le=23)
    day_of_week: int = Field(..., ge=0, le=6)
    historical_avg_speed: float = Field(..., ge=0)
    segment_index: int = Field(..., ge=0)


class TrainRow(PredictRequest):
    actual_eta_minutes: float = Field(..., gt=0)
    delayed: int = Field(..., ge=0, le=1)


class TrainRequest(BaseModel):
    records: List[TrainRow] = []


def generate_synthetic_data(n: int = 1500) -> pd.DataFrame:
    rng = np.random.default_rng(SEED)
    speed = rng.normal(38, 12, n).clip(2, 90)
    distance = rng.uniform(0.5, 120, n)
    hour = rng.integers(0, 24, n)
    day = rng.integers(0, 7, n)
    hist_speed = (speed * rng.uniform(0.75, 1.2, n)).clip(2, 90)
    segment = rng.integers(0, 80, n)

    rush_factor = np.where(((hour >= 8) & (hour <= 10)) | ((hour >= 17) & (hour <= 20)), 1.35, 1.0)
    weekend_factor = np.where(day >= 5, 0.9, 1.0)
    segment_penalty = 1 + (segment / 300)

    base_eta = (distance / np.maximum(speed, 1)) * 60
    eta = base_eta * rush_factor * weekend_factor * segment_penalty
    noise = rng.normal(0, 4, n)
    eta = np.maximum(1, eta + noise)

    delayed = ((rush_factor > 1.2) & (speed < hist_speed * 0.7)).astype(int)

    return pd.DataFrame(
        {
            "speed": speed,
            "distance": distance,
            "hour_of_day": hour,
            "day_of_week": day,
            "historical_avg_speed": hist_speed,
            "segment_index": segment,
            "actual_eta_minutes": eta,
            "delayed": delayed,
        }
    )


def train_models(df: pd.DataFrame):
    global regressor, classifier, metadata

    X = df[FEATURES]
    y_eta = df["actual_eta_minutes"]
    y_delay = df["delayed"]

    X_train, X_test, y_train, y_test = train_test_split(X, y_eta, test_size=0.2, random_state=SEED)
    _, Xd_test, _, yd_test = train_test_split(X, y_delay, test_size=0.2, random_state=SEED)

    regressor = GradientBoostingRegressor(random_state=SEED)
    classifier = RandomForestClassifier(n_estimators=250, random_state=SEED)

    regressor.fit(X_train, y_train)
    classifier.fit(X, y_delay)

    pred_eta = regressor.predict(X_test)
    pred_delay = classifier.predict(Xd_test)

    mae = float(mean_absolute_error(y_test, pred_eta))
    acc = float(accuracy_score(yd_test, pred_delay))

    metadata = {
        "mae": mae,
        "accuracy": acc,
        "last_trained": datetime.now(UTC).isoformat(),
    }

    joblib.dump(regressor, REG_PATH)
    joblib.dump(classifier, CLF_PATH)
    with META_PATH.open("w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    ONNX_PATH.write_bytes(b"placeholder-onnx-binary")


def ensure_models():
    global regressor, classifier, metadata
    if REG_PATH.exists() and CLF_PATH.exists() and META_PATH.exists():
        try:
            regressor = joblib.load(REG_PATH)
            classifier = joblib.load(CLF_PATH)
            metadata = json.loads(META_PATH.read_text(encoding="utf-8"))
            return
        except Exception:
            pass
    df = generate_synthetic_data()
    train_models(df)


@app.get("/model/status")
def model_status():
    return {
        "model_loaded": regressor is not None and classifier is not None,
        "accuracy": metadata.get("accuracy"),
        "mae": metadata.get("mae"),
        "last_trained": metadata.get("last_trained"),
    }


@app.post("/train")
def retrain(payload: TrainRequest):
    if payload.records:
        df = pd.DataFrame([item.model_dump() for item in payload.records])
    else:
        df = generate_synthetic_data()
    if len(df) < 100:
        raise HTTPException(status_code=400, detail="Need at least 100 rows to train robustly")
    train_models(df)
    return {"message": "Model trained successfully", **metadata}


@app.post("/predict")
def predict(body: PredictRequest):
    if regressor is None or classifier is None:
        ensure_models()

    x_dict = {col: getattr(body, col) for col in FEATURES}
    x_df = pd.DataFrame([x_dict], columns=FEATURES)
    eta = float(regressor.predict(x_df)[0])
    proba = classifier.predict_proba(x_df)[0]
    delay_prob = float(proba[1]) if len(proba) > 1 else 0.0

    confidence = max(0.5, min(0.99, 1 - (metadata.get("mae", 10) / max(eta, 10))))
    spread = max(2.0, eta * (1 - confidence) * 0.35)

    return {
        "predicted_eta_minutes": round(max(1.0, eta), 2),
        "confidence": round(confidence, 3),
        "delay_probability": round(delay_prob, 3),
        "confidence_interval_minutes": [round(max(1.0, eta - spread), 2), round(eta + spread, 2)],
    }
