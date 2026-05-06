from pydantic import field_validator
from pydantic_settings import BaseSettings
import os 
from dotenv import load_dotenv
from typing import List

load_dotenv()

class Settings(BaseSettings):
    APP_NAME: str = "AlalAI"
    DEBUG: bool = True
    ENVIRONMENT: str = "development"

    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./alalai.db")

    SECRET_KEY: str = "change-this"
    JWT_SECRET_KEY: str = "change-this"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4o-mini"
    OPENAI_TEMPERATURE: float = 0

    FRONTEND_URL: str = "http://localhost:5173"

    @property
    def ALLOWED_ORIGINS(self) -> List[str]:
        return [origin.strip() for origin in self.FRONTEND_URL.split(",")]

    MAX_REPORTS_PER_USER: int = 3
    DUPLICATE_SIMILARITY_THRESHOLD: float = 0.82

    DEFAULT_BARANGAY_LAT: float = 14.5995
    DEFAULT_BARANGAY_LNG: float = 120.9842
    DEFAULT_MAP_ZOOM: int = 15

    UPLOAD_DIR: str = "uploads"

    @field_validator("DEBUG", mode="before")
    @classmethod
    def parse_debug(cls, value):
        if isinstance(value, str) and value.lower() in {"release", "prod", "production"}:
            return False
        return value

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
