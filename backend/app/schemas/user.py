from typing import Optional, Dict, Any, List
from datetime import date, datetime
from decimal import Decimal
from pydantic import BaseModel, Field


class UpdateProfileRequest(BaseModel):
    first_name: Optional[str] = Field(None, min_length=1, max_length=100)
    last_name: Optional[str] = Field(None, min_length=1, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)
    gender: Optional[str] = Field(None, max_length=20)
    date_of_birth: Optional[date] = None
    occupation: Optional[str] = Field(None, max_length=100)
    monthly_income: Optional[Decimal] = Field(None, ge=Decimal("0.00"))
    currency: Optional[str] = Field(None, max_length=10)
    city: Optional[str] = Field(None, max_length=100)
    state: Optional[str] = Field(None, max_length=100)
    country: Optional[str] = Field(None, max_length=100)
    membership_tier: Optional[str] = Field(None, max_length=50)


class DeleteAccountRequest(BaseModel):
    password: str = Field(..., min_length=1)
    confirmation_text: str = Field(..., description="Must equal DELETE to confirm")


class UserPreferencesSchema(BaseModel):
    theme: str = Field(default="dark", description="dark, light, or system")
    accent_color: str = Field(default="emerald", description="emerald, cyan, violet, amber, rose, blue")
    transaction_density: str = Field(default="comfortable", description="comfortable or compact")
    dashboard_animations: bool = Field(default=True)
    reduce_motion: bool = Field(default=False)
    
    currency: str = Field(default="INR")
    country: str = Field(default="India")
    language: str = Field(default="English")
    timezone: str = Field(default="Asia/Kolkata")
    date_format: str = Field(default="21 Aug 2026")
    number_format: str = Field(default="Indian")
    first_day_of_week: str = Field(default="Monday")
    
    notifications: Dict[str, Dict[str, bool]] = Field(default_factory=lambda: {
        "budget_80": {"push": True, "email": True, "whatsapp": False},
        "budget_exceeded": {"push": True, "email": True, "whatsapp": False},
        "large_transaction": {"push": True, "email": True, "whatsapp": False},
        "unusual_spending": {"push": True, "email": True, "whatsapp": False},
        "salary_received": {"push": True, "email": True, "whatsapp": False},
        "goal_milestone": {"push": True, "email": True, "whatsapp": False},
        "upcoming_emi": {"push": True, "email": True, "whatsapp": False},
        "upcoming_bill": {"push": True, "email": True, "whatsapp": False},
        "ai_insights": {"push": True, "email": False, "whatsapp": False},
    })
    quiet_hours_enabled: bool = Field(default=False)
    quiet_hours_start: str = Field(default="22:00")
    quiet_hours_end: str = Field(default="07:00")
    notification_frequency: str = Field(default="instant", description="instant, daily, weekly")
    
    show_merchant_logo: bool = Field(default=True)
    show_transaction_description: bool = Field(default=True)
    default_transaction_sorting: str = Field(default="date_desc")
    default_transaction_date_range: str = Field(default="30d")
    show_completed_only: bool = Field(default=False)


class UpdatePreferencesRequest(BaseModel):
    preferences: Dict[str, Any]


class TwoFactorToggleRequest(BaseModel):
    enabled: bool


class SecurityAlertsToggleRequest(BaseModel):
    enabled: bool


class SessionItemResponse(BaseModel):
    id: str
    device: str
    browser: str
    os: str
    ip: str
    location: str
    is_current: bool
    last_active: str
    created_at: datetime


class LoginHistoryItemResponse(BaseModel):
    id: str
    date_time: str
    device: str
    browser: str
    ip: str
    location: str
    status: str
    failure_reason: Optional[str] = None
