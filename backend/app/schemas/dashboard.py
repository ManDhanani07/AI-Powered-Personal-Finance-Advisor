from pydantic import BaseModel, Field
from typing import List, Optional
from uuid import UUID
from app.schemas.transaction import TransactionResponse

class BudgetUsage(BaseModel):
    category_id: UUID
    category_name: str
    amount_limit: float
    amount_spent: float
    percentage_used: float
    is_over_budget: bool


class CategorySpend(BaseModel):
    category_id: Optional[UUID] = None
    category_name: str
    total_amount: float
    percentage_of_total: float
    color: Optional[str] = None


class GoalProgress(BaseModel):
    goal_id: UUID
    name: str
    target_amount: float
    current_savings: float
    percentage_complete: float


class DashboardSummaryResponse(BaseModel):
    total_income: float
    total_expense: float
    total_savings: float
    monthly_budget: float
    budget_remaining: float
    financial_health_score: int
    top_category: Optional[str]
    monthly_growth: float
    goal_progress: float
    recent_transactions: List[TransactionResponse] = []


class DashboardAnalyticsResponse(BaseModel):
    net_worth: float
    monthly_income: float
    monthly_expense: float
    active_budgets: List[BudgetUsage]
    spending_breakdown: List[CategorySpend]
    goals_progress: List[GoalProgress]
