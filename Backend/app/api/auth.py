from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.user import User
from app.schemas.auth import RegisterRequest, LoginRequest, AuthResponse
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user
)


router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"]
)


@router.post(
    "/register",
    response_model=AuthResponse
)
async def register(
    request: RegisterRequest,
    db: Session = Depends(get_db)
):
    email = request.email.lower().strip()

    # Check whether user already exists
    existing_user = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="User already registered."
        )

    # Create new user
    user = User(
        name=request.name,
        email=email,
        password_hash=hash_password(request.password)
    )

    try:
        db.add(user)
        db.commit()
        db.refresh(user)

        # Generate JWT token
        access_token = create_access_token({
            "sub": str(user.id),
            "email": user.email
        })
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"User registration failed: {str(e)}"
        )

    return {
        "message": "Registration successful.",
        "access_token": access_token,
        "token_type": "bearer"
    }


@router.post(
    "/login",
    response_model=AuthResponse
)
async def login(
    request: LoginRequest,
    db: Session = Depends(get_db)
):
    email = request.email.lower().strip()

    # Find user
    user = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password."
        )

    # Verify password
    if not verify_password(
        request.password,
        user.password_hash
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password."
        )

    # Generate JWT token
    access_token = create_access_token({
        "sub": str(user.id),
        "email": user.email
    })

    return {
        "message": "Login successful.",
        "access_token": access_token,
        "token_type": "bearer"
    }


@router.get("/me")
async def get_my_profile(
    current_user: User = Depends(get_current_user)
):
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email
    }