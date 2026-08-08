"""
Pydantic v2 Schemas for Transaction Requests and Responses.
"""

from typing import Optional, List
from datetime import datetime
from decimal import Decimal
from uuid import UUID
from pydantic import BaseModel, Field, ConfigDict


class CategoryMiniResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    category_name: str
    category_type: str
    icon: Optional[str] = None
    color: Optional[str] = None


class TransactionCreateRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    amount: Decimal = Field(..., gt=Decimal("0.00"), description="Positive transaction amount")
    transaction_type: str = Field(..., description="INCOME, EXPENSE, or TRANSFER")
    category_id: Optional[UUID] = None
    merchant: Optional[str] = Field(None, max_length=150)
    payment_method: str = Field(default="UPI", description="UPI, CREDIT_CARD, DEBIT_CARD, CASH, BANK_TRANSFER")
    account_type: str = Field(default="SAVINGS", description="SAVINGS, CHECKING, CREDIT_CARD, WALLET")
    transaction_date: Optional[datetime] = None
    description: Optional[str] = None
    location: Optional[str] = Field(None, max_length=255)
    notes: Optional[str] = None
    is_recurring: bool = False


class TransactionUpdateRequest(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    amount: Optional[Decimal] = Field(None, gt=Decimal("0.00"))
    transaction_type: Optional[str] = None
    category_id: Optional[UUID] = None
    merchant: Optional[str] = Field(None, max_length=150)
    payment_method: Optional[str] = None
    account_type: Optional[str] = None
    transaction_date: Optional[datetime] = None
    description: Optional[str] = None
    location: Optional[str] = None
    notes: Optional[str] = None
    is_recurring: Optional[bool] = None


class TransactionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    transaction_number: str
    user_id: UUID
    category_id: Optional[UUID] = None
    category: Optional[CategoryMiniResponse] = None
    title: str
    description: Optional[str] = None
    merchant: Optional[str] = None
    transaction_type: str
    payment_method: Optional[str] = None
    account_type: Optional[str] = None
    amount: Decimal
    net_amount: Optional[Decimal] = None
    direction: Optional[str] = None
    transaction_date: datetime
    location: Optional[str] = None
    notes: Optional[str] = None
    is_recurring: bool
    is_deleted: bool = False
    deleted_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime


class TransactionSummaryResponse(BaseModel):
    total_income: Decimal
    total_expense: Decimal
    net_balance: Decimal
    total_count: int
