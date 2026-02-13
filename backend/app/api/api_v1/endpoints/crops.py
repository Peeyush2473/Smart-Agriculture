from fastapi import APIRouter, Depends, HTTPException
from app.schemas.crop import CropRecommendationCreate, CropRecommendationResponse
from app.api import deps
from app.services.crop_service import crop_service

router = APIRouter()

@router.post("/recommend", response_model=CropRecommendationResponse)
def recommend_crop(
    params: CropRecommendationCreate,
    current_user = Depends(deps.get_current_user)
):
    try:
        # Prepare input data [N, P, K, temperature, humidity, ph, rainfall]
        input_data = [
            params.N,
            params.P,
            params.K,
            params.temperature,
            params.humidity,
            params.ph,
            params.rainfall
        ]
        
        # Get recommendations
        recommended_crop = crop_service.predict_crop(input_data)
        
        return CropRecommendationResponse(
            recommended_crops=[recommended_crop], # Wrap single result in list for compatibility
            confidence=1.0 # Logic changed to deterministic prediction
        )
    except Exception as e:
        print(f"Prediction error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
