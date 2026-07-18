from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from uuid import UUID
from datetime import datetime

class TransactionCreate(BaseModel):
    category_id: Optional[UUID] = Field(None, description="Target Category UUID")
    src_account_id: Optional[UUID] = Field(None, description="Funding source (required for expense/transfer)")
    dest_account_id: Optional[UUID] = Field(None, description="Funding destination (required for income/transfer)")
    amount: float = Field(..., description="Monetary transaction size, must be positive")
    type: str = Field(..., description="Transaction type: income, expense, transfer")
    status: str = Field(default="completed", description="Status: pending, completed, failed")
    description: Optional[str] = Field(None, max_length=255, description="Brief purchase summary")
    transaction_date: Optional[datetime] = Field(None, description="User defined transaction date")
    notes: Optional[str] = Field(None, description="Detailed annotations")

    @field_validator("amount")
    @classmethod
    def validate_amount(cls, v: float) -> float:
        if v <= 0.0:
            raise ValueError("Amount must be greater than zero.")
        return v

    @field_validator("type")
    @classmethod
    def validate_type(cls, v: str) -> str:
        v = v.strip().lower()
        if v not in {'income', 'expense', 'transfer'}:
            raise ValueError("Transaction type must be: income, expense, or transfer.")
        return v

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        v = v.strip().lower()
        if v not in {'pending', 'completed', 'failed'}:
            raise ValueError("Transaction status must be: pending, completed, or failed.")
        return v


class TransactionUpdate(BaseModel):
    category_id: Optional[UUID] = Field(None)
    src_account_id: Optional[UUID] = Field(None)
    dest_account_id: Optional[UUID] = Field(None)
    amount: Optional[float] = Field(None)
    type: Optional[str] = Field(None)
    status: Optional[str] = Field(None)
    description: Optional[str] = Field(None, max_length=255)
    transaction_date: Optional[datetime] = Field(None)
    notes: Optional[str] = Field(None)

    @field_validator("amount")
    @classmethod
    def validate_amount(cls, v: Optional[float]) -> Optional[float]:
        if v is not None and v <= 0.0:
            raise ValueError("Amount must be greater than zero.")
        return v

    @field_validator("type")
    @classmethod
    def validate_type(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            v = v.strip().lower()
            if v not in {'income', 'expense', 'transfer'}:
                raise ValueError("Transaction type must be: income, expense, or transfer.")
        return v

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            v = v.strip().lower()
            if v not in {'pending', 'completed', 'failed'}:
                raise ValueError("Transaction status must be: pending, completed, or failed.")
        return v


class TransactionResponse(BaseModel):
    id: UUID
    user_id: UUID
    category_id: Optional[UUID] = None
    src_account_id: Optional[UUID] = None
    dest_account_id: Optional[UUID] = None
    amount: float
    type: str
    status: str
    description: Optional[str] = None
    transaction_date: datetime
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PaginatedTransactionResponse(BaseModel):
    total: int
    skip: int
    limit: int
    items: List[TransactionResponse]
