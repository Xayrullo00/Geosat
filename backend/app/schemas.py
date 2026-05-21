from datetime import date

from pydantic import BaseModel, EmailStr, Field, field_validator


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    full_name: str = Field(min_length=2, max_length=200)
    language: str = Field(default="uz", pattern="^(uz|ru|en)$")

    @field_validator("password")
    @classmethod
    def strong_password(cls, v: str) -> str:
        if not any(c.isupper() for c in v) or not any(c.islower() for c in v) or not any(c.isdigit() for c in v):
            raise ValueError("Password must include upper, lower, and a digit")
        return v


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    profile_complete: bool


class ProfileUpdate(BaseModel):
    phone: str | None = None
    segment: str | None = None
    language: str | None = None
    region: str | None = None
    district: str | None = None
    village: str | None = None
    farm_name: str | None = None
    total_area_ha: float | None = None
    primary_crops: list[str] | None = None
    soil_type: str | None = None
    irrigation_type: str | None = None
    experience_years: int | None = None
    profile_complete: bool | None = None


class FieldCreate(BaseModel):
    name: str
    crop_type: str
    area_ha: float = Field(gt=0, le=10000)
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    planted_date: date | None = None
    field_number: str | None = None


class YieldReportCreate(BaseModel):
    crop_type: str
    area_ha: float = Field(gt=0)
    expected_yield_tons: float = Field(gt=0)
    harvest_date: date | None = None
    region: str
    district: str | None = None


class DiseaseAnalyzeRequest(BaseModel):
    crop_type: str
    symptoms: str
    language: str = "uz"


class AdvisoryRequest(BaseModel):
    question: str
    crop_type: str | None = None
    language: str = "uz"
