from pydantic import BaseModel, HttpUrl
from typing import List, Optional

class SchemeSuggestionRequest(BaseModel):
    state: str
    damage_reason: str

class Scheme(BaseModel):
    id: str
    name: str
    description: str
    benefits: str
    eligibility: str
    deadline: str
    apply_link: str

class SchemeSuggestionResponse(BaseModel):
    schemes: List[Scheme]
