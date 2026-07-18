from pydantic import BaseModel, Field, field_validator
from typing import Optional

class UserUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=2, max_length=100, description="Updated display name")
    phone: Optional[str] = Field(None, description="User phone number")
    occupation: Optional[str] = Field(None, description="Occupation or student status")
    monthly_income: Optional[float] = Field(None, ge=0.0, description="Monthly income size")
    preferred_currency: Optional[str] = Field(None, description="ISO 3-letter currency code")
    language: Optional[str] = Field(None, description="Preferred interface language")
    timezone: Optional[str] = Field(None, max_length=50, description="Preferred timezone label")
    profile_photo: Optional[str] = Field(None, description="Profile photo URL or path reference")

    @field_validator("preferred_currency")
    @classmethod
    def validate_currency(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            v = v.strip().upper()
            if len(v) != 3 or not v.isalpha():
                raise ValueError("Currency must be a 3-letter alphabetic ISO code (e.g. USD).")
        return v

    model_config = {
        "json_schema_extra": {
            "example": {
                "full_name": "Man Dhanani",
                "phone": "+919876543210",
                "occupation": "Student",
                "monthly_income": 60000.0,
                "preferred_currency": "INR",
                "language": "English",
                "timezone": "Asia/Kolkata",
                "profile_photo": ""
            }
        }
    }
