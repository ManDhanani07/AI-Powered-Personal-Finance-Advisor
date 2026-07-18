import re
from uuid import UUID
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, field_validator

# Regex email validator
EMAIL_REGEX = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"

class UserRegister(BaseModel):
    email: str = Field(..., description="User email address")
    full_name: str = Field(..., min_length=2, max_length=100, description="User full name")
    password: str = Field(..., min_length=8, description="Strong user password")
    phone: Optional[str] = Field(None, description="User phone number")
    occupation: Optional[str] = Field(None, description="Occupation or student status")
    monthly_income: float = Field(0.0, ge=0.0, description="Monthly income amount")
    preferred_currency: str = Field("USD", min_length=3, max_length=3, description="Preferred currency ISO code")
    language: str = Field("English", description="User preferred language")
    timezone: str = Field("UTC", description="User local timezone")

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

    model_config = {
        "json_schema_extra": {
            "example": {
                "email": "mandhanani07@gmail.com",
                "full_name": "Man Dhanani",
                "password": "Man@@@17",
                "phone": "+919876543210",
                "occupation": "Student",
                "monthly_income": 50000.0,
                "preferred_currency": "INR",
                "language": "English",
                "timezone": "Asia/Kolkata"
            }
        }
    }


class UserLogin(BaseModel):
    email: str = Field(..., description="Registered user email", examples=["mandhanani07@gmail.com"])
    password: str = Field(..., description="User password", examples=["Man@@@17"])


class UserResponse(BaseModel):
    id: UUID
    email: str
    full_name: str
    is_active: bool
    is_verified: bool
    preferred_currency: str
    timezone: str
    phone: Optional[str] = None
    occupation: Optional[str] = None
    monthly_income: float
    language: str
    profile_photo: Optional[str] = None
    last_login: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": "e4a2d5cf-72b1-4c6e-8e3d-0d62bf3f9829",
                "email": "mandhanani07@gmail.com",
                "full_name": "Man Dhanani",
                "is_active": True,
                "is_verified": False,
                "preferred_currency": "INR",
                "timezone": "Asia/Kolkata",
                "phone": "+919876543210",
                "occupation": "Student",
                "monthly_income": 50000.0,
                "language": "English",
                "profile_photo": "https://example.com/profiles/avatar.png",
                "last_login": "2026-07-18T14:11:31Z",
                "created_at": "2026-07-17T18:07:10Z",
                "updated_at": "2026-07-18T14:11:31Z"
            }
        }


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

    model_config = {
        "json_schema_extra": {
            "example": {
                "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJtYW5kaGFuYW5pMDdAZ21haWwuY29tIn0.xxxx",
                "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJtYW5kaGFuYW5pMDdAZ21haWwuY29tIn0.yyyy",
                "token_type": "bearer"
            }
        }
    }


class TokenRefreshRequest(BaseModel):
    refresh_token: str

    model_config = {
        "json_schema_extra": {
            "example": {
                "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJtYW5kaGFuYW5pMDdAZ21haWwuY29tIn0.yyyy"
            }
        }
    }
