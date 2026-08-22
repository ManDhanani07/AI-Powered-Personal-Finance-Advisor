"""
Pydantic v2 Schemas for Authentication and User Profile payloads.
"""

from typing import Optional
from datetime import date, datetime
from decimal import Decimal
from uuid import UUID
from pydantic import BaseModel, EmailStr, Field, ConfigDict


class RegisterRequest(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=8)
    phone: Optional[str] = Field(None, max_length=20)
    monthly_income: Optional[Decimal] = Field(default=Decimal("0.00"), ge=Decimal("0.00"))
    currency: Optional[str] = Field(default="INR", max_length=10)
    city: Optional[str] = Field(None, max_length=100)
    country: Optional[str] = Field(default="India", max_length=100)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    remember_me: bool = Field(default=False)


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "Bearer"
    expires_in: int


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    first_name: str
    last_name: str
    email: EmailStr
    phone: Optional[str] = None
    gender: Optional[str] = None
    date_of_birth: Optional[date] = None
    occupation: Optional[str] = None
    monthly_income: Decimal
    currency: str
    city: Optional[str] = None
    state: Optional[str] = None
    country: str
    profile_picture: Optional[str] = None
    is_verified: bool
    is_active: bool
    email_verified: bool
    last_login: Optional[datetime] = None
    two_factor_enabled: bool = False
    password_changed_at: Optional[datetime] = None
    security_alerts_enabled: bool = True
    google_id: Optional[str] = None
    auth_provider: str = "email"
    preferences: Optional[dict] = None
    created_at: datetime
    updated_at: datetime


class LoginResponse(BaseModel):
    tokens: TokenResponse
    user: UserResponse


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class RegisterResponse(BaseModel):
    message: str
    verification_required: bool = True
    email: str


class VerifyEmailRequest(BaseModel):
    email: EmailStr
    otp: str = Field(..., min_length=6, max_length=6, pattern=r"^\d{6}$", description="6-digit numeric OTP")


class ResendOTPRequest(BaseModel):
    email: EmailStr
    purpose: Optional[str] = Field(default="SIGNUP", description="SIGNUP, PASSWORD_RESET, or CHANGE_EMAIL")


class VerifyResetOTPRequest(BaseModel):
    email: EmailStr
    otp: str = Field(..., min_length=6, max_length=6, pattern=r"^\d{6}$", description="6-digit numeric OTP")


class ResetPasswordRequest(BaseModel):
    email: Optional[EmailStr] = None
    token: str
    new_password: str = Field(..., min_length=8)


class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str = Field(..., min_length=8)


class GoogleOAuthRequest(BaseModel):
    id_token: str = Field(..., description="Google OAuth ID token or Access Token")

