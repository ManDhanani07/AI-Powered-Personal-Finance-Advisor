from pydantic import BaseModel, Field, field_validator
from typing import Optional
from uuid import UUID
from datetime import datetime

class BudgetCreate(BaseModel):
    category_id: UUID = Field(..., description="Category UUID under budget constraint")
    monthly_limit: float = Field(..., description="Budget monthly spending limit")
    warning_percentage: int = Field(default=80, ge=1, le=100, description="Warning limit percentage trigger")
    month: int = Field(..., ge=1, le=12, description="Target calendar month (1-12)")
    year: int = Field(..., ge=2000, le=2100, description="Target calendar year")
    currency: str = Field(default="INR", min_length=3, max_length=3, description="Currency ISO code")

    @field_validator("monthly_limit")
    @classmethod
    def validate_amount(cls, v: float) -> float:
        if v <= 0.0:
            raise ValueError("Monthly limit must be greater than zero.")
        return v

    @field_validator("currency")
    @classmethod
    def validate_currency(cls, v: str) -> str:
        v = v.strip().upper()
        if len(v) != 3 or not v.isalpha():
            raise ValueError("Currency must be a 3-letter ISO code.")
        return v

    model_config = {
        "json_schema_extra": {
            "example": {
                "category_id": "42dbceb5-4a5c-42ea-8226-5b4d6d1cf98f",
                "monthly_limit": 6000.0,
                "warning_percentage": 80,
                "month": 7,
                "year": 2026,
                "currency": "INR"
            }
        }
    }


class BudgetUpdate(BaseModel):
    category_id: Optional[UUID] = Field(None)
    monthly_limit: Optional[float] = Field(None)
    warning_percentage: Optional[int] = Field(None, ge=1, le=100)
    month: Optional[int] = Field(None, ge=1, le=12)
    year: Optional[int] = Field(None, ge=2000, le=2100)
    currency: Optional[str] = Field(None, min_length=3, max_length=3)

    @field_validator("monthly_limit")
    @classmethod
    def validate_amount(cls, v: Optional[float]) -> Optional[float]:
        if v is not None and v <= 0.0:
            raise ValueError("Monthly limit must be greater than zero.")
        return v

    @field_validator("currency")
    @classmethod
    def validate_currency(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            v = v.strip().upper()
            if len(v) != 3 or not v.isalpha():
                raise ValueError("Currency must be a 3-letter ISO code.")
        return v


class BudgetResponse(BaseModel):
    id: UUID
    user_id: UUID
    category_id: UUID
    monthly_limit: float
    warning_percentage: int
    month: int
    year: int
    currency: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
