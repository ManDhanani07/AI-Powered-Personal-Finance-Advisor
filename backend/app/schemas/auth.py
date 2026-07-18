import re
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field, field_validator

# Regex email validator
EMAIL_REGEX = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"

class UserRegister(BaseModel):
    email: str = Field(..., description="User email address")
    full_name: str = Field(..., min_length=2, max_length=100, description="User full name")
    password: str = Field(..., min_length=8, description="Strong user password")

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        v = v.strip().lower()
        if not re.match(EMAIL_REGEX, v):
            raise ValueError("Invalid email format")
        return v

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not re.search(r"\d", v):
            raise ValueError("Password must contain at least one digit")
        if not re.search(r"[@$!%*?&#]", v):
            raise ValueError("Password must contain at least one special character (@$!%*?&#)")
        return v


class UserLogin(BaseModel):
    email: str = Field(...)
    password: str = Field(...)


class UserResponse(BaseModel):
    id: UUID
    email: str
    full_name: str
    is_active: bool
    is_verified: bool
    preferred_currency: str
    timezone: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenRefreshRequest(BaseModel):
    refresh_token: str
