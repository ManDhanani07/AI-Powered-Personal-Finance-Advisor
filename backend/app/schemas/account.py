from pydantic import BaseModel, Field, field_validator
from typing import Optional
from uuid import UUID
from datetime import datetime

class AccountCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description="Friendly account label")
    type: str = Field(..., description="Account type: checking, savings, credit_card, investment, cash, loan")
    balance: float = Field(default=0.0000, description="Starting cash amount")
    currency: str = Field(default="USD", min_length=3, max_length=3, description="Base ISO currency")

    @field_validator("type")
    @classmethod
    def validate_type(cls, v: str) -> str:
        v = v.strip().lower()
        allowed = {'checking', 'savings', 'credit_card', 'investment', 'cash', 'loan'}
        if v not in allowed:
            raise ValueError(f"Account type must be one of: {', '.join(allowed)}")
        return v

    @field_validator("currency")
    @classmethod
    def validate_currency(cls, v: str) -> str:
        v = v.strip().upper()
        if len(v) != 3 or not v.isalpha():
            raise ValueError("Currency must be a 3-letter ISO code.")
        return v


class AccountUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    type: Optional[str] = Field(None)
    balance: Optional[float] = Field(None)
    currency: Optional[str] = Field(None, min_length=3, max_length=3)
    is_active: Optional[bool] = Field(None)

    @field_validator("type")
    @classmethod
    def validate_type(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            v = v.strip().lower()
            allowed = {'checking', 'savings', 'credit_card', 'investment', 'cash', 'loan'}
            if v not in allowed:
                raise ValueError(f"Account type must be one of: {', '.join(allowed)}")
        return v

    @field_validator("currency")
    @classmethod
    def validate_currency(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            v = v.strip().upper()
            if len(v) != 3 or not v.isalpha():
                raise ValueError("Currency must be a 3-letter ISO code.")
        return v


class AccountResponse(BaseModel):
    id: UUID
    user_id: UUID
    name: str
    type: str
    balance: float
    currency: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
