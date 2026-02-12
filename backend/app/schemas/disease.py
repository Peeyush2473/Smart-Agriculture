from pydantic import BaseModel
from typing import Optional

class DiseaseDetectionResponse(BaseModel):
    disease_name: str
    confidence: float
    symptoms: Optional[str] = None
    description: Optional[str] = None
    treatment: Optional[str] = None
