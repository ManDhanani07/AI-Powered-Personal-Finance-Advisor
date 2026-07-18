from pydantic import BaseModel, Field, field_validator
from typing import Optional
from uuid import UUID
from datetime import datetime

class AccountCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description="Friendly account label")
    institution: Optional[str] = Field(None, max_length=100, description="Name of the financial institution")
    account_type: str = Field(..., description="Account type: Savings, Current, Cash, Credit Card, Wallet, Investment")
    balance: float = Field(default=0.0000, description="Starting cash amount")
    currency: str = Field(default="INR", min_length=3, max_length=3, description="Base ISO currency")
    is_default: bool = Field(default=False, description="Whether this is the default account")

    @field_validator("account_type")
    @classmethod
    def validate_type(cls, v: str) -> str:
        v_clean = v.strip()
        allowed = {'Savings', 'Current', 'Cash', 'Credit Card', 'Wallet', 'Investment'}
        for a in allowed:
            if a.lower() == v_clean.lower():
                return a
        raise ValueError(f"Account type must be one of: {', '.join(allowed)}")

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
                "name": "HDFC Savings",
                "institution": "HDFC Bank",
                "account_type": "Savings",
                "balance": 50000.0,
                "currency": "INR",
                "is_default": True
            }
        }
    }


class AccountUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    institution: Optional[str] = Field(None, max_length=100)
    account_type: Optional[str] = Field(None)
    balance: Optional[float] = Field(None)
    currency: Optional[str] = Field(None, min_length=3, max_length=3)
    is_default: Optional[bool] = Field(None)

    @field_validator("account_type")
    @classmethod
    def validate_type(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            v_clean = v.strip()
            allowed = {'Savings', 'Current', 'Cash', 'Credit Card', 'Wallet', 'Investment'}
            for a in allowed:
                if a.lower() == v_clean.lower():
                    return a
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

    model_config = {
        "json_schema_extra": {
            "example": {
                "name": "HDFC Savings",
                "institution": "HDFC Bank",
                "account_type": "Savings",
                "balance": 55000.0,
                "currency": "INR",
                "is_default": True
            }
        }
    }


class AccountResponse(BaseModel):
    id: UUID
    user_id: UUID
    name: str
    institution: Optional[str] = None
    account_type: str
    balance: float
    currency: str
    is_default: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": "e4a2d5cf-72b1-4c6e-8e3d-0d62bf3f9829",
                "user_id": "87c3e5df-c49b-4e16-ba62-a548323c21a4",
                "name": "HDFC Savings",
                "institution": "HDFC Bank",
                "account_type": "Savings",
                "balance": 50000.0,
                "currency": "INR",
                "is_default": True,
                "created_at": "2026-07-18T14:11:31Z",
                "updated_at": "2026-07-18T14:11:31Z"
            }
        }

