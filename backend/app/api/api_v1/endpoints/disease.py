from fastapi import APIRouter, UploadFile, File, HTTPException
from app.schemas.disease import DiseaseDetectionResponse
import shutil
import os
import random

router = APIRouter()

@router.post("/detect", response_model=DiseaseDetectionResponse)
async def detect_disease(file: UploadFile = File(...)):
    # Mock implementation for scaffold
    # In real app: Load Image -> Preprocess -> TFLite Inference -> Result
    
    # Save file temporarily (optional, for debugging)
    # with open(f"temp_{file.filename}", "wb") as buffer:
    #     shutil.copyfileobj(file.file, buffer)
    
    # Mock Logic: Randomly return healthy or disease
    diseases = [
        {"name": "Tomato_Early_blight", "confidence": 0.95, "treatment": "Use fungicides like chlorothalonil."},
        {"name": "Potato_Late_blight", "confidence": 0.88, "treatment": "Apply copper-based fungicides."},
        {"name": "Healthy", "confidence": 0.99, "treatment": "Keep up the good work!"}
    ]
    
    result = random.choice(diseases)
    
    return DiseaseDetectionResponse(
        disease_name=result["name"],
        confidence=result["confidence"],
        treatment=result["treatment"],
        description="Detected by AI model."
    )
