from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from uuid import UUID
from datetime import datetime, date

class GoalCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=100, description="Friendly title of the savings goal")
    goal_type: str = Field(..., description="Goal type: e.g. Purchase, Emergency Fund, Retirement")
    target_amount: float = Field(..., description="Target savings milestone size")
    current_amount: float = Field(default=0.0000, description="Currently saved amount")
    target_date: Optional[date] = Field(None, description="Optional deadline date")
    priority: str = Field(..., description="Goal priority: High, Medium, Low")
    goal_status: str = Field(default="In Progress", description="Goal status: In Progress, Completed, Abandoned")
    auto_save: bool = Field(default=False, description="Flag for automated savings rule matching")
    monthly_target: float = Field(default=0.0000, ge=0.0, description="Suggested monthly contribution target")
    notes: Optional[str] = Field(None, description="Detailed annotations")

    @field_validator("target_amount")
    @classmethod
    def validate_target_amount(cls, v: float) -> float:
        if v <= 0.0:
            raise ValueError("Target amount must be greater than zero.")
        return v

    @field_validator("current_amount")
    @classmethod
    def validate_current_amount(cls, v: float) -> float:
        if v < 0.0:
            raise ValueError("Current amount cannot be negative.")
        return v

    @field_validator("priority")
    @classmethod
    def validate_priority(cls, v: str) -> str:
        v_clean = v.strip()
        allowed = {'High', 'Medium', 'Low'}
        for a in allowed:
            if a.lower() == v_clean.lower():
                return a
        raise ValueError(f"Priority must be one of: {', '.join(allowed)}")

    @field_validator("goal_status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        v_clean = v.strip()
        allowed = {'In Progress', 'Completed', 'Abandoned'}
        for a in allowed:
            if a.lower() == v_clean.lower():
                return a
        raise ValueError(f"Goal status must be one of: {', '.join(allowed)}")

    model_config = {
        "json_schema_extra": {
            "example": {
                "title": "Buy Laptop",
                "goal_type": "Purchase",
                "target_amount": 120000.0,
                "current_amount": 30000.0,
                "target_date": "2027-03-01",
                "priority": "High",
                "goal_status": "In Progress",
                "auto_save": True,
                "monthly_target": 5000.0,
                "notes": "MacBook Pro"
            }
        }
    }


class GoalUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=100)
    goal_type: Optional[str] = Field(None)
    target_amount: Optional[float] = Field(None)
    current_amount: Optional[float] = Field(None)
    target_date: Optional[date] = Field(None)
    priority: Optional[str] = Field(None)
    goal_status: Optional[str] = Field(None)
    auto_save: Optional[bool] = Field(None)
    monthly_target: Optional[float] = Field(None, ge=0.0)
    notes: Optional[str] = Field(None)

    @field_validator("target_amount")
    @classmethod
    def validate_target_amount(cls, v: Optional[float]) -> Optional[float]:
        if v is not None and v <= 0.0:
            raise ValueError("Target amount must be greater than zero.")
        return v

    @field_validator("current_amount")
    @classmethod
    def validate_current_amount(cls, v: Optional[float]) -> Optional[float]:
        if v is not None and v < 0.0:
            raise ValueError("Current amount cannot be negative.")
        return v

    @field_validator("priority")
    @classmethod
    def validate_priority(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            v_clean = v.strip()
            allowed = {'High', 'Medium', 'Low'}
            for a in allowed:
                if a.lower() == v_clean.lower():
                    return a
            raise ValueError(f"Priority must be one of: {', '.join(allowed)}")
        return v

    @field_validator("goal_status")
    @classmethod
    def validate_status(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            v_clean = v.strip()
            allowed = {'In Progress', 'Completed', 'Abandoned'}
            for a in allowed:
                if a.lower() == v_clean.lower():
                    return a
            raise ValueError(f"Goal status must be one of: {', '.join(allowed)}")
        return v


class GoalContributionCreate(BaseModel):
    transaction_id: Optional[UUID] = Field(None, description="Optional link to a bank transaction")
    amount: float = Field(..., description="Monetary size of savings contribution")

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
    title: str
    goal_type: str
    target_amount: float
    current_amount: float
    target_date: Optional[date] = None
    priority: str
    goal_status: str
    auto_save: bool
    monthly_target: float
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    contributions: List[GoalContributionResponse] = []

    class Config:
        from_attributes = True
