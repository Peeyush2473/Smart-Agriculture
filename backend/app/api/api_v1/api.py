from fastapi import APIRouter
from app.api.api_v1.endpoints import auth, disease, crops, weather

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(disease.router, prefix="/disease", tags=["disease"])
api_router.include_router(crops.router, prefix="/crops", tags=["crops"])
api_router.include_router(weather.router, prefix="/weather", tags=["weather"])
