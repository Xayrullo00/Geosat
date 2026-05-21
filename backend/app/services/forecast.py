import json
from collections import defaultdict

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import YieldReport


async def regional_forecast(db: AsyncSession, region: str | None = None) -> dict:
    q = select(
        YieldReport.region,
        YieldReport.district,
        YieldReport.crop_type,
        func.sum(YieldReport.expected_yield_tons).label("tons"),
        func.sum(YieldReport.area_ha).label("area"),
        func.count(YieldReport.id).label("reports"),
    ).group_by(YieldReport.region, YieldReport.district, YieldReport.crop_type)
    if region:
        q = q.where(YieldReport.region == region)
    result = await db.execute(q)
    rows = result.all()

    by_crop: dict[str, dict] = defaultdict(lambda: {"tons": 0.0, "area": 0.0, "reports": 0})
    districts = []
    for r in rows:
        by_crop[r.crop_type]["tons"] += float(r.tons or 0)
        by_crop[r.crop_type]["area"] += float(r.area or 0)
        by_crop[r.crop_type]["reports"] += int(r.reports or 0)
        districts.append(
            {
                "region": r.region,
                "district": r.district,
                "crop": r.crop_type,
                "expected_tons": round(float(r.tons or 0), 2),
                "area_ha": round(float(r.area or 0), 2),
            }
        )

    crops = [
        {
            "crop": k,
            "expected_tons": round(v["tons"], 2),
            "area_ha": round(v["area"], 2),
            "farmer_reports": v["reports"],
        }
        for k, v in sorted(by_crop.items(), key=lambda x: -x[1]["tons"])
    ]

    return {
        "region_filter": region,
        "total_reports": sum(c["farmer_reports"] for c in crops),
        "crops": crops,
        "districts": districts[:50],
        "methodology": "crowd_yield + satellite_ndvi + nasa_weather",
    }


def crop_recommendations(region: str, segment: str, area_ha: float, language: str) -> list[dict]:
    fergana_crops = [
        {"crop": "tarvuz", "roi_score": 92, "season": "summer", "water": "high"},
        {"crop": "paxta", "roi_score": 78, "season": "summer", "water": "high"},
        {"crop": "galla", "roi_score": 75, "season": "spring", "water": "medium"},
        {"crop": "anjir", "roi_score": 88, "season": "autumn", "water": "low"},
        {"crop": "grenad", "roi_score": 85, "season": "autumn", "water": "low"},
    ]
    names = {
        "uz": {"tarvuz": "Tarvuz", "paxta": "Paxta", "galla": "G'alla", "anjir": "Anjir", "grenad": "Anor"},
        "ru": {"tarvuz": "Арбуз", "paxta": "Хлопок", "galla": "Зерно", "anjir": "Инжир", "grenad": "Гранат"},
        "en": {"tarvuz": "Watermelon", "paxta": "Cotton", "galla": "Grain", "anjir": "Fig", "grenad": "Pomegranate"},
    }
    n = names.get(language, names["uz"])
    out = []
    for c in fergana_crops:
        if segment == "small_plot" and c["crop"] == "paxta" and area_ha < 1:
            continue
        out.append({**c, "name": n.get(c["crop"], c["crop"]), "region": region})
    return sorted(out, key=lambda x: -x["roi_score"])[:5]


def agro_calendar(crop_type: str, language: str) -> list[dict]:
    tasks = {
        "uz": [
            {"day": 1, "task": "Maydon holatini tekshirish (NDVI)"},
            {"day": 2, "task": "Sug'orish rejasi — NASA ob-havo"},
            {"day": 3, "task": "O'g'it yoki parvarish"},
            {"day": 4, "task": "Zararkunanda monitoring"},
            {"day": 5, "task": "Kasallik belgilarini foto bilan tekshirish"},
            {"day": 6, "task": "Yomg'ir prognozi — sug'orishni moslashtirish"},
            {"day": 7, "task": "Hosil bashoratini yangilash"},
        ],
        "ru": [
            {"day": 1, "task": "Проверка поля (NDVI)"},
            {"day": 2, "task": "План полива — NASA погода"},
            {"day": 3, "task": "Удобрение или уход"},
            {"day": 4, "task": "Мониторинг вредителей"},
            {"day": 5, "task": "Фото-проверка болезней"},
            {"day": 6, "task": "Корректировка полива по дождю"},
            {"day": 7, "task": "Обновить прогноз урожая"},
        ],
        "en": [
            {"day": 1, "task": "Field check (NDVI)"},
            {"day": 2, "task": "Irrigation plan — NASA weather"},
            {"day": 3, "task": "Fertilizer or care"},
            {"day": 4, "task": "Pest monitoring"},
            {"day": 5, "task": "Disease photo check"},
            {"day": 6, "task": "Adjust irrigation for rain"},
            {"day": 7, "task": "Update yield forecast"},
        ],
    }
    return tasks.get(language, tasks["uz"])
