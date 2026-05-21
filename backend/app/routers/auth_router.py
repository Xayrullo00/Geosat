import json

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import create_access_token, get_current_user, hash_password, verify_password
from app.database import get_db
from app.models import User
from app.schemas import LoginRequest, ProfileUpdate, RegisterRequest, TokenResponse

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse)
async def register(body: RegisterRequest, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(select(User).where(User.email == body.email.lower()))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        email=body.email.lower(),
        password_hash=hash_password(body.password),
        full_name=body.full_name,
        language=body.language,
        segment="farmer",
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    token = create_access_token(user.id)
    return TokenResponse(access_token=token, profile_complete=user.profile_complete)


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == body.email.lower()))
    user = result.scalar_one_or_none()
    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    token = create_access_token(user.id)
    return TokenResponse(access_token=token, profile_complete=user.profile_complete)


@router.get("/me")
async def me(user: User = Depends(get_current_user)):
    crops = []
    if user.primary_crops:
        try:
            crops = json.loads(user.primary_crops)
        except json.JSONDecodeError:
            crops = []
    return {
        "id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "phone": user.phone,
        "segment": user.segment,
        "language": user.language,
        "region": user.region,
        "district": user.district,
        "village": user.village,
        "farm_name": user.farm_name,
        "total_area_ha": user.total_area_ha,
        "primary_crops": crops,
        "soil_type": user.soil_type,
        "irrigation_type": user.irrigation_type,
        "experience_years": user.experience_years,
        "profile_complete": user.profile_complete,
    }


@router.patch("/profile")
async def update_profile(
    body: ProfileUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    data = body.model_dump(exclude_unset=True)
    if "primary_crops" in data and data["primary_crops"] is not None:
        data["primary_crops"] = json.dumps(data["primary_crops"])
    for k, v in data.items():
        setattr(user, k, v)
    await db.commit()
    await db.refresh(user)
    return {"ok": True, "profile_complete": user.profile_complete}
