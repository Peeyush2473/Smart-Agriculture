from pydantic import BaseModel

class CropRecommendationBase(BaseModel):
    N: float
    P: float
    K: float
    temperature: float
    humidity: float
    ph: float
    rainfall: float

class CropRecommendationCreate(CropRecommendationBase):
    pass

class CropRecommendationResponse(BaseModel):
    recommended_crops: list[str]
    confidence: float
