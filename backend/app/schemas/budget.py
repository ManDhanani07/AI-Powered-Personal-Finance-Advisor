"""
Pydantic v2 Schemas for Budget Management.
"""

from typing import Optional, List, Dict, Any
from datetime import date, datetime
from decimal import Decimal
from uuid import UUID
from pydantic import BaseModel, Field, ConfigDict
from app.schemas.category import CategoryResponse


class BudgetCreateRequest(BaseModel):
    budget_name: str = Field(..., min_length=1, max_length=150)
    category_id: Optional[UUID] = None
    budget_amount: Decimal = Field(..., gt=0, description="Allocated budget amount must be positive")
    start_date: date
    end_date: date


class BudgetUpdateRequest(BaseModel):
    budget_name: Optional[str] = Field(None, min_length=1, max_length=150)
    category_id: Optional[UUID] = None
    budget_amount: Optional[Decimal] = Field(None, gt=0)
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    status: Optional[str] = None


class BudgetResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    category_id: Optional[UUID] = None
    category: Optional[CategoryResponse] = None
    budget_name: str
    budget_amount: Decimal
    spent_amount: Decimal
    remaining_amount: Decimal
    utilization_percentage: float = 0.0
    remaining_percentage: float = 100.0
    status: str
    health_status: str = "Safe"  # Safe, Warning, Critical, Exceeded
    daily_spending_limit: Decimal = Decimal("0.00")
    projected_month_end_spending: Decimal = Decimal("0.00")
    start_date: date
    end_date: date
    created_at: datetime
    updated_at: datetime


class BudgetSummaryResponse(BaseModel):
    total_allocated: Decimal
    total_spent: Decimal
    total_remaining: Decimal
    overall_utilization_pct: float
    total_budgets_count: int
    active_count: int
    exceeded_count: int
    highest_spending_category: Optional[str] = None
    most_overspent_category: Optional[str] = None


class BudgetAlertResponse(BaseModel):
    budget_id: UUID
    budget_name: str
    category_name: str
    utilization_pct: float
    alert_level: str  # WARNING, CRITICAL, EXCEEDED
    threshold: int  # 50, 75, 90, 100, 110
    message: str


class BudgetReallocateRequest(BaseModel):
    source_budget_id: UUID
    target_budget_id: UUID
    amount: Decimal = Field(..., gt=0, description="Amount to transfer between envelopes")


class TransactionValidateBudgetRequest(BaseModel):
    category_id: Optional[UUID] = None
    amount: Decimal = Field(..., gt=0, description="Transaction amount to validate against remaining category budget")


class TransactionValidateBudgetResponse(BaseModel):
    exceeds: bool
    category_name: Optional[str] = "General"
    remaining_budget: float
    new_overspend: float
    message: str


class BudgetIntelligenceResponse(BaseModel):
    is_exceeded: bool
    exceeded_banner: Optional[Dict[str, Any]] = None
    analysis_card: Dict[str, Any]
    why_explanation: Dict[str, Any]
    reallocation_options: Dict[str, Any]
    financial_health_impact: Dict[str, Any]
    goal_impact: Dict[str, Any]
    ai_recommendations: List[str]
    charts: Dict[str, Any]

