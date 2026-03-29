"""
FastAPI Endpoint: Crop Yield Prediction
Add this file to: backend/app/api/api_v1/endpoints/yield_prediction.py
Register in: backend/app/api/api_v1/api.py  →  router.include_router(yield_prediction.router, ...)
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, validator
from typing import Optional
from .yield_model import predict_yield, CROPS, SOIL_TYPES, SEASONS

router = APIRouter()

# ─── Request Schema ───────────────────────────────────────────────────────────

class YieldPredictionRequest(BaseModel):
    crop: str = Field(..., example="wheat", description="Crop name")
    soil_type: str = Field(..., example="loamy", description="Type of soil")
    season: str = Field(..., example="rabi", description="Farming season")
    land_area_acres: float = Field(..., gt=0, le=500, example=5.0, description="Land area in acres")
    rainfall_mm: Optional[float] = Field(700.0, ge=0, le=3000, description="Expected rainfall in mm")
    temperature_c: Optional[float] = Field(25.0, ge=5, le=50, description="Average temperature in °C")
    fertilizer_kg_per_acre: Optional[float] = Field(80.0, ge=0, le=500, description="Fertilizer usage per acre in kg")

    @validator("crop")
    def validate_crop(cls, v):
        if v.lower() not in CROPS:
            raise ValueError(f"Crop must be one of: {CROPS}")
        return v.lower()

    @validator("soil_type")
    def validate_soil(cls, v):
        if v.lower() not in SOIL_TYPES:
            raise ValueError(f"Soil type must be one of: {SOIL_TYPES}")
        return v.lower()

    @validator("season")
    def validate_season(cls, v):
        if v.lower() not in SEASONS:
            raise ValueError(f"Season must be one of: {SEASONS}")
        return v.lower()

# ─── Response Schema ──────────────────────────────────────────────────────────

class ConfidenceBand(BaseModel):
    low: float
    high: float

class YieldPredictionResponse(BaseModel):
    crop: str
    soil_type: str
    season: str
    land_area_acres: float
    yield_per_acre_quintals: float
    total_yield_quintals: float
    confidence_band: ConfidenceBand
    market_price_per_quintal_inr: int
    estimated_revenue_inr: int
    estimated_cost_inr: int
    estimated_profit_inr: int

# ─── Routes ───────────────────────────────────────────────────────────────────

@router.post("/predict", response_model=YieldPredictionResponse, summary="Predict crop yield and profit")
async def predict_crop_yield(request: YieldPredictionRequest):
    """
    Predict the expected yield and estimated profit for a given crop.

    - **crop**: One of wheat, rice, maize, sugarcane, cotton, soybean, groundnut, mustard, potato, onion
    - **soil_type**: One of clay, sandy, loamy, silty, peaty, chalky
    - **season**: kharif (Jun–Nov), rabi (Nov–Apr), or zaid (Apr–Jun)
    - **land_area_acres**: Your farm size in acres
    - **rainfall_mm**: Expected/historical annual rainfall
    - **temperature_c**: Average growing season temperature
    - **fertilizer_kg_per_acre**: How much fertilizer you plan to use per acre
    """
    try:
        result = predict_yield(
            crop=request.crop,
            soil_type=request.soil_type,
            season=request.season,
            land_area_acres=request.land_area_acres,
            rainfall_mm=request.rainfall_mm,
            temperature_c=request.temperature_c,
            fertilizer_kg_per_acre=request.fertilizer_kg_per_acre,
        )
        return YieldPredictionResponse(**result)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


@router.get("/options", summary="Get valid input options")
async def get_options():
    """Returns all valid values for crops, soil types, and seasons."""
    return {
        "crops": CROPS,
        "soil_types": SOIL_TYPES,
        "seasons": SEASONS,
        "season_descriptions": {
            "kharif": "June to November (monsoon season)",
            "rabi": "November to April (winter season)",
            "zaid": "April to June (summer season)"
        }
    }
