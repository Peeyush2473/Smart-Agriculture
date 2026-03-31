from sqlalchemy import (
    Boolean, Column, Integer, String, Float, Text, DateTime, Enum, ForeignKey
)
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from app.db.database import Base


class EquipmentCategory(str, enum.Enum):
    TRACTOR = "tractor"
    HARVESTER = "harvester"
    PLOUGH = "plough"
    SEEDER = "seeder"
    SPRAYER = "sprayer"
    IRRIGATOR = "irrigator"
    TILLER = "tiller"
    TRAILER = "trailer"
    DRONE = "drone"
    OTHER = "other"


class LaborCategory(str, enum.Enum):
    PLANTING = "planting"
    HARVESTING = "harvesting"
    SPRAYING = "spraying"
    IRRIGATION = "irrigation"
    WEEDING = "weeding"
    SOIL_PREPARATION = "soil_preparation"
    TRANSPORT = "transport"
    GENERAL = "general"


class BookingStatus(str, enum.Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class BookingType(str, enum.Enum):
    EQUIPMENT = "equipment"
    LABOR = "labor"


class Equipment(Base):
    __tablename__ = "equipment"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False, index=True)
    category = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=True)
    daily_rate = Column(Float, nullable=False)
    hourly_rate = Column(Float, nullable=True)
    location = Column(String, nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    is_available = Column(Boolean, default=True)
    condition = Column(String, default="good")  # good, fair, excellent
    image_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    owner = relationship("User", backref="equipment")
    bookings = relationship("Booking", back_populates="equipment")
    reviews = relationship("Review", back_populates="equipment")


class LaborProvider(Base):
    __tablename__ = "labor_providers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False, index=True)
    skills = Column(String, nullable=False)  # comma-separated skill categories
    experience_years = Column(Integer, default=0)
    daily_rate = Column(Float, nullable=False)
    hourly_rate = Column(Float, nullable=True)
    location = Column(String, nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    is_available = Column(Boolean, default=True)
    phone = Column(String, nullable=True)
    bio = Column(Text, nullable=True)
    rating = Column(Float, default=0.0)
    total_jobs = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", backref="labor_profiles")
    bookings = relationship("Booking", back_populates="labor_provider")
    reviews = relationship("Review", back_populates="labor_provider")


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    booking_type = Column(String, nullable=False)  # "equipment" or "labor"
    equipment_id = Column(Integer, ForeignKey("equipment.id"), nullable=True)
    labor_provider_id = Column(Integer, ForeignKey("labor_providers.id"), nullable=True)
    start_date = Column(String, nullable=False)
    end_date = Column(String, nullable=False)
    total_cost = Column(Float, nullable=False)
    status = Column(String, default="pending")
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", backref="bookings")
    equipment = relationship("Equipment", back_populates="bookings")
    labor_provider = relationship("LaborProvider", back_populates="bookings")


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    equipment_id = Column(Integer, ForeignKey("equipment.id"), nullable=True)
    labor_provider_id = Column(Integer, ForeignKey("labor_providers.id"), nullable=True)
    rating = Column(Float, nullable=False)
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", backref="reviews")
    equipment = relationship("Equipment", back_populates="reviews")
    labor_provider = relationship("LaborProvider", back_populates="reviews")
