"""
Marketplace API Endpoints — Equipment rental, Labor hiring, and Service booking.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.db.database import get_db
from app.api import deps
from app.models.user import User
from app.schemas.marketplace import (
    EquipmentCreate, EquipmentUpdate, EquipmentResponse, EquipmentListResponse,
    LaborProviderCreate, LaborProviderUpdate, LaborProviderResponse, LaborProviderListResponse,
    BookingCreate, BookingUpdate, BookingResponse, BookingListResponse,
    ReviewCreate, ReviewResponse,
    MarketplaceStats,
)
from app.services import marketplace_service as svc

router = APIRouter()


# ─────────────────────────────────────────────────────────────────────────────
#  MARKETPLACE OVERVIEW
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/stats", response_model=MarketplaceStats)
def get_marketplace_stats(db: Session = Depends(get_db)):
    """Get marketplace overview statistics."""
    return svc.get_marketplace_stats(db)


@router.post("/seed")
def seed_data(db: Session = Depends(get_db)):
    """Seed marketplace with sample data (for development)."""
    result = svc.seed_marketplace_data(db)
    return result


# ─────────────────────────────────────────────────────────────────────────────
#  EQUIPMENT ENDPOINTS
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/equipment", response_model=EquipmentListResponse)
def list_equipment(
    category: Optional[str] = Query(None, description="Filter by category"),
    location: Optional[str] = Query(None, description="Filter by location"),
    min_rate: Optional[float] = Query(None, description="Minimum daily rate"),
    max_rate: Optional[float] = Query(None, description="Maximum daily rate"),
    available_only: bool = Query(True, description="Show only available equipment"),
    q: Optional[str] = Query(None, description="Search query"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """List available equipment with filters."""
    items, total = svc.list_equipment(
        db, category=category, location=location,
        min_rate=min_rate, max_rate=max_rate,
        available_only=available_only, query=q,
        page=page, page_size=page_size,
    )
    # Enrich with rating info
    equipment_list = []
    for item in items:
        rating_info = svc.get_equipment_rating_info(db, item.id)
        eq = EquipmentResponse(
            id=item.id,
            owner_id=item.owner_id,
            name=item.name,
            category=item.category,
            description=item.description,
            daily_rate=item.daily_rate,
            hourly_rate=item.hourly_rate,
            location=item.location,
            latitude=item.latitude,
            longitude=item.longitude,
            is_available=item.is_available,
            condition=item.condition,
            image_url=item.image_url,
            avg_rating=rating_info["avg_rating"],
            review_count=rating_info["review_count"],
            created_at=item.created_at,
        )
        equipment_list.append(eq)

    return EquipmentListResponse(
        items=equipment_list, total=total, page=page, page_size=page_size,
    )


@router.get("/equipment/{equipment_id}", response_model=EquipmentResponse)
def get_equipment(equipment_id: int, db: Session = Depends(get_db)):
    """Get equipment details by ID."""
    item = svc.get_equipment_by_id(db, equipment_id)
    if not item:
        raise HTTPException(status_code=404, detail="Equipment not found")
    rating_info = svc.get_equipment_rating_info(db, item.id)
    return EquipmentResponse(
        id=item.id,
        owner_id=item.owner_id,
        name=item.name,
        category=item.category,
        description=item.description,
        daily_rate=item.daily_rate,
        hourly_rate=item.hourly_rate,
        location=item.location,
        latitude=item.latitude,
        longitude=item.longitude,
        is_available=item.is_available,
        condition=item.condition,
        image_url=item.image_url,
        avg_rating=rating_info["avg_rating"],
        review_count=rating_info["review_count"],
        created_at=item.created_at,
    )


@router.post("/equipment", response_model=EquipmentResponse)
def create_equipment(
    data: EquipmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """List new equipment for rental."""
    item = svc.create_equipment(db, current_user.id, data.model_dump())
    return EquipmentResponse(
        id=item.id, owner_id=item.owner_id,
        name=item.name, category=item.category,
        description=item.description, daily_rate=item.daily_rate,
        hourly_rate=item.hourly_rate, location=item.location,
        latitude=item.latitude, longitude=item.longitude,
        is_available=item.is_available, condition=item.condition,
        image_url=item.image_url, created_at=item.created_at,
    )


@router.put("/equipment/{equipment_id}", response_model=EquipmentResponse)
def update_equipment(
    equipment_id: int,
    data: EquipmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """Update your equipment listing."""
    item = svc.update_equipment(db, equipment_id, current_user.id, data.model_dump(exclude_unset=True))
    if not item:
        raise HTTPException(status_code=404, detail="Equipment not found or not owned by you")
    return EquipmentResponse(
        id=item.id, owner_id=item.owner_id,
        name=item.name, category=item.category,
        description=item.description, daily_rate=item.daily_rate,
        hourly_rate=item.hourly_rate, location=item.location,
        latitude=item.latitude, longitude=item.longitude,
        is_available=item.is_available, condition=item.condition,
        image_url=item.image_url, created_at=item.created_at,
    )


@router.delete("/equipment/{equipment_id}")
def delete_equipment(
    equipment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """Delete your equipment listing."""
    success = svc.delete_equipment(db, equipment_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Equipment not found or not owned by you")
    return {"message": "Equipment deleted successfully"}


# ─────────────────────────────────────────────────────────────────────────────
#  LABOR PROVIDER ENDPOINTS
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/labor", response_model=LaborProviderListResponse)
def list_labor_providers(
    skills: Optional[str] = Query(None, description="Filter by skill category"),
    location: Optional[str] = Query(None, description="Filter by location"),
    min_rate: Optional[float] = Query(None, description="Minimum daily rate"),
    max_rate: Optional[float] = Query(None, description="Maximum daily rate"),
    available_only: bool = Query(True, description="Show only available providers"),
    q: Optional[str] = Query(None, description="Search query"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """List available labor providers with filters."""
    items, total = svc.list_labor_providers(
        db, skills=skills, location=location,
        min_rate=min_rate, max_rate=max_rate,
        available_only=available_only, query=q,
        page=page, page_size=page_size,
    )
    labor_list = []
    for item in items:
        rating_info = svc.get_labor_rating_info(db, item.id)
        lp = LaborProviderResponse(
            id=item.id, user_id=item.user_id,
            name=item.name, skills=item.skills,
            experience_years=item.experience_years,
            daily_rate=item.daily_rate, hourly_rate=item.hourly_rate,
            location=item.location, latitude=item.latitude, longitude=item.longitude,
            is_available=item.is_available,
            phone=item.phone, bio=item.bio,
            rating=item.rating, total_jobs=item.total_jobs,
            review_count=rating_info["review_count"],
            created_at=item.created_at,
        )
        labor_list.append(lp)

    return LaborProviderListResponse(
        items=labor_list, total=total, page=page, page_size=page_size,
    )


@router.get("/labor/{provider_id}", response_model=LaborProviderResponse)
def get_labor_provider(provider_id: int, db: Session = Depends(get_db)):
    """Get labor provider details by ID."""
    item = svc.get_labor_provider_by_id(db, provider_id)
    if not item:
        raise HTTPException(status_code=404, detail="Labor provider not found")
    rating_info = svc.get_labor_rating_info(db, item.id)
    return LaborProviderResponse(
        id=item.id, user_id=item.user_id,
        name=item.name, skills=item.skills,
        experience_years=item.experience_years,
        daily_rate=item.daily_rate, hourly_rate=item.hourly_rate,
        location=item.location, latitude=item.latitude, longitude=item.longitude,
        is_available=item.is_available,
        phone=item.phone, bio=item.bio,
        rating=item.rating, total_jobs=item.total_jobs,
        review_count=rating_info["review_count"],
        created_at=item.created_at,
    )


@router.post("/labor", response_model=LaborProviderResponse)
def create_labor_provider(
    data: LaborProviderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """Register as a labor provider."""
    item = svc.create_labor_provider(db, current_user.id, data.model_dump())
    return LaborProviderResponse(
        id=item.id, user_id=item.user_id,
        name=item.name, skills=item.skills,
        experience_years=item.experience_years,
        daily_rate=item.daily_rate, hourly_rate=item.hourly_rate,
        location=item.location, latitude=item.latitude, longitude=item.longitude,
        is_available=item.is_available,
        phone=item.phone, bio=item.bio,
        rating=item.rating, total_jobs=item.total_jobs,
        created_at=item.created_at,
    )


@router.put("/labor/{provider_id}", response_model=LaborProviderResponse)
def update_labor_provider(
    provider_id: int,
    data: LaborProviderUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """Update your labor provider profile."""
    item = svc.update_labor_provider(db, provider_id, current_user.id, data.model_dump(exclude_unset=True))
    if not item:
        raise HTTPException(status_code=404, detail="Labor provider not found or not owned by you")
    return LaborProviderResponse(
        id=item.id, user_id=item.user_id,
        name=item.name, skills=item.skills,
        experience_years=item.experience_years,
        daily_rate=item.daily_rate, hourly_rate=item.hourly_rate,
        location=item.location, latitude=item.latitude, longitude=item.longitude,
        is_available=item.is_available,
        phone=item.phone, bio=item.bio,
        rating=item.rating, total_jobs=item.total_jobs,
        created_at=item.created_at,
    )


@router.delete("/labor/{provider_id}")
def delete_labor_provider(
    provider_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """Delete your labor provider profile."""
    success = svc.delete_labor_provider(db, provider_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Labor provider not found or not owned by you")
    return {"message": "Labor provider deleted successfully"}


# ─────────────────────────────────────────────────────────────────────────────
#  BOOKING ENDPOINTS
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/bookings", response_model=BookingResponse)
def create_booking(
    data: BookingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """Book equipment or hire labor."""
    try:
        booking = svc.create_booking(db, current_user.id, data.model_dump())
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # Resolve names for response
    eq_name = None
    lp_name = None
    if booking.equipment_id:
        eq = svc.get_equipment_by_id(db, booking.equipment_id)
        eq_name = eq.name if eq else None
    if booking.labor_provider_id:
        lp = svc.get_labor_provider_by_id(db, booking.labor_provider_id)
        lp_name = lp.name if lp else None

    return BookingResponse(
        id=booking.id, user_id=booking.user_id,
        booking_type=booking.booking_type,
        equipment_id=booking.equipment_id,
        labor_provider_id=booking.labor_provider_id,
        start_date=booking.start_date, end_date=booking.end_date,
        total_cost=booking.total_cost, status=booking.status,
        notes=booking.notes,
        equipment_name=eq_name, labor_provider_name=lp_name,
        created_at=booking.created_at,
    )


@router.get("/bookings", response_model=BookingListResponse)
def get_my_bookings(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """Get current user's bookings."""
    bookings = svc.get_user_bookings(db, current_user.id)
    items = []
    for b in bookings:
        eq_name = None
        lp_name = None
        if b.equipment_id:
            eq = svc.get_equipment_by_id(db, b.equipment_id)
            eq_name = eq.name if eq else None
        if b.labor_provider_id:
            lp = svc.get_labor_provider_by_id(db, b.labor_provider_id)
            lp_name = lp.name if lp else None
        items.append(BookingResponse(
            id=b.id, user_id=b.user_id,
            booking_type=b.booking_type,
            equipment_id=b.equipment_id,
            labor_provider_id=b.labor_provider_id,
            start_date=b.start_date, end_date=b.end_date,
            total_cost=b.total_cost, status=b.status,
            notes=b.notes,
            equipment_name=eq_name, labor_provider_name=lp_name,
            created_at=b.created_at,
        ))
    return BookingListResponse(items=items, total=len(items))


@router.put("/bookings/{booking_id}", response_model=BookingResponse)
def update_booking(
    booking_id: int,
    data: BookingUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """Update booking status (confirm, cancel, complete)."""
    booking = svc.update_booking_status(
        db, booking_id, current_user.id,
        status=data.status, notes=data.notes,
    )
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    return BookingResponse(
        id=booking.id, user_id=booking.user_id,
        booking_type=booking.booking_type,
        equipment_id=booking.equipment_id,
        labor_provider_id=booking.labor_provider_id,
        start_date=booking.start_date, end_date=booking.end_date,
        total_cost=booking.total_cost, status=booking.status,
        notes=booking.notes, created_at=booking.created_at,
    )


# ─────────────────────────────────────────────────────────────────────────────
#  REVIEW ENDPOINTS
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/reviews", response_model=ReviewResponse)
def create_review(
    data: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """Leave a review for equipment or labor provider."""
    review = svc.create_review(db, current_user.id, data.model_dump())
    return ReviewResponse(
        id=review.id, user_id=review.user_id,
        equipment_id=review.equipment_id,
        labor_provider_id=review.labor_provider_id,
        rating=review.rating, comment=review.comment,
        reviewer_name=current_user.username,
        created_at=review.created_at,
    )


@router.get("/reviews/equipment/{equipment_id}", response_model=list[ReviewResponse])
def get_equipment_reviews(equipment_id: int, db: Session = Depends(get_db)):
    """Get reviews for a piece of equipment."""
    reviews = svc.get_reviews_for_equipment(db, equipment_id)
    return [
        ReviewResponse(
            id=r.id, user_id=r.user_id,
            equipment_id=r.equipment_id,
            labor_provider_id=r.labor_provider_id,
            rating=r.rating, comment=r.comment,
            created_at=r.created_at,
        )
        for r in reviews
    ]


@router.get("/reviews/labor/{provider_id}", response_model=list[ReviewResponse])
def get_labor_reviews(provider_id: int, db: Session = Depends(get_db)):
    """Get reviews for a labor provider."""
    reviews = svc.get_reviews_for_labor(db, provider_id)
    return [
        ReviewResponse(
            id=r.id, user_id=r.user_id,
            equipment_id=r.equipment_id,
            labor_provider_id=r.labor_provider_id,
            rating=r.rating, comment=r.comment,
            created_at=r.created_at,
        )
        for r in reviews
    ]
