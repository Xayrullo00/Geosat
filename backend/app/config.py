from functools import lru_cache

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    secret_key: str = Field(..., min_length=32, alias="SECRET_KEY")
    database_url: str = Field(default="sqlite+aiosqlite:///./agrosat.db", alias="DATABASE_URL")
    cors_origins: str = Field(
        default="http://localhost:5173,http://127.0.0.1:5173",
        alias="CORS_ORIGINS",
    )
    access_token_expire_minutes: int = Field(default=1440, alias="ACCESS_TOKEN_EXPIRE_MINUTES")
    anthropic_api_key: str | None = Field(default=None, alias="ANTHROPIC_API_KEY")
    openweather_api_key: str | None = Field(default=None, alias="OPENWEATHER_API_KEY")
    nasa_earthdata_token: str | None = Field(default=None, alias="NASA_EARTHDATA_TOKEN")

    @field_validator("secret_key")
    @classmethod
    def reject_weak_secret(cls, v: str) -> str:
        weak = {"changeme", "secret", "password", "admin", "default", "test", "agrosat"}
        if v.lower() in weak or v.lower().startswith("your-"):
            raise ValueError("SECRET_KEY is too weak. Use a random 32+ character string.")
        return v

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
