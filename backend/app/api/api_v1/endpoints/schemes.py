from fastapi import APIRouter
from typing import List
from app.schemas.scheme import SchemeSuggestionRequest, SchemeSuggestionResponse, Scheme

router = APIRouter()

# Mock database of schemes
MOCK_SCHEMES = [
    {
        "id": "pmfby-1",
        "name": "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
        "description": "Comprehensive risk coverage from pre-sowing to post-harvest against natural non-preventable risks.",
        "benefits": "Financial support and compensation against crop loss due to non-preventable natural risks.",
        "eligibility": "All farmers growing notified crops in a notified area.",
        "deadline": "15 Days before sowing season ends",
        "apply_link": "https://pmfby.gov.in/",
        "applicable_states": "ALL",
        "applicable_reasons": ["weather", "disease", "pest", "natural_calamity"]
    },
    {
        "id": "rwbcis-1",
        "name": "Restructured Weather Based Crop Insurance Scheme (RWBCIS)",
        "description": "Protection against financial loss due to anticipated crop loss resulting from adverse weather conditions.",
        "benefits": "Compensation for yield loss caused by weather parameters like rainfall, temperature, frost, humanity etc.",
        "eligibility": "Farmers of specified crops whose yields may be impacted by adverse weather conditions.",
        "deadline": "Depends on local state notification",
        "apply_link": "https://pmfby.gov.in/",
        "applicable_states": "ALL",
        "applicable_reasons": ["weather", "natural_calamity"]
    },
    {
        "id": "sdrf-1",
        "name": "State Disaster Response Fund (SDRF)",
        "description": "State specific fund for providing immediate relief to victims of natural disasters.",
        "benefits": "Input subsidy for crop loss of 33% and above due to notified natural calamities.",
        "eligibility": "Farmers with declared crop loss over 33% due to notified natural calamities.",
        "deadline": "Apply immediately after disaster declaration",
        "apply_link": "https://ndmindia.mha.gov.in/",
        "applicable_states": "ALL",
        "applicable_reasons": ["natural_calamity", "weather"]
    },
    {
        "id": "cm-kisan-sahay-1",
        "name": "Mukhya Mantri Kisan Sahay Yojana",
        "description": "State scheme providing compensation without any premium collected from the farmers.",
        "benefits": "Compensation for crop damage due to drought, unseasonal rain, or heavy rainfall.",
        "eligibility": "Farmers facing 33% to 60% crop damage.",
        "deadline": "Within 30 days of damage",
        "apply_link": "https://agri.gujarat.gov.in/",
        "applicable_states": ["Gujarat"],
        "applicable_reasons": ["weather", "natural_calamity"]
    },
    {
        "id": "maha-krushi-1",
        "name": "Gopinath Munde Shetkari Apghat Vima Yojana",
        "description": "Insurance scheme for farmers facing severe accidents or death, but often extended to provide input subsidies during extreme losses.",
        "benefits": "Relief support for affected farming families.",
        "eligibility": "Registered farmers in Maharashtra.",
        "deadline": "Varies",
        "apply_link": "https://krishi.maharashtra.gov.in/",
        "applicable_states": ["Maharashtra"],
        "applicable_reasons": ["disease", "pest", "weather", "natural_calamity"]
    }
]

@router.post("/suggest", response_model=SchemeSuggestionResponse)
async def suggest_schemes(request: SchemeSuggestionRequest):
    state = request.state
    reason = request.damage_reason.lower()
    
    suggested = []
    for scheme in MOCK_SCHEMES:
        # Check if state matches or is applicable to all
        is_state_eligible = scheme["applicable_states"] == "ALL" or state in scheme["applicable_states"]
        # Check if reason matches
        is_reason_eligible = reason in scheme["applicable_reasons"] or reason == "all"
        
        if is_state_eligible and is_reason_eligible:
            suggested.append(Scheme(
                id=scheme["id"],
                name=scheme["name"],
                description=scheme["description"],
                benefits=scheme["benefits"],
                eligibility=scheme["eligibility"],
                deadline=scheme["deadline"],
                apply_link=scheme["apply_link"]
            ))
            
    # If no schemes matches, at least return PMFBY as it's a general national scheme
    if len(suggested) == 0:
        pmfby = MOCK_SCHEMES[0]
        suggested.append(Scheme(
            id=pmfby["id"],
            name=pmfby["name"],
            description="General nationwide scheme. Please check eligibility for your specific state.",
            benefits=pmfby["benefits"],
            eligibility=pmfby["eligibility"],
            deadline=pmfby["deadline"],
            apply_link=pmfby["apply_link"]
        ))

    return SchemeSuggestionResponse(schemes=suggested)
