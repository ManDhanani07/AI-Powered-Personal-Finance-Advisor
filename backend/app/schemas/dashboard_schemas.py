"""
Pydantic v2 Schemas for Financial Dashboard Module.

This module defines response schemas for all dashboard API endpoints including
overview metrics, cash flow data, category spending, budget overview, goals overview,
recent transactions, spending analysis, and payment method distribution.
"""

from typing import Optional, List, Dict, Any
from datetime import datetime, date
from decimal import Decimal
from uuid import UUID
from pydantic import BaseModel, Field, ConfigDict, field_validator


class OverviewMetrics(BaseModel):
    """
    Overview metrics for dashboard summary cards.
    
    Provides key financial indicators including balance, income, expenses,
    savings metrics, budget status, and goal completion rates.
    """
    model_config = ConfigDict(from_attributes=True)
    
    total_balance: Decimal = Field(
        ...,
        description="All-time income minus expenses",
        decimal_places=2
    )
    monthly_income: Decimal = Field(
        ...,
        description="Current month total income",
        decimal_places=2
    )
    monthly_expenses: Decimal = Field(
        ...,
        description="Current month total expenses",
        decimal_places=2
    )
    net_savings: Decimal = Field(
        ...,
        description="Monthly income minus expenses",
        decimal_places=2
    )
    savings_rate: Decimal = Field(
        ...,
        description="Savings percentage (net_savings / monthly_income * 100)",
        decimal_places=2
    )
    current_month_budget: Decimal = Field(
        ...,
        description="Sum of all active budget amounts",
        decimal_places=2
    )
    remaining_budget: Decimal = Field(
        ...,
        description="Total remaining budget across active budgets",
        decimal_places=2
    )
    goal_completion_rate: Decimal = Field(
        ...,
        description="Goal achievement percentage (achieved / total * 100)",
        decimal_places=2
    )

    @field_validator('total_balance', 'monthly_income', 'monthly_expenses', 'net_savings',
                     'current_month_budget', 'remaining_budget', mode='before')
    @classmethod
    def round_to_two_decimals(cls, v: Decimal) -> Decimal:
        """Ensure all decimal fields have exactly 2 decimal places."""
        if v is None:
            return Decimal("0.00")
        return Decimal(str(v)).quantize(Decimal("0.01"))

    @field_validator('savings_rate', 'goal_completion_rate', mode='before')
    @classmethod
    def round_percentages(cls, v: Decimal) -> Decimal:
        """Ensure percentage fields have exactly 2 decimal places."""
        if v is None:
            return Decimal("0.00")
        return Decimal(str(v)).quantize(Decimal("0.01"))


class CashFlowData(BaseModel):
    """
    Monthly cash flow data for area chart visualization.
    
    Contains income, expenses, and net cash flow for a specific month.
    """
    model_config = ConfigDict(from_attributes=True)
    
    month: str = Field(
        ...,
        description="Month label in 'MMM YYYY' format (e.g., 'Jan 2024')"
    )
    income: Decimal = Field(
        ...,
        description="Total income for the month",
        decimal_places=2
    )
    expenses: Decimal = Field(
        ...,
        description="Total expenses for the month",
        decimal_places=2
    )
    net: Decimal = Field(
        ...,
        description="Net cash flow (income - expenses)",
        decimal_places=2
    )

    @field_validator('income', 'expenses', 'net', mode='before')
    @classmethod
    def round_to_two_decimals(cls, v: Decimal) -> Decimal:
        """Ensure all decimal fields have exactly 2 decimal places."""
        if v is None:
            return Decimal("0.00")
        return Decimal(str(v)).quantize(Decimal("0.01"))


class CategorySpending(BaseModel):
    """
    Category-wise spending data for pie/donut chart visualization.
    
    Shows spending distribution across expense categories for current month.
    """
    model_config = ConfigDict(from_attributes=True)
    
    category_id: UUID = Field(..., description="Unique category identifier")
    category_name: str = Field(..., description="Category display name")
    color: Optional[str] = Field(
        None,
        description="Hex color code for chart visualization (e.g., '#FF6384')"
    )
    amount: Decimal = Field(
        ...,
        description="Total spending in this category",
        decimal_places=2
    )
    percentage: Decimal = Field(
        ...,
        description="Percentage of total spending",
        decimal_places=2
    )
    transaction_count: int = Field(
        ...,
        description="Number of transactions in this category",
        ge=0
    )

    @field_validator('amount', 'percentage', mode='before')
    @classmethod
    def round_to_two_decimals(cls, v: Decimal) -> Decimal:
        """Ensure all decimal fields have exactly 2 decimal places."""
        if v is None:
            return Decimal("0.00")
        return Decimal(str(v)).quantize(Decimal("0.01"))


class BudgetDetail(BaseModel):
    """
    Individual budget details with utilization metrics.
    
    Includes budget amounts, spending, remaining amounts, and utilization percentage.
    """
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID = Field(..., description="Unique budget identifier")
    budget_name: str = Field(..., description="Budget display name")
    budget_amount: Decimal = Field(
        ...,
        description="Allocated budget amount",
        decimal_places=2
    )
    spent_amount: Decimal = Field(
        ...,
        description="Amount already spent",
        decimal_places=2
    )
    remaining_amount: Decimal = Field(
        ...,
        description="Remaining budget amount",
        decimal_places=2
    )
    utilization_percentage: Decimal = Field(
        ...,
        description="Budget utilization (spent / budget * 100)",
        decimal_places=2
    )
    status: str = Field(..., description="Budget status (ACTIVE, EXCEEDED, COMPLETED)")
    start_date: date = Field(..., description="Budget period start date")
    end_date: date = Field(..., description="Budget period end date")

    @field_validator('budget_amount', 'spent_amount', 'remaining_amount', mode='before')
    @classmethod
    def round_to_two_decimals(cls, v: Decimal) -> Decimal:
        """Ensure all decimal fields have exactly 2 decimal places."""
        if v is None:
            return Decimal("0.00")
        return Decimal(str(v)).quantize(Decimal("0.01"))

    @field_validator('utilization_percentage', mode='before')
    @classmethod
    def round_percentage(cls, v: Decimal) -> Decimal:
        """Ensure percentage fields have exactly 2 decimal places."""
        if v is None:
            return Decimal("0.00")
        return Decimal(str(v)).quantize(Decimal("0.01"))


class BudgetOverview(BaseModel):
    """
    Budget overview summary with aggregated metrics.
    
    Provides counts and totals across all budgets with individual budget details.
    """
    model_config = ConfigDict(from_attributes=True)
    
    active_count: int = Field(
        ...,
        description="Number of currently active budgets",
        ge=0
    )
    exceeded_count: int = Field(
        ...,
        description="Number of budgets that have been exceeded",
        ge=0
    )
    total_remaining: Decimal = Field(
        ...,
        description="Total remaining budget across all active budgets",
        decimal_places=2
    )
    budgets: List[BudgetDetail] = Field(
        default_factory=list,
        description="List of individual budget details"
    )

    @field_validator('total_remaining', mode='before')
    @classmethod
    def round_to_two_decimals(cls, v: Decimal) -> Decimal:
        """Ensure all decimal fields have exactly 2 decimal places."""
        if v is None:
            return Decimal("0.00")
        return Decimal(str(v)).quantize(Decimal("0.01"))


class GoalDetail(BaseModel):
    """
    Individual goal details with progress metrics.
    
    Includes target amounts, current progress, required savings, and timeline info.
    """
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID = Field(..., description="Unique goal identifier")
    goal_name: str = Field(..., description="Goal display name")
    goal_type: Optional[str] = Field(
        None,
        description="Type of goal (e.g., SAVINGS, INVESTMENT, DEBT_PAYMENT)"
    )
    target_amount: Decimal = Field(
        ...,
        description="Target amount to achieve",
        decimal_places=2
    )
    current_amount: Decimal = Field(
        ...,
        description="Current amount achieved",
        decimal_places=2
    )
    progress_percentage: Decimal = Field(
        ...,
        description="Goal progress (current / target * 100)",
        decimal_places=2
    )
    target_date: date = Field(..., description="Target completion date")
    required_monthly_savings: Decimal = Field(
        ...,
        description="Monthly savings needed to achieve goal by target date",
        decimal_places=2
    )
    priority: str = Field(..., description="Goal priority (HIGH, MEDIUM, LOW)")
    status: str = Field(..., description="Goal status (IN_PROGRESS, ACHIEVED, CANCELLED)")

    @field_validator('target_amount', 'current_amount', 'required_monthly_savings', mode='before')
    @classmethod
    def round_to_two_decimals(cls, v: Decimal) -> Decimal:
        """Ensure all decimal fields have exactly 2 decimal places."""
        if v is None:
            return Decimal("0.00")
        return Decimal(str(v)).quantize(Decimal("0.01"))

    @field_validator('progress_percentage', mode='before')
    @classmethod
    def round_percentage(cls, v: Decimal) -> Decimal:
        """Ensure percentage fields have exactly 2 decimal places."""
        if v is None:
            return Decimal("0.00")
        return Decimal(str(v)).quantize(Decimal("0.01"))


class GoalsOverview(BaseModel):
    """
    Goals overview summary with aggregated metrics.
    
    Provides counts, average progress, next goal info, and individual goal details.
    """
    model_config = ConfigDict(from_attributes=True)
    
    in_progress_count: int = Field(
        ...,
        description="Number of IN_PROGRESS goals",
        ge=0
    )
    achieved_count: int = Field(
        ...,
        description="Number of ACHIEVED goals",
        ge=0
    )
    average_progress: Decimal = Field(
        ...,
        description="Average progress percentage across IN_PROGRESS goals",
        decimal_places=2
    )
    next_goal: Optional[GoalDetail] = Field(
        None,
        description="Goal with nearest target_date"
    )
    goals: List[GoalDetail] = Field(
        default_factory=list,
        description="List of individual goal details"
    )

    @field_validator('average_progress', mode='before')
    @classmethod
    def round_percentage(cls, v: Decimal) -> Decimal:
        """Ensure percentage fields have exactly 2 decimal places."""
        if v is None:
            return Decimal("0.00")
        return Decimal(str(v)).quantize(Decimal("0.01"))


class TransactionDetail(BaseModel):
    """
    Transaction details for recent transactions display.
    
    Includes transaction information with category name for dashboard view.
    """
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID = Field(..., description="Unique transaction identifier")
    transaction_number: str = Field(..., description="Human-readable transaction number")
    title: str = Field(..., description="Transaction title/description")
    merchant: Optional[str] = Field(None, description="Merchant or payee name")
    category_name: Optional[str] = Field(None, description="Category display name")
    amount: Decimal = Field(
        ...,
        description="Transaction amount",
        decimal_places=2
    )
    transaction_type: str = Field(..., description="Transaction type (INCOME, EXPENSE, TRANSFER)")
    transaction_date: datetime = Field(..., description="Transaction date and time")
    payment_method: Optional[str] = Field(
        None,
        description="Payment method used (UPI, CREDIT_CARD, CASH, BANK)"
    )

    @field_validator('amount', mode='before')
    @classmethod
    def round_to_two_decimals(cls, v: Decimal) -> Decimal:
        """Ensure all decimal fields have exactly 2 decimal places."""
        if v is None:
            return Decimal("0.00")
        return Decimal(str(v)).quantize(Decimal("0.01"))


class SpendingAnalysis(BaseModel):
    """
    Spending insights and analytics data.
    
    Provides insights about highest/lowest spending categories and transaction patterns.
    """
    model_config = ConfigDict(from_attributes=True)
    
    highest_category: Optional[Dict[str, Any]] = Field(
        None,
        description="Category with highest spending {category_name, amount}"
    )
    lowest_category: Optional[Dict[str, Any]] = Field(
        None,
        description="Category with lowest spending (excluding zero) {category_name, amount}"
    )
    average_daily_spending: Decimal = Field(
        ...,
        description="Average daily spending in current month",
        decimal_places=2
    )
    average_monthly_spending: Decimal = Field(
        ...,
        description="Average monthly spending over last 6 months",
        decimal_places=2
    )
    largest_transaction: Optional[Dict[str, Any]] = Field(
        None,
        description="Largest expense transaction {title, amount, date}"
    )
    smallest_transaction: Optional[Dict[str, Any]] = Field(
        None,
        description="Smallest expense transaction (excluding zero) {title, amount, date}"
    )

    @field_validator('average_daily_spending', 'average_monthly_spending', mode='before')
    @classmethod
    def round_to_two_decimals(cls, v: Decimal) -> Decimal:
        """Ensure all decimal fields have exactly 2 decimal places."""
        if v is None:
            return Decimal("0.00")
        return Decimal(str(v)).quantize(Decimal("0.01"))


class PaymentMethodData(BaseModel):
    """
    Payment method distribution data for pie chart visualization.
    
    Shows transaction counts and amounts by payment method.
    """
    model_config = ConfigDict(from_attributes=True)
    
    payment_method: str = Field(..., description="Payment method name")
    count: int = Field(
        ...,
        description="Number of transactions using this payment method",
        ge=0
    )
    amount: Decimal = Field(
        ...,
        description="Total amount transacted via this payment method",
        decimal_places=2
    )
    percentage: Decimal = Field(
        ...,
        description="Percentage of total transaction count",
        decimal_places=2
    )

    @field_validator('amount', 'percentage', mode='before')
    @classmethod
    def round_to_two_decimals(cls, v: Decimal) -> Decimal:
        """Ensure all decimal fields have exactly 2 decimal places."""
        if v is None:
            return Decimal("0.00")
        return Decimal(str(v)).quantize(Decimal("0.01"))


class DashboardSummary(BaseModel):
    """
    Complete dashboard summary aggregating all dashboard data.
    
    Single response containing all dashboard components for efficient initial load.
    """
    model_config = ConfigDict(from_attributes=True)
    
    overview: OverviewMetrics = Field(..., description="Overview metrics for dashboard cards")
    cash_flow: List[CashFlowData] = Field(
        default_factory=list,
        description="Monthly cash flow data for charts"
    )
    category_spending: List[CategorySpending] = Field(
        default_factory=list,
        description="Category-wise spending distribution"
    )
    budget_overview: BudgetOverview = Field(..., description="Budget summary and details")
    goals_overview: GoalsOverview = Field(..., description="Goals summary and details")
    recent_transactions: List[TransactionDetail] = Field(
        default_factory=list,
        description="Recent transactions list"
    )
    spending_analysis: SpendingAnalysis = Field(..., description="Spending insights and analytics")
    payment_distribution: List[PaymentMethodData] = Field(
        default_factory=list,
        description="Payment method distribution"
    )
