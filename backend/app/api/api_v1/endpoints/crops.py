from fastapi import APIRouter, Depends
from app.schemas.crop import CropRecommendationCreate, CropRecommendationResponse
from app.api import deps
import random

router = APIRouter()

@router.post("/recommend", response_model=CropRecommendationResponse)
def recommend_crop(
    params: CropRecommendationCreate,
    current_user = Depends(deps.get_current_user)
):
    # Mock implementation
    # In real app: Load sklearn model -> predict([params])
    
    crops = ["Rice", "Maize", "Chickpea", "Kidneybeans", "Pigeonpeas", "Mothbeans"]
    recommended = random.sample(crops, 3)
    
    return CropRecommendationResponse(
        recommended_crops=recommended,
        confidence=0.85
    )
