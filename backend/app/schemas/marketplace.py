from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


# ─── Equipment Schemas ───────────────────────────────────────────────────────

class EquipmentBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    category: str = Field(..., description="Equipment category: tractor, harvester, plough, seeder, sprayer, irrigator, tiller, trailer, drone, other")
    description: Optional[str] = None
    daily_rate: float = Field(..., gt=0, description="Daily rental rate in INR")
    hourly_rate: Optional[float] = Field(None, gt=0, description="Hourly rental rate in INR")
    location: str = Field(..., min_length=2)
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    condition: str = Field(default="good", description="Equipment condition: excellent, good, fair")
    image_url: Optional[str] = None


class EquipmentCreate(EquipmentBase):
    pass


class EquipmentUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    daily_rate: Optional[float] = None
    hourly_rate: Optional[float] = None
    location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    is_available: Optional[bool] = None
    condition: Optional[str] = None
    image_url: Optional[str] = None


class EquipmentResponse(EquipmentBase):
    id: int
    owner_id: int
    is_available: bool
    avg_rating: Optional[float] = None
    review_count: int = 0
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class EquipmentListResponse(BaseModel):
    items: List[EquipmentResponse]
    total: int
    page: int
    page_size: int


# ─── Labor Provider Schemas ──────────────────────────────────────────────────

class LaborProviderBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    skills: str = Field(..., description="Comma-separated skills: planting, harvesting, spraying, irrigation, weeding, soil_preparation, transport, general")
    experience_years: int = Field(default=0, ge=0)
    daily_rate: float = Field(..., gt=0, description="Daily rate in INR")
    hourly_rate: Optional[float] = Field(None, gt=0, description="Hourly rate in INR")
    location: str = Field(..., min_length=2)
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    phone: Optional[str] = None
    bio: Optional[str] = None


class LaborProviderCreate(LaborProviderBase):
    pass


class LaborProviderUpdate(BaseModel):
    name: Optional[str] = None
    skills: Optional[str] = None
    experience_years: Optional[int] = None
    daily_rate: Optional[float] = None
    hourly_rate: Optional[float] = None
    location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    is_available: Optional[bool] = None
    phone: Optional[str] = None
    bio: Optional[str] = None


class LaborProviderResponse(LaborProviderBase):
    id: int
    user_id: int
    is_available: bool
    rating: float = 0.0
    total_jobs: int = 0
    review_count: int = 0
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class LaborProviderListResponse(BaseModel):
    items: List[LaborProviderResponse]
    total: int
    page: int
    page_size: int


# ─── Booking Schemas ─────────────────────────────────────────────────────────

class BookingCreate(BaseModel):
    booking_type: str = Field(..., description="Type of booking: 'equipment' or 'labor'")
    equipment_id: Optional[int] = None
    labor_provider_id: Optional[int] = None
    start_date: str = Field(..., description="Start date in YYYY-MM-DD format")
    end_date: str = Field(..., description="End date in YYYY-MM-DD format")
    notes: Optional[str] = None


class BookingUpdate(BaseModel):
    status: Optional[str] = Field(None, description="Status: pending, confirmed, in_progress, completed, cancelled")
    notes: Optional[str] = None


class BookingResponse(BaseModel):
    id: int
    user_id: int
    booking_type: str
    equipment_id: Optional[int] = None
    labor_provider_id: Optional[int] = None
    start_date: str
    end_date: str
    total_cost: float
    status: str
    notes: Optional[str] = None
    equipment_name: Optional[str] = None
    labor_provider_name: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class BookingListResponse(BaseModel):
    items: List[BookingResponse]
    total: int


# ─── Review Schemas ──────────────────────────────────────────────────────────

class ReviewCreate(BaseModel):
    equipment_id: Optional[int] = None
    labor_provider_id: Optional[int] = None
    rating: float = Field(..., ge=1.0, le=5.0)
    comment: Optional[str] = None


class ReviewResponse(BaseModel):
    id: int
    user_id: int
    equipment_id: Optional[int] = None
    labor_provider_id: Optional[int] = None
    rating: float
    comment: Optional[str] = None
    reviewer_name: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ─── Marketplace Overview ────────────────────────────────────────────────────

class MarketplaceStats(BaseModel):
    total_equipment: int
    total_labor_providers: int
    total_bookings: int
    available_equipment: int
    available_labor: int


class MarketplaceSearchParams(BaseModel):
    query: Optional[str] = None
    category: Optional[str] = None
    location: Optional[str] = None
    min_rate: Optional[float] = None
    max_rate: Optional[float] = None
    available_only: bool = True
    page: int = 1
    page_size: int = 20
