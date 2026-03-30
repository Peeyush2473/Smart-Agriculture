from fastapi import APIRouter
from app.api.api_v1.endpoints import auth, disease, crops, weather, profit, schemes

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(disease.router, prefix="/disease", tags=["disease"])
api_router.include_router(crops.router, prefix="/crops", tags=["crops"])
api_router.include_router(profit.router, prefix="/profit", tags=["profit"])
api_router.include_router(weather.router, prefix="/weather", tags=["weather"])
api_router.include_router(schemes.router, prefix="/schemes", tags=["schemes"])

