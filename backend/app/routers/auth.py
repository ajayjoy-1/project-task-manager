from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..security import (
    create_access_token,
    get_current_user,
    hash_password,
    verify_password,
)

router = APIRouter(prefix="/auth", tags=["Auth"])


def build_token_response(user: models.User) -> dict:
    return {
        "access_token": create_access_token(user.id),
        "token_type": "bearer",
        "user": schemas.UserOut.model_validate(user),
    }


@router.post("/register", response_model=schemas.TokenOut, status_code=201)
def register(payload: schemas.RegisterRequest, db: Session = Depends(get_db)):
    email = payload.email.lower()

    existing = db.scalar(select(models.User).where(models.User.email == email))
    if existing is not None:
        raise HTTPException(status_code=409, detail="Email already registered")

    # the very first user becomes the admin
    is_first_user = (db.scalar(select(func.count(models.User.id))) or 0) == 0

    user = models.User(
        name=payload.name,
        email=email,
        hashed_password=hash_password(payload.password),
        role="admin" if is_first_user else "user",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return build_token_response(user)


@router.post("/login", response_model=schemas.TokenOut)
def login(payload: schemas.LoginRequest, db: Session = Depends(get_db)):
    email = payload.email.strip().lower()
    user = db.scalar(select(models.User).where(models.User.email == email))
    if user is None or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return build_token_response(user)


@router.get("/me", response_model=schemas.UserOut)
def me(current_user: models.User = Depends(get_current_user)):
    return current_user