"""
Pydantic v2 Schemas for Dashboard API Responses.
All values are dynamically calculated - never hardcoded.
"""

from typing import Optional, List, Any, Dict
from datetime import datetime, date
from decimal import Decimal
from uuid import UUID
from pydantic import BaseModel, ConfigDict


# ─────────────────────────────────────────────
# Shared Sub-schemas
# ─────────────────────────────────────────────

class MiniCategorySchema(BaseModel):
    category_name: str
    color: Optional[str] = None
    icon: Optional[str] = None


class MiniTransactionSchema(BaseModel):
    id: UUID
    title: str
    merchant: Optional[str] = None
    amount: Decimal
    transaction_type: str
    direction: str
    net_amount: Decimal
    transaction_date: datetime
    payment_method: Optional[str] = None
    category: Optional[MiniCategorySchema] = None


# ─────────────────────────────────────────────
# Overview — KPI Cards
# ─────────────────────────────────────────────

class DashboardOverviewResponse(BaseModel):
    total_balance: Decimal
    monthly_income: Decimal
    monthly_expenses: Decimal
    net_savings: Decimal
    savings_rate: Decimal  # percentage 0-100
    current_month_budget_total: Decimal
    current_month_budget_spent: Decimal
    current_month_budget_remaining: Decimal
    budget_utilization_pct: Decimal
    total_active_goals: int
    completed_goals: int
    avg_goal_progress_pct: Decimal
    # Trends vs. previous month (percentage change)
    income_change_pct: Optional[Decimal] = None
    expense_change_pct: Optional[Decimal] = None
    savings_change_pct: Optional[Decimal] = None


# ─────────────────────────────────────────────
# Summary — Header Banner
# ─────────────────────────────────────────────

class DashboardSummaryResponse(BaseModel):
    greeting: str
    today_date: date
    user_name: str
    total_balance: Decimal
    monthly_income: Decimal
    monthly_expenses: Decimal
    net_savings: Decimal
    savings_rate: Decimal
    budget_remaining: Decimal
    goals_progress_pct: Decimal
    active_goals_count: int


# ─────────────────────────────────────────────
# Charts
# ─────────────────────────────────────────────

class MonthlyChartPoint(BaseModel):
    month: str       # "Jan 2026"
    income: Decimal
    expense: Decimal
    net: Decimal


class CategoryChartPoint(BaseModel):
    category_name: str
    value: Decimal
    color: Optional[str] = None
    percentage: Decimal


class PaymentMethodChartPoint(BaseModel):
    name: str
    count: int
    value: Decimal
    percentage: Decimal


class BudgetUtilizationPoint(BaseModel):
    budget_name: str
    budget_amount: Decimal
    spent_amount: Decimal
    utilization_pct: Decimal
    color: str  # green < 70%, amber 70-90%, red > 90%


class GoalProgressPoint(BaseModel):
    goal_name: str
    target_amount: Decimal
    current_amount: Decimal
    progress_pct: Decimal
    color: str


class DashboardChartsResponse(BaseModel):
    # 12-month bar: income vs expense
    income_expense_monthly: List[MonthlyChartPoint]
    # Area chart: net cash flow
    cash_flow_monthly: List[MonthlyChartPoint]
    # Pie chart: category spending this month
    category_spending: List[CategoryChartPoint]
    # Horizontal bar: budget utilization
    budget_utilization: List[BudgetUtilizationPoint]
    # Radial: goal progress
    goal_progress: List[GoalProgressPoint]
    # Pie: payment method distribution
    payment_method_distribution: List[PaymentMethodChartPoint]


# ─────────────────────────────────────────────
# Recent Transactions
# ─────────────────────────────────────────────

class DashboardRecentTransactionsResponse(BaseModel):
    transactions: List[MiniTransactionSchema]
    total_count: int
    limit: int


# ─────────────────────────────────────────────
# Budget Overview
# ─────────────────────────────────────────────

class BudgetItemSchema(BaseModel):
    id: UUID
    budget_name: str
    budget_amount: Decimal
    spent_amount: Decimal
    remaining_amount: Decimal
    utilization_pct: Decimal
    status: str
    category_name: Optional[str] = None
    color: str  # status-based color


class DashboardBudgetOverviewResponse(BaseModel):
    total_active_budgets: int
    exceeded_budgets: int
    on_track_budgets: int
    total_budget_amount: Decimal
    total_spent_amount: Decimal
    total_remaining_amount: Decimal
    overall_utilization_pct: Decimal
    budgets: List[BudgetItemSchema]


# ─────────────────────────────────────────────
# Goals Overview
# ─────────────────────────────────────────────

class GoalItemSchema(BaseModel):
    id: UUID
    goal_name: str
    goal_type: Optional[str] = None
    target_amount: Decimal
    current_amount: Decimal
    progress_pct: Decimal
    target_date: date
    days_remaining: int
    required_monthly_saving: Decimal
    status: str
    priority: str


class DashboardGoalsOverviewResponse(BaseModel):
    total_goals: int
    active_goals: int
    completed_goals: int
    cancelled_goals: int
    total_target_amount: Decimal
    total_saved_amount: Decimal
    overall_progress_pct: Decimal
    nearest_deadline_goal: Optional[GoalItemSchema] = None
    goals: List[GoalItemSchema]


# ─────────────────────────────────────────────
# Spending Analysis
# ─────────────────────────────────────────────

class SpendingInsightItem(BaseModel):
    category_name: str
    amount: Decimal
    color: Optional[str] = None


class DashboardSpendingAnalysisResponse(BaseModel):
    month: str
    year: int
    highest_spending_category: Optional[SpendingInsightItem] = None
    lowest_spending_category: Optional[SpendingInsightItem] = None
    avg_daily_spending: Decimal
    avg_monthly_spending: Decimal  # last 6 months
    largest_transaction_amount: Decimal
    largest_transaction_title: Optional[str] = None
    smallest_transaction_amount: Decimal
    smallest_transaction_title: Optional[str] = None
    total_transactions_this_month: int
    total_spent_this_month: Decimal


# ─────────────────────────────────────────────
# Complete Consolidated Dashboard
# ─────────────────────────────────────────────

class DashboardCompleteResponse(BaseModel):
    overview: DashboardOverviewResponse
    summary: DashboardSummaryResponse
    charts: DashboardChartsResponse
    recent_transactions: DashboardRecentTransactionsResponse
    budget_overview: DashboardBudgetOverviewResponse
    goals_overview: DashboardGoalsOverviewResponse
    spending_analysis: DashboardSpendingAnalysisResponse


# ─────────────────────────────────────────────
# Phase 2: Income Sources, Patterns, Anomalies & Accounts
# ─────────────────────────────────────────────

class IncomeSourceSummary(BaseModel):
    category_name: str
    total_amount: Decimal
    percentage: Decimal
    stream_type: str  # "STABLE" or "VARIABLE"
    transaction_count: int


class MonthlyIncomeStreamPoint(BaseModel):
    month: str
    total: Decimal
    breakdown: Dict[str, Decimal]


class DashboardIncomeSourcesResponse(BaseModel):
    monthly_streams: List[MonthlyIncomeStreamPoint]
    categories: List[str]
    sources_summary: List[IncomeSourceSummary]
    total_income: Decimal
    stability_score: Decimal
    stability_level: str
    stable_amount: Decimal
    variable_amount: Decimal
    stable_percentage: Decimal
    variable_percentage: Decimal
    ai_insight: str


class DayOfWeekSpendingItem(BaseModel):
    day_index: int
    day_name: str
    total_spent: Decimal
    avg_per_day: Decimal
    transaction_count: int
    percentage: Decimal
    intensity: int


class WeekdayWeekendMetric(BaseModel):
    weekday_total: Decimal
    weekday_avg: Decimal
    weekend_total: Decimal
    weekend_avg: Decimal
    weekend_multiplier: Decimal
    insight: str


class TimeOfMonthMetric(BaseModel):
    early_month_total: Decimal
    early_month_pct: Decimal
    mid_month_total: Decimal
    mid_month_pct: Decimal
    late_month_total: Decimal
    late_month_pct: Decimal
    insight: str


class DashboardSpendingPatternsResponse(BaseModel):
    heatmap_7day: List[DayOfWeekSpendingItem]
    weekday_vs_weekend: WeekdayWeekendMetric
    time_of_month: TimeOfMonthMetric
    payment_methods: List[PaymentMethodChartPoint]


class AnomalyItem(BaseModel):
    id: str
    date: str
    category_name: str
    title: str
    actual_amount: Decimal
    baseline_amount: Decimal
    multiplier: Decimal
    severity: str  # "CRITICAL", "HIGH", "MODERATE"
    explanation: str
    status: str    # "FLAGGED", "REVIEWED"
    transactions: List[MiniTransactionSchema] = []


class DashboardAnomalyTimelineResponse(BaseModel):
    total_anomalies: int
    critical_count: int
    high_count: int
    moderate_count: int
    anomalies: List[AnomalyItem]


class AccountItem(BaseModel):
    id: str
    name: str
    institution: str
    account_type: str
    balance: Decimal
    available_credit: Optional[Decimal] = None
    credit_limit: Optional[Decimal] = None
    utilization_pct: Optional[Decimal] = None
    is_primary: bool
    last_sync: str


class DashboardAccountsResponse(BaseModel):
    total_net_worth: Decimal
    total_liquid_balance: Decimal
    total_credit_used: Decimal
    accounts: List[AccountItem]
    payment_method_breakdown: List[PaymentMethodChartPoint]

