from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from uuid import UUID
from datetime import datetime

class TransactionCreate(BaseModel):
    account_id: UUID = Field(..., description="Target Account UUID")
    category_id: Optional[UUID] = Field(None, description="Target Category UUID")
    merchant: Optional[str] = Field(None, max_length=100, description="Merchant name")
    amount: float = Field(..., description="Monetary transaction size, must be positive")
    transaction_type: str = Field(..., description="Transaction type: Expense, Income, Investment, Transfer")
    payment_method: Optional[str] = Field(None, max_length=50, description="Payment method used, e.g. UPI, Cash, Card")
    transaction_date: Optional[datetime] = Field(None, description="User defined transaction date")
    description: Optional[str] = Field(None, max_length=255, description="Brief purchase summary")
    notes: Optional[str] = Field(None, description="Detailed annotations")
    location: Optional[str] = Field(None, max_length=100, description="Location of transaction")
    ai_predicted_category: Optional[str] = Field(None, max_length=100, description="AI predicted category name")
    prediction_confidence: Optional[float] = Field(None, ge=0.0, le=1.0, description="AI prediction confidence score")
    is_user_corrected: bool = Field(default=False, description="Flag indicating user manual category override")
    receipt_image: Optional[str] = Field(None, max_length=512, description="Receipt photo reference")

    @field_validator("amount")
    @classmethod
    def validate_amount(cls, v: float) -> float:
        if v <= 0.0:
            raise ValueError("Amount must be greater than zero.")
        return v

    @field_validator("transaction_type")
    @classmethod
    def validate_type(cls, v: str) -> str:
        v_clean = v.strip()
        allowed = {'Expense', 'Income', 'Investment', 'Transfer'}
        for a in allowed:
            if a.lower() == v_clean.lower():
                return a
        raise ValueError(f"Transaction type must be one of: {', '.join(allowed)}")

    model_config = {
        "json_schema_extra": {
            "example": {
                "merchant": "McDonald's",
                "amount": 450.0,
                "transaction_type": "Expense",
                "payment_method": "UPI",
                "account_id": "42dbceb5-4a5c-42ea-8226-5b4d6d1cf98f",
                "transaction_date": "2026-07-18T00:00:00Z",
                "description": "Big Mac Meal",
                "notes": "",
                "location": "Ahmedabad",
                "category_id": None,
                "ai_predicted_category": None,
                "prediction_confidence": None,
                "is_user_corrected": False,
                "receipt_image": ""
            }
        }
    }


class TransactionUpdate(BaseModel):
    account_id: Optional[UUID] = Field(None)
    category_id: Optional[UUID] = Field(None)
    merchant: Optional[str] = Field(None, max_length=100)
    amount: Optional[float] = Field(None)
    transaction_type: Optional[str] = Field(None)
    payment_method: Optional[str] = Field(None, max_length=50)
    transaction_date: Optional[datetime] = Field(None)
    description: Optional[str] = Field(None, max_length=255)
    notes: Optional[str] = Field(None)
    location: Optional[str] = Field(None, max_length=100)
    ai_predicted_category: Optional[str] = Field(None, max_length=100)
    prediction_confidence: Optional[float] = Field(None, ge=0.0, le=1.0)
    is_user_corrected: Optional[bool] = Field(None)
    receipt_image: Optional[str] = Field(None, max_length=512)

    @field_validator("amount")
    @classmethod
    def validate_amount(cls, v: Optional[float]) -> Optional[float]:
        if v is not None and v <= 0.0:
            raise ValueError("Amount must be greater than zero.")
        return v

    @field_validator("transaction_type")
    @classmethod
    def validate_type(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            v_clean = v.strip()
            allowed = {'Expense', 'Income', 'Investment', 'Transfer'}
            for a in allowed:
                if a.lower() == v_clean.lower():
                    return a
            raise ValueError(f"Transaction type must be one of: {', '.join(allowed)}")
        return v


class TransactionResponse(BaseModel):
    id: UUID
    user_id: UUID
    account_id: UUID
    category_id: Optional[UUID] = None
    merchant: Optional[str] = None
    amount: float
    transaction_type: str
    payment_method: Optional[str] = None
    transaction_date: datetime
    description: Optional[str] = None
    notes: Optional[str] = None
    location: Optional[str] = None
    ai_predicted_category: Optional[str] = None
    prediction_confidence: Optional[float] = None
    is_user_corrected: bool
    receipt_image: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PaginatedTransactionResponse(BaseModel):
    total: int
    skip: int
    limit: int
    items: List[TransactionResponse]
