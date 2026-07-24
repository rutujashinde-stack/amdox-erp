from datetime import date, datetime, timedelta, timezone

import numpy as np
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from sklearn.linear_model import LinearRegression

app = FastAPI(
    title="Amdox ERP Demand Forecasting",
    version="1.0.0",
    description="SKU-level demand forecasting service.",
)

models: dict[str, dict] = {}


class DemandPoint(BaseModel):
    date: date
    demand: float = Field(ge=0)


class TrainRequest(BaseModel):
    sku: str = Field(min_length=2, max_length=50)
    history: list[DemandPoint] = Field(min_length=7)


class PredictRequest(BaseModel):
    sku: str = Field(min_length=2, max_length=50)
    horizon_days: int = Field(default=30, ge=1, le=90)


@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "amdox-erp-ml-service",
        "trainedModels": len(models),
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@app.post("/train")
def train(request: TrainRequest):
    sku = request.sku.strip().upper()

    sorted_history = sorted(
        request.history,
        key=lambda point: point.date,
    )

    unique_dates = {
        point.date for point in sorted_history
    }

    if len(unique_dates) != len(sorted_history):
        raise HTTPException(
            status_code=400,
            detail="History contains duplicate dates.",
        )

    first_date = sorted_history[0].date

    features = np.array(
        [
            [(point.date - first_date).days]
            for point in sorted_history
        ],
        dtype=float,
    )

    targets = np.array(
        [point.demand for point in sorted_history],
        dtype=float,
    )

    model = LinearRegression()
    model.fit(features, targets)

    fitted_values = np.maximum(
        0,
        model.predict(features),
    )

    denominator = np.maximum(targets, 1)
    mape = float(
        np.mean(
            np.abs(
                (targets - fitted_values)
                / denominator
            ),
        )
        * 100
    )

    trained_at = datetime.now(timezone.utc)

    models[sku] = {
        "model": model,
        "first_date": first_date,
        "last_date": sorted_history[-1].date,
        "samples": len(sorted_history),
        "mape": mape,
        "trained_at": trained_at,
    }

    return {
        "status": "trained",
        "sku": sku,
        "samples": len(sorted_history),
        "trainingMape": round(mape, 2),
        "trainedAt": trained_at.isoformat(),
    }


@app.post("/predict")
def predict(request: PredictRequest):
    sku = request.sku.strip().upper()
    model_data = models.get(sku)

    if not model_data:
        raise HTTPException(
            status_code=404,
            detail=(
                f"No trained model was found for SKU {sku}."
            ),
        )

    first_date: date = model_data["first_date"]
    last_date: date = model_data["last_date"]
    model: LinearRegression = model_data["model"]

    forecast_dates = [
        last_date + timedelta(days=offset)
        for offset in range(
            1,
            request.horizon_days + 1,
        )
    ]

    features = np.array(
        [
            [(forecast_date - first_date).days]
            for forecast_date in forecast_dates
        ],
        dtype=float,
    )

    predictions = np.maximum(
        0,
        model.predict(features),
    )

    forecast = [
        {
            "date": forecast_date.isoformat(),
            "predictedDemand": round(
                float(prediction),
                2,
            ),
        }
        for forecast_date, prediction in zip(
            forecast_dates,
            predictions,
        )
    ]

    total_demand = float(np.sum(predictions))
    average_demand = float(np.mean(predictions))

    return {
        "sku": sku,
        "horizonDays": request.horizon_days,
        "forecast": forecast,
        "totalPredictedDemand": round(
            total_demand,
            2,
        ),
        "averageDailyDemand": round(
            average_demand,
            2,
        ),
        "trainingMape": round(
            model_data["mape"],
            2,
        ),
        "model": "linear-regression-mvp",
    }