"""Satellite analytics — Sentinel-2 style NDVI synthesis for demo/MVP.

Production: connect Google Earth Engine with service account credentials.
"""

import hashlib
import math
from datetime import datetime, timedelta


def _seeded_ndvi(lat: float, lon: float, day_offset: int) -> float:
    key = f"{lat:.4f}:{lon:.4f}:{day_offset}"
    h = int(hashlib.sha256(key.encode()).hexdigest()[:8], 16)
    base = 0.45 + (h % 1000) / 5000
    seasonal = 0.08 * math.sin((day_offset + lat) / 30)
    return round(min(0.92, max(0.12, base + seasonal)), 3)


async def analyze_field_satellite(lat: float, lon: float, crop_type: str) -> dict:
    history = []
    for i in range(6, -1, -1):
        d = datetime.utcnow().date() - timedelta(days=i * 5)
        ndvi = _seeded_ndvi(lat, lon, i)
        history.append({"date": d.isoformat(), "ndvi": ndvi})

    current = history[-1]["ndvi"]
    prev = history[-2]["ndvi"] if len(history) > 1 else current
    delta = round(current - prev, 3)

    if current >= 0.65:
        health = "healthy"
    elif current >= 0.4:
        health = "moderate"
    else:
        health = "stressed"

    zones = _zone_breakdown(lat, lon, current)
    return {
        "source": "Sentinel-2 (Copernicus) — MVP synthesis",
        "mission": "Sentinel-2A/2B",
        "resolution_m": 10,
        "revisit_days": 5,
        "bands_used": ["B04 (Red)", "B08 (NIR)", "B11 (SWIR)", "B12 (SWIR)"],
        "indices": {
            "ndvi": current,
            "ndvi_change_5d": delta,
            "evi": round(current * 1.05, 3),
            "ndwi": round(max(0, 0.35 - (0.65 - current)), 3),
        },
        "health_status": health,
        "history": history,
        "zones": zones,
        "crop_type": crop_type,
        "anomaly_detected": delta < -0.12,
        "extra": {
            "cloud_cover_pct": 8,
            "acquisition": history[-1]["date"],
            "tile": f"T42SUA_{int(abs(lat))}{int(abs(lon))}",
            "data_quality": "high",
        },
    }


def _zone_breakdown(lat: float, lon: float, ndvi: float) -> list[dict]:
    labels = ["north", "south", "east", "west", "center"]
    zones = []
    for i, label in enumerate(labels):
        offset = (i - 2) * 0.03
        val = round(min(0.95, max(0.1, ndvi + offset)), 3)
        if val >= 0.6:
            status = "healthy"
        elif val >= 0.35:
            status = "moderate"
        else:
            status = "stressed"
        zones.append({"zone": label, "ndvi": val, "status": status})
    return zones
