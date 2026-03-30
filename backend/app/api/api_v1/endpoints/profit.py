from fastapi import APIRouter
from app.schemas.profit import ProfitComparisonRequest, ProfitResponse
from app.services.profitability_service import profitability_service

router = APIRouter()

@router.post("/compare", response_model=ProfitResponse, summary="Compare Crop Profitability")
def compare_crop_profitability(request: ProfitComparisonRequest) -> ProfitResponse:
    """
    Compare the profitability of different crops given data about cost, yield, and market price.
    """
    return profitability_service.compare_crops(request)
