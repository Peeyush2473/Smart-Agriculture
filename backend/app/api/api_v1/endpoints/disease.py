from fastapi import APIRouter, UploadFile, File, HTTPException
from app.schemas.disease import DiseaseDetectionResponse
from app.services.disease_service import disease_service
import shutil
import os
import random

router = APIRouter()

@router.post("/detect", response_model=DiseaseDetectionResponse)
async def detect_disease(file: UploadFile = File(...)):
    try:
        # Read file contents
        contents = await file.read()
        
        # Get prediction from service
        result = disease_service.predict_disease(contents)
        
        return DiseaseDetectionResponse(
            disease_name=result["disease_name"],
            confidence=result["confidence"],
            symptoms=result["symptoms"],
            treatment=result["treatment"],
            description=result["description"]
        )
    except Exception as e:
        print(f"Disease detection error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
