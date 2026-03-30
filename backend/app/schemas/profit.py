from pydantic import BaseModel, Field
from typing import List
from enum import Enum

class WeatherCondition(str, Enum):
    good = "good"
    average = "average"
    poor = "poor"

class CropComparisonInput(BaseModel):
    crop_name: str = Field(..., description="Name of the crop")
    cultivation_cost: float = Field(..., description="Cost of cultivation per hectare/acre")
    expected_yield: float = Field(..., description="Expected crop yield in chosen standard unit")
    market_price: float = Field(..., description="Market price per unit of expected yield")
    weather_condition: WeatherCondition = Field(default=WeatherCondition.average, description="Current weather condition")

class ProfitComparisonRequest(BaseModel):
    crops: List[CropComparisonInput]

class CropProfitResult(BaseModel):
    crop_name: str
    revenue: float
    total_cost: float
    net_profit: float
    roi_percentage: float
    rank: int

class ProfitResponse(BaseModel):
    comparison_results: List[CropProfitResult]
