from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import get_current_user
from app.database import get_db
from app.models import Field, User
from app.schemas import FieldCreate
from app.services.nasa_power import fetch_nasa_power
from app.services.satellite import analyze_field_satellite

router = APIRouter(prefix="/api/fields", tags=["fields"])


@router.get("")
async def list_fields(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Field).where(Field.user_id == user.id))
    fields = result.scalars().all()
    return [
        {
            "id": f.id,
            "name": f.name,
            "crop_type": f.crop_type,
            "area_ha": f.area_ha,
            "latitude": f.latitude,
            "longitude": f.longitude,
            "planted_date": f.planted_date.isoformat() if f.planted_date else None,
            "field_number": f.field_number,
        }
        for f in fields
    ]


@router.post("")
async def create_field(
    body: FieldCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    field = Field(user_id=user.id, **body.model_dump())
    db.add(field)
    await db.commit()
    await db.refresh(field)
    return {"id": field.id}


@router.get("/{field_id}/monitoring")
async def field_monitoring(
    field_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Field).where(Field.id == field_id, Field.user_id == user.id))
    field = result.scalar_one_or_none()
    if not field:
        from fastapi import HTTPException

        raise HTTPException(status_code=404, detail="Field not found")
    weather = await fetch_nasa_power(field.latitude, field.longitude)
    satellite = await analyze_field_satellite(field.latitude, field.longitude, field.crop_type)
    return {"field_id": field.id, "weather": weather, "satellite": satellite}
