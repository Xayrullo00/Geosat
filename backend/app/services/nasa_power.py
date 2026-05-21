from datetime import datetime, timedelta

import httpx

NASA_POWER_URL = "https://power.larc.nasa.gov/api/temporal/daily/point"


async def fetch_nasa_power(lat: float, lon: float, days: int = 14) -> dict:
    end = datetime.utcnow().date()
    start = end - timedelta(days=days)
    params = {
        "parameters": "T2M,PRECTOTCORR,ALLSKY_SFC_SW_DWN,RH2M,WS2M",
        "community": "AG",
        "longitude": lon,
        "latitude": lat,
        "start": start.strftime("%Y%m%d"),
        "end": end.strftime("%Y%m%d"),
        "format": "JSON",
    }
    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.get(NASA_POWER_URL, params=params)
        resp.raise_for_status()
        data = resp.json()
    return _normalize_power(data)


def _normalize_power(raw: dict) -> dict:
    params = raw.get("properties", {}).get("parameter", {})
    dates = sorted(params.get("T2M", {}).keys())
    series = []
    for d in dates[-14:]:
        series.append(
            {
                "date": d,
                "temp_c": round(params.get("T2M", {}).get(d, 0), 1),
                "rain_mm": round(params.get("PRECTOTCORR", {}).get(d, 0), 2),
                "solar_mj": round(params.get("ALLSKY_SFC_SW_DWN", {}).get(d, 0), 2),
                "humidity_pct": round(params.get("RH2M", {}).get(d, 0), 1),
                "wind_ms": round(params.get("WS2M", {}).get(d, 0), 2),
            }
        )
    latest = series[-1] if series else {}
    irrigation = _irrigation_advice(latest, series)
    return {
        "source": "NASA POWER API",
        "series": series,
        "latest": latest,
        "irrigation": irrigation,
    }


def _irrigation_advice(latest: dict, series: list[dict]) -> dict:
    rain_7d = sum(p.get("rain_mm", 0) for p in series[-7:])
    temp = latest.get("temp_c", 25)
    if rain_7d > 15:
        return {"should_irrigate": False, "reason_key": "rain_sufficient", "amount_mm": 0}
    if temp > 32 and rain_7d < 3:
        return {"should_irrigate": True, "reason_key": "hot_dry", "amount_mm": 25}
    if rain_7d < 5:
        return {"should_irrigate": True, "reason_key": "low_rain", "amount_mm": 18}
    return {"should_irrigate": False, "reason_key": "moderate", "amount_mm": 0}
