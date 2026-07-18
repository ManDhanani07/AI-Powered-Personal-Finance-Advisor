from pydantic import BaseModel, Field, field_validator
from typing import Optional

class UserUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=2, max_length=100, description="Updated display name")
    preferred_currency: Optional[str] = Field(None, description="ISO 3-letter currency code")
    timezone: Optional[str] = Field(None, max_length=50, description="Preferred timezone label")

    @field_validator("preferred_currency")
    @classmethod
    def validate_currency(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            v = v.strip().upper()
            if len(v) != 3 or not v.isalpha():
                raise ValueError("Currency must be a 3-letter alphabetic ISO code (e.g. USD).")
        return v
