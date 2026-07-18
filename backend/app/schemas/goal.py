from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from uuid import UUID
from datetime import datetime, date

class GoalCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description="Friendly title of the savings goal")
    target_amount: float = Field(..., description="Target savings milestone size")
    target_date: Optional[date] = Field(None, description="Optional deadline")
    status: str = Field(default="active", description="Status: active, completed, abandoned")

    @field_validator("target_amount")
    @classmethod
    def validate_amount(cls, v: float) -> float:
        if v <= 0.0:
            raise ValueError("Target amount must be greater than zero.")
        return v

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        v = v.strip().lower()
        if v not in {'active', 'completed', 'abandoned'}:
            raise ValueError("Goal status must be: active, completed, or abandoned.")
        return v


class GoalUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    target_amount: Optional[float] = Field(None)
    target_date: Optional[date] = Field(None)
    status: Optional[str] = Field(None)

    @field_validator("target_amount")
    @classmethod
    def validate_amount(cls, v: Optional[float]) -> Optional[float]:
        if v is not None and v <= 0.0:
            raise ValueError("Target amount must be greater than zero.")
        return v

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            v = v.strip().lower()
            if v not in {'active', 'completed', 'abandoned'}:
                raise ValueError("Goal status must be: active, completed, or abandoned.")
        return v


class GoalContributionCreate(BaseModel):
    transaction_id: Optional[UUID] = Field(None, description="Optional link to a bank transfer transaction")
    amount: float = Field(..., description="Monetary size of savings contribution (positive adds, negative pulls out)")

    @field_validator("amount")
    @classmethod
    def validate_amount(cls, v: float) -> float:
        if v == 0.0:
            raise ValueError("Contribution amount cannot be zero.")
        return v


class GoalContributionResponse(BaseModel):
    id: UUID
    goal_id: UUID
    transaction_id: Optional[UUID] = None
    amount: float
    contribution_date: datetime
    created_at: datetime

    class Config:
        from_attributes = True


class GoalResponse(BaseModel):
    id: UUID
    user_id: UUID
    name: str
    target_amount: float
    target_date: Optional[date] = None
    status: str
    created_at: datetime
    updated_at: datetime
    contributions: List[GoalContributionResponse] = []

    class Config:
        from_attributes = True
