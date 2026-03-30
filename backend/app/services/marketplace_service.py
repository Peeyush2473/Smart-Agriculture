"""
Marketplace Service — business logic for Equipment & Labor Marketplace.

Handles CRUD operations, search, booking, reviews, and seed data
for equipment rentals, labor hiring, and service booking.
"""

from typing import Optional, List, Tuple
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import func, or_

from app.models.marketplace import Equipment, LaborProvider, Booking, Review
from app.models.user import User


# ══════════════════════════════════════════════════════════════════════════════
#  EQUIPMENT OPERATIONS
# ══════════════════════════════════════════════════════════════════════════════

def create_equipment(db: Session, owner_id: int, data: dict) -> Equipment:
    """Register new equipment for rental."""
    equipment = Equipment(owner_id=owner_id, **data)
    db.add(equipment)
    db.commit()
    db.refresh(equipment)
    return equipment


def get_equipment_by_id(db: Session, equipment_id: int) -> Optional[Equipment]:
    return db.query(Equipment).filter(Equipment.id == equipment_id).first()


def list_equipment(
    db: Session,
    category: Optional[str] = None,
    location: Optional[str] = None,
    min_rate: Optional[float] = None,
    max_rate: Optional[float] = None,
    available_only: bool = True,
    query: Optional[str] = None,
    page: int = 1,
    page_size: int = 20,
) -> Tuple[List[Equipment], int]:
    """List equipment with filters and pagination."""
    q = db.query(Equipment)

    if available_only:
        q = q.filter(Equipment.is_available == True)
    if category:
        q = q.filter(Equipment.category == category)
    if location:
        q = q.filter(Equipment.location.ilike(f"%{location}%"))
    if min_rate is not None:
        q = q.filter(Equipment.daily_rate >= min_rate)
    if max_rate is not None:
        q = q.filter(Equipment.daily_rate <= max_rate)
    if query:
        q = q.filter(
            or_(
                Equipment.name.ilike(f"%{query}%"),
                Equipment.description.ilike(f"%{query}%"),
            )
        )

    total = q.count()
    items = q.order_by(Equipment.created_at.desc()) \
              .offset((page - 1) * page_size) \
              .limit(page_size) \
              .all()

    return items, total


def update_equipment(db: Session, equipment_id: int, owner_id: int, data: dict) -> Optional[Equipment]:
    """Update equipment owned by the user."""
    equipment = db.query(Equipment).filter(
        Equipment.id == equipment_id,
        Equipment.owner_id == owner_id,
    ).first()
    if not equipment:
        return None
    for key, value in data.items():
        if value is not None:
            setattr(equipment, key, value)
    equipment.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(equipment)
    return equipment


def delete_equipment(db: Session, equipment_id: int, owner_id: int) -> bool:
    equipment = db.query(Equipment).filter(
        Equipment.id == equipment_id,
        Equipment.owner_id == owner_id,
    ).first()
    if not equipment:
        return False
    db.delete(equipment)
    db.commit()
    return True


# ══════════════════════════════════════════════════════════════════════════════
#  LABOR PROVIDER OPERATIONS
# ══════════════════════════════════════════════════════════════════════════════

def create_labor_provider(db: Session, user_id: int, data: dict) -> LaborProvider:
    """Register as a labor provider."""
    provider = LaborProvider(user_id=user_id, **data)
    db.add(provider)
    db.commit()
    db.refresh(provider)
    return provider


def get_labor_provider_by_id(db: Session, provider_id: int) -> Optional[LaborProvider]:
    return db.query(LaborProvider).filter(LaborProvider.id == provider_id).first()


def list_labor_providers(
    db: Session,
    skills: Optional[str] = None,
    location: Optional[str] = None,
    min_rate: Optional[float] = None,
    max_rate: Optional[float] = None,
    available_only: bool = True,
    query: Optional[str] = None,
    page: int = 1,
    page_size: int = 20,
) -> Tuple[List[LaborProvider], int]:
    """List labor providers with filters and pagination."""
    q = db.query(LaborProvider)

    if available_only:
        q = q.filter(LaborProvider.is_available == True)
    if skills:
        q = q.filter(LaborProvider.skills.ilike(f"%{skills}%"))
    if location:
        q = q.filter(LaborProvider.location.ilike(f"%{location}%"))
    if min_rate is not None:
        q = q.filter(LaborProvider.daily_rate >= min_rate)
    if max_rate is not None:
        q = q.filter(LaborProvider.daily_rate <= max_rate)
    if query:
        q = q.filter(
            or_(
                LaborProvider.name.ilike(f"%{query}%"),
                LaborProvider.bio.ilike(f"%{query}%"),
                LaborProvider.skills.ilike(f"%{query}%"),
            )
        )

    total = q.count()
    items = q.order_by(LaborProvider.rating.desc()) \
              .offset((page - 1) * page_size) \
              .limit(page_size) \
              .all()

    return items, total


def update_labor_provider(db: Session, provider_id: int, user_id: int, data: dict) -> Optional[LaborProvider]:
    provider = db.query(LaborProvider).filter(
        LaborProvider.id == provider_id,
        LaborProvider.user_id == user_id,
    ).first()
    if not provider:
        return None
    for key, value in data.items():
        if value is not None:
            setattr(provider, key, value)
    provider.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(provider)
    return provider


def delete_labor_provider(db: Session, provider_id: int, user_id: int) -> bool:
    provider = db.query(LaborProvider).filter(
        LaborProvider.id == provider_id,
        LaborProvider.user_id == user_id,
    ).first()
    if not provider:
        return False
    db.delete(provider)
    db.commit()
    return True


# ══════════════════════════════════════════════════════════════════════════════
#  BOOKING OPERATIONS
# ══════════════════════════════════════════════════════════════════════════════

def _calculate_days(start_date: str, end_date: str) -> int:
    """Calculate the number of rental days between two date strings."""
    start = datetime.strptime(start_date, "%Y-%m-%d")
    end = datetime.strptime(end_date, "%Y-%m-%d")
    delta = (end - start).days
    return max(delta, 1)  # Minimum 1 day


def create_booking(db: Session, user_id: int, data: dict) -> Booking:
    """Create a booking for equipment or labor."""
    booking_type = data["booking_type"]
    days = _calculate_days(data["start_date"], data["end_date"])

    if booking_type == "equipment":
        equipment = get_equipment_by_id(db, data["equipment_id"])
        if not equipment:
            raise ValueError("Equipment not found")
        if not equipment.is_available:
            raise ValueError("Equipment is not available")
        total_cost = equipment.daily_rate * days
        data["labor_provider_id"] = None
    elif booking_type == "labor":
        provider = get_labor_provider_by_id(db, data["labor_provider_id"])
        if not provider:
            raise ValueError("Labor provider not found")
        if not provider.is_available:
            raise ValueError("Labor provider is not available")
        total_cost = provider.daily_rate * days
        data["equipment_id"] = None
    else:
        raise ValueError("Invalid booking type — must be 'equipment' or 'labor'")

    booking = Booking(
        user_id=user_id,
        booking_type=data["booking_type"],
        equipment_id=data.get("equipment_id"),
        labor_provider_id=data.get("labor_provider_id"),
        start_date=data["start_date"],
        end_date=data["end_date"],
        total_cost=total_cost,
        status="pending",
        notes=data.get("notes"),
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return booking


def get_user_bookings(db: Session, user_id: int) -> List[Booking]:
    return db.query(Booking).filter(Booking.user_id == user_id) \
             .order_by(Booking.created_at.desc()).all()


def get_booking_by_id(db: Session, booking_id: int) -> Optional[Booking]:
    return db.query(Booking).filter(Booking.id == booking_id).first()


def update_booking_status(db: Session, booking_id: int, user_id: int, status: str, notes: Optional[str] = None) -> Optional[Booking]:
    booking = db.query(Booking).filter(
        Booking.id == booking_id,
        Booking.user_id == user_id,
    ).first()
    if not booking:
        return None
    booking.status = status
    if notes is not None:
        booking.notes = notes
    booking.updated_at = datetime.utcnow()

    # If cancelled, free up the resource
    if status == "cancelled":
        if booking.equipment_id:
            equip = get_equipment_by_id(db, booking.equipment_id)
            if equip:
                equip.is_available = True
        if booking.labor_provider_id:
            prov = get_labor_provider_by_id(db, booking.labor_provider_id)
            if prov:
                prov.is_available = True

    # If completed, increment total_jobs for labor provider
    if status == "completed" and booking.labor_provider_id:
        prov = get_labor_provider_by_id(db, booking.labor_provider_id)
        if prov:
            prov.total_jobs += 1

    db.commit()
    db.refresh(booking)
    return booking


# ══════════════════════════════════════════════════════════════════════════════
#  REVIEW OPERATIONS
# ══════════════════════════════════════════════════════════════════════════════

def create_review(db: Session, user_id: int, data: dict) -> Review:
    review = Review(user_id=user_id, **data)
    db.add(review)
    db.commit()

    # Update average rating for the reviewed entity
    if data.get("labor_provider_id"):
        _update_labor_rating(db, data["labor_provider_id"])
    db.refresh(review)
    return review


def _update_labor_rating(db: Session, provider_id: int):
    avg = db.query(func.avg(Review.rating)).filter(
        Review.labor_provider_id == provider_id
    ).scalar()
    provider = get_labor_provider_by_id(db, provider_id)
    if provider and avg:
        provider.rating = round(float(avg), 1)
        db.commit()


def get_reviews_for_equipment(db: Session, equipment_id: int) -> List[Review]:
    return db.query(Review).filter(Review.equipment_id == equipment_id) \
             .order_by(Review.created_at.desc()).all()


def get_reviews_for_labor(db: Session, provider_id: int) -> List[Review]:
    return db.query(Review).filter(Review.labor_provider_id == provider_id) \
             .order_by(Review.created_at.desc()).all()


# ══════════════════════════════════════════════════════════════════════════════
#  STATS & UTILITIES
# ══════════════════════════════════════════════════════════════════════════════

def get_marketplace_stats(db: Session) -> dict:
    return {
        "total_equipment": db.query(Equipment).count(),
        "total_labor_providers": db.query(LaborProvider).count(),
        "total_bookings": db.query(Booking).count(),
        "available_equipment": db.query(Equipment).filter(Equipment.is_available == True).count(),
        "available_labor": db.query(LaborProvider).filter(LaborProvider.is_available == True).count(),
    }


def get_equipment_rating_info(db: Session, equipment_id: int) -> dict:
    """Get average rating and review count for equipment."""
    result = db.query(
        func.avg(Review.rating).label("avg_rating"),
        func.count(Review.id).label("count"),
    ).filter(Review.equipment_id == equipment_id).first()
    return {
        "avg_rating": round(float(result.avg_rating), 1) if result.avg_rating else None,
        "review_count": result.count or 0,
    }


def get_labor_rating_info(db: Session, provider_id: int) -> dict:
    result = db.query(
        func.avg(Review.rating).label("avg_rating"),
        func.count(Review.id).label("count"),
    ).filter(Review.labor_provider_id == provider_id).first()
    return {
        "avg_rating": round(float(result.avg_rating), 1) if result.avg_rating else None,
        "review_count": result.count or 0,
    }


# ══════════════════════════════════════════════════════════════════════════════
#  SEED DATA  — Populates marketplace with sample listings
# ══════════════════════════════════════════════════════════════════════════════

SEED_EQUIPMENT = [
    {
        "name": "Mahindra 575 DI Tractor",
        "category": "tractor",
        "description": "45 HP tractor with power steering, ideal for medium-sized farms. Well-maintained with new tyres.",
        "daily_rate": 2500.0,
        "hourly_rate": 400.0,
        "location": "Pune, Maharashtra",
        "latitude": 18.5204,
        "longitude": 73.8567,
        "condition": "excellent",
        "is_available": True,
    },
    {
        "name": "Swaraj 744 FE Tractor",
        "category": "tractor",
        "description": "48 HP tractor suitable for all agricultural operations. Comes with disc harrow attachment.",
        "daily_rate": 2800.0,
        "hourly_rate": 450.0,
        "location": "Nashik, Maharashtra",
        "latitude": 20.0063,
        "longitude": 73.7904,
        "condition": "good",
        "is_available": True,
    },
    {
        "name": "Claas Crop Tiger 30 Harvester",
        "category": "harvester",
        "description": "Self-propelled combine harvester for wheat and rice. 2.1m cutting width, grain tank 1400L.",
        "daily_rate": 8500.0,
        "hourly_rate": 1200.0,
        "location": "Indore, Madhya Pradesh",
        "latitude": 22.7196,
        "longitude": 75.8577,
        "condition": "good",
        "is_available": True,
    },
    {
        "name": "John Deere W70 Combine Harvester",
        "category": "harvester",
        "description": "High-capacity combine with 4.0m header. Suitable for wheat, paddy, and soybean harvest.",
        "daily_rate": 12000.0,
        "hourly_rate": 1800.0,
        "location": "Nagpur, Maharashtra",
        "latitude": 21.1458,
        "longitude": 79.0882,
        "condition": "excellent",
        "is_available": True,
    },
    {
        "name": "KMW Rotavator (6ft)",
        "category": "tiller",
        "description": "Heavy-duty rotavator for field preparation. 6-foot cutting width, requires 45+ HP tractor.",
        "daily_rate": 1500.0,
        "hourly_rate": 250.0,
        "location": "Aurangabad, Maharashtra",
        "latitude": 19.8762,
        "longitude": 75.3433,
        "condition": "good",
        "is_available": True,
    },
    {
        "name": "Agri Spray Drone — DJI AGRAS T30",
        "category": "drone",
        "description": "Advanced agricultural spraying drone. 30L tank, 40 acres/hour coverage. Comes with trained pilot.",
        "daily_rate": 5000.0,
        "hourly_rate": 800.0,
        "location": "Hyderabad, Telangana",
        "latitude": 17.3850,
        "longitude": 78.4867,
        "condition": "excellent",
        "is_available": True,
    },
    {
        "name": "Massey Ferguson Seed Drill",
        "category": "seeder",
        "description": "9-row seed drill suitable for wheat, gram, and mustard sowing. Adjustable row spacing.",
        "daily_rate": 1800.0,
        "hourly_rate": 300.0,
        "location": "Jaipur, Rajasthan",
        "latitude": 26.9124,
        "longitude": 75.7873,
        "condition": "good",
        "is_available": True,
    },
    {
        "name": "Honda Portable Sprayer (WJR 4025)",
        "category": "sprayer",
        "description": "25L capacity knapsack power sprayer. Lightweight, easy to operate for pesticide and fertilizer spraying.",
        "daily_rate": 400.0,
        "hourly_rate": 80.0,
        "location": "Kolhapur, Maharashtra",
        "latitude": 16.7050,
        "longitude": 74.2433,
        "condition": "excellent",
        "is_available": True,
    },
]

SEED_LABOR = [
    {
        "name": "Rajesh Kumar",
        "skills": "planting,harvesting,general",
        "experience_years": 12,
        "daily_rate": 600.0,
        "hourly_rate": 80.0,
        "location": "Pune, Maharashtra",
        "latitude": 18.5204,
        "longitude": 73.8567,
        "phone": "+91-9876543210",
        "bio": "Experienced farm worker with 12 years in paddy and sugarcane fields. Can lead teams of 5-10 workers.",
        "rating": 4.7,
        "total_jobs": 85,
        "is_available": True,
    },
    {
        "name": "Sunil Patil",
        "skills": "spraying,irrigation,soil_preparation",
        "experience_years": 8,
        "daily_rate": 550.0,
        "hourly_rate": 75.0,
        "location": "Nashik, Maharashtra",
        "latitude": 20.0063,
        "longitude": 73.7904,
        "phone": "+91-9876543211",
        "bio": "Specialized in drip irrigation setup and pesticide spraying with safety certifications.",
        "rating": 4.5,
        "total_jobs": 62,
        "is_available": True,
    },
    {
        "name": "Meena Devi",
        "skills": "planting,weeding,harvesting",
        "experience_years": 15,
        "daily_rate": 500.0,
        "hourly_rate": 70.0,
        "location": "Indore, Madhya Pradesh",
        "latitude": 22.7196,
        "longitude": 75.8577,
        "phone": "+91-9876543212",
        "bio": "Expert in transplanting rice and vegetable saplings. Known for precision and dedication.",
        "rating": 4.8,
        "total_jobs": 120,
        "is_available": True,
    },
    {
        "name": "Vikram Singh",
        "skills": "transport,general,soil_preparation",
        "experience_years": 6,
        "daily_rate": 700.0,
        "hourly_rate": 100.0,
        "location": "Jaipur, Rajasthan",
        "latitude": 26.9124,
        "longitude": 75.7873,
        "phone": "+91-9876543213",
        "bio": "Owns a tractor-trolley for transport. Available for soil leveling, transport, and general labor.",
        "rating": 4.3,
        "total_jobs": 45,
        "is_available": True,
    },
    {
        "name": "Lakshmi Bai",
        "skills": "harvesting,planting,weeding",
        "experience_years": 20,
        "daily_rate": 500.0,
        "hourly_rate": 65.0,
        "location": "Nagpur, Maharashtra",
        "latitude": 21.1458,
        "longitude": 79.0882,
        "phone": "+91-9876543214",
        "bio": "20 years of cotton and soybean farming. Highly experienced in manual harvesting and crop management.",
        "rating": 4.9,
        "total_jobs": 200,
        "is_available": True,
    },
    {
        "name": "Arun Yadav",
        "skills": "irrigation,spraying,soil_preparation",
        "experience_years": 10,
        "daily_rate": 650.0,
        "hourly_rate": 90.0,
        "location": "Hyderabad, Telangana",
        "latitude": 17.3850,
        "longitude": 78.4867,
        "phone": "+91-9876543215",
        "bio": "Expert in modern irrigation techniques and drone-assisted spraying. Tech-savvy farm laborer.",
        "rating": 4.6,
        "total_jobs": 70,
        "is_available": True,
    },
]


def seed_marketplace_data(db: Session):
    """Seed initial marketplace data if the tables are empty."""
    # Only seed if no equipment exists yet
    if db.query(Equipment).count() > 0:
        return {"message": "Marketplace already has data, skipping seed."}

    # Create a system user to own seeded equipment (use id=1 or create if needed)
    system_user = db.query(User).first()
    owner_id = system_user.id if system_user else 1

    for eq_data in SEED_EQUIPMENT:
        equipment = Equipment(owner_id=owner_id, **eq_data)
        db.add(equipment)

    for lp_data in SEED_LABOR:
        provider = LaborProvider(user_id=owner_id, **lp_data)
        db.add(provider)

    db.commit()
    return {"message": f"Seeded {len(SEED_EQUIPMENT)} equipment and {len(SEED_LABOR)} labor providers."}
