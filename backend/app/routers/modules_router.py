import base64

from fastapi import APIRouter, Depends, File, Form, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import get_current_user
from app.database import get_db
from app.models import User
from app.models import YieldReport
from app.schemas import AdvisoryRequest, YieldReportCreate
from app.services.ai_advisory import analyze_disease, get_advice
from app.services.forecast import agro_calendar, crop_recommendations, regional_forecast
from app.services.nasa_power import fetch_nasa_power

router = APIRouter(prefix="/api", tags=["modules"])


@router.get("/weather")
async def weather(lat: float, lon: float, user: User = Depends(get_current_user)):
    return await fetch_nasa_power(lat, lon)


@router.post("/advisory")
async def advisory(body: AdvisoryRequest, user: User = Depends(get_current_user)):
    ctx = {"region": user.region, "segment": user.segment, "area_ha": user.total_area_ha}
    text = await get_advice(body.question, body.crop_type or user.primary_crops, body.language, ctx)
    return {"answer": text}


@router.post("/disease/analyze")
async def disease_analyze(
    crop_type: str = Form(...),
    symptoms: str = Form(...),
    language: str = Form("uz"),
    image: UploadFile | None = File(None),
    user: User = Depends(get_current_user),
):
    b64 = None
    if image and image.filename:
        raw = await image.read()
        if len(raw) > 5_000_000:
            from fastapi import HTTPException
            raise HTTPException(status_code=400, detail="Image too large (max 5MB)")
        b64 = base64.standard_b64encode(raw).decode()
    result = await analyze_disease(crop_type, symptoms, language, b64)
    return result


@router.get("/crops/recommend")
async def recommend_crops(user: User = Depends(get_current_user)):
    region = user.region or "Farg'ona"
    area = user.total_area_ha or 1.0
    return crop_recommendations(region, user.segment, area, user.language)


@router.get("/calendar")
async def calendar(crop: str = "general", user: User = Depends(get_current_user)):
    return {"crop": crop, "tasks": agro_calendar(crop, user.language)}


@router.post("/yield/report")
async def submit_yield(
    body: YieldReportCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    report = YieldReport(user_id=user.id, **body.model_dump())
    db.add(report)
    await db.commit()
    return {"ok": True}


@router.get("/forecast/regional")
async def forecast(region: str | None = None, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return await regional_forecast(db, region or user.region)


@router.get("/locust/status")
async def locust_status(user: User = Depends(get_current_user)):
    return {
        "source": "FAO Desert Locust API (demo)",
        "risk_level": "low",
        "region": user.region or "Farg'ona",
        "nearest_swarm_km": 420,
        "alert": False,
        "message_key": "locust_clear",
    }
