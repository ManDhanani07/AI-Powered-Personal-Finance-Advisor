from pydantic import BaseModel, Field, field_validator
from typing import Optional
from uuid import UUID
from datetime import datetime, date

class BudgetCreate(BaseModel):
    category_id: UUID = Field(..., description="Category UUID under budget constraint")
    amount_limit: float = Field(..., description="Budget spending limit")
    period: str = Field(default="monthly", description="Budget period: weekly, monthly, yearly, custom")
    start_date: date = Field(..., description="Start date of budget")
    end_date: date = Field(..., description="End date of budget")

    @field_validator("amount_limit")
    @classmethod
    def validate_amount(cls, v: float) -> float:
        if v <= 0.0:
            raise ValueError("Amount limit must be greater than zero.")
        return v

    @field_validator("period")
    @classmethod
    def validate_period(cls, v: str) -> str:
        v = v.strip().lower()
        if v not in {'weekly', 'monthly', 'yearly', 'custom'}:
            raise ValueError("Period must be: weekly, monthly, yearly, or custom.")
        return v


class BudgetUpdate(BaseModel):
    category_id: Optional[UUID] = Field(None)
    amount_limit: Optional[float] = Field(None)
    period: Optional[str] = Field(None)
    start_date: Optional[date] = Field(None)
    end_date: Optional[date] = Field(None)

    @field_validator("amount_limit")
    @classmethod
    def validate_amount(cls, v: Optional[float]) -> Optional[float]:
        if v is not None and v <= 0.0:
            raise ValueError("Amount limit must be greater than zero.")
        return v

    @field_validator("period")
    @classmethod
    def validate_period(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            v = v.strip().lower()
            if v not in {'weekly', 'monthly', 'yearly', 'custom'}:
                raise ValueError("Period must be: weekly, monthly, yearly, or custom.")
        return v


class BudgetResponse(BaseModel):
    id: UUID
    user_id: UUID
    category_id: UUID
    amount_limit: float
    period: str
    start_date: date
    end_date: date
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
