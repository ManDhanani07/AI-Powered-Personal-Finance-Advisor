"""
Pydantic v2 Schemas for Savings Goals Management.
"""

from typing import Optional, List
from datetime import date, datetime
from decimal import Decimal
from uuid import UUID
from pydantic import BaseModel, Field, ConfigDict


class GoalCreateRequest(BaseModel):
    goal_name: str = Field(..., min_length=1, max_length=150)
    goal_type: Optional[str] = Field(default="SAVINGS", description="Emergency Fund, Vacation, Car, Bike, Laptop, Education, House, Wedding, Investment, Retirement, Mobile Phone, Business, Custom Goal")
    target_amount: Decimal = Field(..., gt=0, description="Target savings amount must be positive")
    current_amount: Decimal = Field(default=Decimal("0.00"), ge=0)
    monthly_contribution: Decimal = Field(default=Decimal("0.00"), ge=0)
    target_date: date
    priority: str = Field(default="MEDIUM", description="LOW, MEDIUM, HIGH, CRITICAL")
    description: Optional[str] = None
    color: Optional[str] = Field(default="#6366F1")
    icon: Optional[str] = Field(default="Target")


class GoalDepositRequest(BaseModel):
    amount: Decimal = Field(..., gt=0, description="Amount to deposit into Goal Vault")
    notes: Optional[str] = None


class GoalUpdateRequest(BaseModel):
    goal_name: Optional[str] = Field(None, min_length=1, max_length=150)
    goal_type: Optional[str] = None
    target_amount: Optional[Decimal] = Field(None, gt=0)
    current_amount: Optional[Decimal] = Field(None, ge=0)
    monthly_contribution: Optional[Decimal] = Field(None, ge=0)
    target_date: Optional[date] = None
    priority: Optional[str] = None
    description: Optional[str] = None
    color: Optional[str] = None
    icon: Optional[str] = None
    status: Optional[str] = None


class GoalResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    goal_name: str
    goal_type: Optional[str] = "SAVINGS"
    target_amount: Decimal
    current_amount: Decimal
    remaining_amount: Decimal = Decimal("0.00")
    monthly_contribution: Decimal = Decimal("0.00")
    completion_percentage: float = 0.0
    remaining_months: int = 1
    required_monthly_saving: Decimal = Decimal("0.00")
    performance_status: str = "On Track"  # On Track, Ahead of Schedule, Behind Schedule, Achieved
    target_date: date
    priority: str = "MEDIUM"
    status: str = "IN_PROGRESS"
    description: Optional[str] = None
    color: Optional[str] = "#6366F1"
    icon: Optional[str] = "Target"
    created_at: datetime
    updated_at: datetime


class GoalSummaryResponse(BaseModel):
    total_target_amount: Decimal
    total_saved_amount: Decimal
    total_remaining_amount: Decimal
    overall_completion_pct: float
    total_goals_count: int
    achieved_count: int
    in_progress_count: int
    highest_priority_goal: Optional[str] = None
    nearest_deadline: Optional[date] = None


class GoalRecommendationResponse(BaseModel):
    goal_id: UUID
    goal_name: str
    type: str  # MISSING_DEADLINE, COMPLETING_EARLY, LOW_CONTRIBUTION, ACHIEVED, INACTIVE
    severity: str  # INFO, WARNING, SUCCESS, CRITICAL
    title: str
    message: str
