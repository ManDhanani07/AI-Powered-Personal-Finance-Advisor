"""
Pydantic Schemas for User Profile and Account Management.
"""

from typing import Optional
from datetime import date
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


class DeleteAccountRequest(BaseModel):
    password: str = Field(..., min_length=1)
    confirmation_text: str = Field(..., description="Must equal DELETE to confirm")
