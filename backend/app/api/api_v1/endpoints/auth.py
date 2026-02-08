from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.schemas.auth import Token, UserCreate, User
from app.api import deps
from app.core import security
from app.models.user import User as UserModel
from app.db.database import get_db
from app.core.config import settings

router = APIRouter()

@router.post("/login", response_model=Token)
def login_access_token(
    db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    user = db.query(UserModel).filter(UserModel.username == form_data.username).first()
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Incorrect email or password"
        )
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        subject=user.username, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/signup", response_model=User)
def create_user(
    *,
    db: Session = Depends(get_db),
    user_in: UserCreate,
) -> Any:
    user = db.query(UserModel).filter(UserModel.username == user_in.username).first()
    if user:
        return {
        "success": False, 
        "message": "This username is already taken. Please try another one."
    }
    user_obj = UserModel(
        username=user_in.username,
        email=user_in.email,
        hashed_password=security.get_password_hash(user_in.password),
    )
    db.add(user_obj)
    db.commit()
    db.refresh(user_obj)
    return user_obj
