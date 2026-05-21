from datetime import date, datetime

from sqlalchemy import Boolean, Date, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    full_name: Mapped[str] = mapped_column(String(200))
    phone: Mapped[str | None] = mapped_column(String(30), nullable=True)
    segment: Mapped[str] = mapped_column(String(50))  # farmer, gardener, peasant, small_plot
    language: Mapped[str] = mapped_column(String(5), default="uz")
    region: Mapped[str | None] = mapped_column(String(100), nullable=True)
    district: Mapped[str | None] = mapped_column(String(100), nullable=True)
    village: Mapped[str | None] = mapped_column(String(100), nullable=True)
    farm_name: Mapped[str | None] = mapped_column(String(200), nullable=True)
    total_area_ha: Mapped[float | None] = mapped_column(Float, nullable=True)
    primary_crops: Mapped[str | None] = mapped_column(Text, nullable=True)  # JSON list as text
    soil_type: Mapped[str | None] = mapped_column(String(80), nullable=True)
    irrigation_type: Mapped[str | None] = mapped_column(String(80), nullable=True)
    experience_years: Mapped[int | None] = mapped_column(Integer, nullable=True)
    profile_complete: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    fields: Mapped[list["Field"]] = relationship(back_populates="owner", cascade="all, delete-orphan")
    yield_reports: Mapped[list["YieldReport"]] = relationship(back_populates="owner", cascade="all, delete-orphan")


class Field(Base):
    __tablename__ = "fields"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    name: Mapped[str] = mapped_column(String(120))
    crop_type: Mapped[str] = mapped_column(String(80))
    area_ha: Mapped[float] = mapped_column(Float)
    latitude: Mapped[float] = mapped_column(Float)
    longitude: Mapped[float] = mapped_column(Float)
    planted_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    field_number: Mapped[str | None] = mapped_column(String(50), nullable=True)

    owner: Mapped["User"] = relationship(back_populates="fields")


class YieldReport(Base):
    __tablename__ = "yield_reports"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    crop_type: Mapped[str] = mapped_column(String(80))
    area_ha: Mapped[float] = mapped_column(Float)
    expected_yield_tons: Mapped[float] = mapped_column(Float)
    harvest_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    region: Mapped[str] = mapped_column(String(100))
    district: Mapped[str | None] = mapped_column(String(100), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    owner: Mapped["User"] = relationship(back_populates="yield_reports")
