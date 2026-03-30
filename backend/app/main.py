from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.api_v1.api import api_router
from app.core.config import settings
from app.db.database import engine, Base
# Import models to ensure they are registered with Base
from app.models import user
from app.models import marketplace

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend for Smart Agriculture App",
    version="1.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
)

# CORS Middleware
origins = [
    "http://localhost",
    "http://localhost:8081",
    "http://localhost:19000",
    "http://localhost:19006",
    "*", # For development
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/health")
def health_check():
    return {"status": "ok", "message": "Backend is healthy"}

@app.get("/")
def read_root():
    return {"message": "Welcome to Smart Agriculture API"}
