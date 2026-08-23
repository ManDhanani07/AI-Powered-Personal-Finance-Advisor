"""
Application Settings & Configuration using Pydantic Settings v2.
"""

from typing import List, Union, Optional
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
from app.core.constants import EnvironmentOption


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=True,
    )

    # Application
    APP_NAME: str = "AI-Powered Personal Finance Advisor API"
    APP_ENV: EnvironmentOption = EnvironmentOption.DEVELOPMENT
    DEBUG: bool = True
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "super-secret-default-key-change-in-production-32-bytes"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30  # 30 days
    GEMINI_API_KEY: Optional[str] = None

    # Admin Security Credentials (Stored securely in .env)
    ADMIN_EMAIL: str = "fintech0707@gmail.com"
    ADMIN_PASSWORD_HASH: str = "$2b$12$Ksh4tCK4JtIUfW3.8/QHCOFQMJee6HSRSY0IRufNIQN5QCXuNDkdS"

    # Database
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "Man@@@17"
    POSTGRES_HOST: str = "127.0.0.1"
    POSTGRES_PORT: int = 5432
    POSTGRES_DB: str = "finance_advisor_db"
    DATABASE_URL: str = Field(
        default="postgresql+asyncpg://postgres:Man%40%40%4017@127.0.0.1:5432/finance_advisor_db"
    )
    DATABASE_URL_SYNC: str = Field(
        default="postgresql://postgres:Man%40%40%4017@127.0.0.1:5432/finance_advisor_db"
    )

    # Database Connection Pool Settings
    DB_POOL_SIZE: int = 10
    DB_MAX_OVERFLOW: int = 20
    DB_POOL_RECYCLE: int = 1800
    DB_POOL_PRE_PING: bool = True

    # Security & CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ]
    ALLOWED_HOSTS: List[str] = ["localhost", "127.0.0.1", "testserver", "*"]

    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FILE_PATH: str = "logs/backend.log"

    # SMTP / Email Configuration
    SMTP_SERVER: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USERNAME: str = "fintech0707@gmail.com"
    SMTP_PASSWORD: str = ""

    # Google OAuth 2.0 Credentials (loaded dynamically from environment / .env)
    GOOGLE_CLIENT_ID: Optional[str] = None
    GOOGLE_CLIENT_SECRET: Optional[str] = None
    GOOGLE_REDIRECT_URI: str = "http://localhost:8000/api/v1/auth/google/callback"

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, list):
            return v
        return ["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:3000", "http://127.0.0.1:5173"]

    @property
    def is_development(self) -> bool:
        return self.APP_ENV == EnvironmentOption.DEVELOPMENT

    @property
    def is_production(self) -> bool:
        return self.APP_ENV == EnvironmentOption.PRODUCTION


settings = Settings()
