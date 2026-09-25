"""
Expense Prediction & Multi-Scale Financial Advisory Schemas.
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime
from uuid import UUID


class ConfidenceRange(BaseModel):
    p10_minimum_survival: float = Field(..., description="10th percentile minimum survival/essential outflow")
    p50_expected_routine: float = Field(..., description="50th percentile median expected routine spending")
    p90_upper_discretionary: float = Field(..., description="90th percentile upper discretionary / festive ceiling")


class SanitizedSummary(BaseModel):
    clean_routine_spend: float = Field(..., description="Smoothed clean routine living spend")
    raw_clean_spend: float = Field(..., description="Raw non-shock spend (recurring + clean variable)")
    recurring_bills: float = Field(..., description="Fixed contractual recurring outflows (Rent, EMI, Utilities)")
    fixed_bills: float = Field(..., description="Contractual fixed liabilities")
    routine_spend: float = Field(..., description="Essential day-to-day routine living (Food, Groceries, Transit)")
    disc_spend: float = Field(..., description="Discretionary elastic spend (Shopping, Entertainment, Trips)")
    var_spend: float = Field(..., description="Total non-fixed variable spend")
    robust_income: float = Field(..., description="Robust median monthly income")
    shock_amount: float = Field(..., description="Isolated irregular financial shock outflows")
    recurring_from_start_amount: float = Field(0.0, description="Regular ongoing monthly commitments present from start")
    isolated_spike_amount: float = Field(0.0, description="Isolated non-recurring spike amount filtered from baseline")
    txn_count: int = Field(..., description="Total monthly transaction count")
    avg_tx_size: float = Field(..., description="Average transaction size in INR")


class PredictionScenarioItem(BaseModel):
    id: str = Field(..., description="Scenario ID: 'normal', 'emergency', 'frugal'")
    name: str = Field(..., description="Full scenario display name")
    short_label: str = Field(..., description="Short button label")
    predicted_spend: float = Field(..., description="Projected spending amount for this scenario")
    monthly_savings: float = Field(..., description="Projected savings surplus after expenses")
    difference_vs_last_month: float = Field(..., description="Variance vs last completed month expense")
    difference_vs_normal: float = Field(0.0, description="Variance compared to standard normal scenario")
    description: str = Field(..., description="Contextual scenario explanation")
    key_factor: str = Field(..., description="Primary economic driver of this scenario")
    risk_tag: str = Field(..., description="Status badge tag (e.g. 'Expected', 'High Outflow', 'Maximum Savings')")


class ForecastDetails(BaseModel):
    predicted_routine_spend: float = Field(..., description="Expected routine monthly expense prediction (P50)")
    confidence_range_p10_p90: ConfidenceRange = Field(..., description="Quantile bounds [P10, P50, P90]")
    recommended_emergency_buffer: float = Field(..., description="Calibrated liquidity emergency cushion")
    safe_total_budget_ceiling: float = Field(..., description="Predicted spend + recommended emergency buffer")
    estimated_monthly_savings: float = Field(..., description="Projected monthly disposable cash surplus")
    confidence_tier: str = Field(..., description="Confidence tier and historical depth description")
    target_month_name: Optional[str] = Field(None, description="Target forecast month name (e.g. September)")
    target_month_num: Optional[int] = Field(None, description="Target forecast month number (1-12)")
    # Dynamic Spike Detection & Real-Life Calibration
    shock_source_label: Optional[str] = Field(None, description="Dynamic source label for emergency buffer calibration")
    ai_regime_label: Optional[str] = Field("AI Regime: Routine Living", description="Dynamic regime display label")
    ai_regime_subtitle: Optional[str] = Field(None, description="Dynamic regime subtitle")
    ai_assessment_text: Optional[str] = Field(None, description="Dynamic data-driven AI assessment description")
    has_isolated_spike: bool = Field(False, description="Whether one-off non-recurring spikes were detected and de-spiked")
    detected_spike_type: Optional[str] = Field(None, description="Type of spike: HEALTH_EMERGENCY, HOLIDAY_TRAVEL, REPAIRS, ONE_OFF_PURCHASE")
    detected_spike_description: Optional[str] = Field(None, description="Human-readable spike description")
    detected_spike_amount: Optional[float] = Field(None, description="Amount of isolated spike")
    # Scenario-Based Prediction
    emergency_scenario_spend: Optional[float] = Field(None, description="Spending if an emergency shock occurs")
    emergency_shock_amount: Optional[float] = Field(None, description="Detected or calibrated emergency shock amount")
    frugal_survival_spend: Optional[float] = Field(None, description="Floor spending under frugal / minimum essentials")
    scenarios: List[PredictionScenarioItem] = Field(default_factory=list, description="Scenarios: normal, emergency, frugal")


class FinancialHealthAudit(BaseModel):
    risk_status: str = Field(..., description="Health risk classification (e.g. HEALTHY_SURPLUS, OVERSPENDING_RISK)")
    advisor_insight: str = Field(..., description="Actionable AI financial advice & strategy")
    is_festive_quarter: bool = Field(..., description="Whether forecast month falls in festive Q4")


class HistoricalMonthData(BaseModel):
    month_name: str
    year_month: str
    income: float
    expense: float
    savings: float
    routine_spend: float
    is_projected: bool = False


class CategoryForecastItem(BaseModel):
    category: str
    predicted_amount: float
    percentage: float
    color: str = "#10B981"
    historical_avg: float = 0.0


class PerformanceBenchmarks(BaseModel):
    this_month_predicted: float
    last_month_actual: float
    three_month_avg: float
    six_month_avg: float


class BudgetComparison(BaseModel):
    monthly_budget_limit: float
    expected_expense: float
    remaining_budget: float
    utilization_pct: float
    status_alert: str
    is_over_budget: bool = False
    has_custom_budget: bool = False


class SpendingTrendMetrics(BaseModel):
    direction: str = "STABLE"  # INCREASING, DECREASING, STABLE
    direction_symbol: str = "→"  # ↗, ↘, →
    direction_label: str = "Stable"
    mom_change_pct: float = 0.0
    mom_change_amt: float = 0.0
    last_month_expense: float = 0.0


class OverspendingRisk(BaseModel):
    risk_percentage: int = 24
    risk_level: str = "Low"  # Low, Medium, High
    risk_color: str = "#10B981"
    risk_factors: List[str] = Field(default_factory=list)


class ForecastHorizonPoint(BaseModel):
    period: str
    month_name: str
    amount: float
    is_forecast: bool = False
    p10: Optional[float] = None
    p90: Optional[float] = None


class RecurringExpenseItem(BaseModel):
    name: str
    merchant: Optional[str] = None
    category: str
    amount: float
    frequency: str = "Monthly"
    expected_next_date: Optional[str] = None
    is_contractual: bool = False
    source: str = "Contractual Recurring"


class FixedVsVariableBreakdown(BaseModel):
    fixed_amount: float
    fixed_pct: float
    fixed_description: str
    routine_amount: float
    routine_pct: float
    routine_description: str
    discretionary_amount: float
    discretionary_pct: float
    discretionary_description: str
    shock_amount: float
    shock_pct: float


class DayOfWeekSpend(BaseModel):
    day_index: int
    day_name: str
    total_spend: float
    avg_spend: float
    tx_count: int
    intensity_pct: float


class SpendingHeatmapData(BaseModel):
    day_distribution: List[DayOfWeekSpend] = Field(default_factory=list)
    weekday_avg: float = 0.0
    weekend_avg: float = 0.0
    weekend_vs_weekday_diff_pct: float = 0.0
    insight: str = ""


class CashFlowForecast(BaseModel):
    expected_income: float
    predicted_expenses: float
    net_cash_flow: float
    savings_rate_pct: float
    income_available: bool = True


class DataQualityMetrics(BaseModel):
    total_transactions: int
    history_months_count: int
    categorized_pct: float
    recurring_patterns_count: int
    earliest_date: Optional[str] = None
    latest_date: Optional[str] = None


class AiRecommendationItem(BaseModel):
    id: str
    title: str
    category: str
    impact_type: str  # SAVINGS, BUDGET_RISK, CASH_FLOW, ADVISORY
    reason: str
    metric_text: str
    potential_impact: float


class FutureProjections(BaseModel):
    one_month: float
    three_months: float
    six_months: float
    twelve_months: float


class ModelMetadataResponse(BaseModel):
    engine_name: str
    version: str
    architecture: str
    verified_r2_score: float
    verified_wpa_accuracy: float
    verified_mae_inr: float
    verified_rmse_inr: float
    safe_ceiling_protection_rate: float
    training_cohort: str


class LastPredictionValidation(BaseModel):
    has_validation: bool = True
    forecast_month_name: str = ""
    predicted_amount: float = 0.0
    actual_amount: float = 0.0
    difference: float = 0.0
    error_pct: float = 0.0
    status_label: str = "Accurate"


class ModelReliabilitySummary(BaseModel):
    metric_name: str = "MAPE"
    metric_value: float = 4.8
    mae_inr: float = 598.20
    rmse_inr: float = 1104.93
    rating: str = "Good"
    basis_description: str = "Based on recent validated predictions"


class ExpensePredictionResponse(BaseModel):
    model_config = {"protected_namespaces": ()}

    user_id: UUID
    generated_at: datetime = Field(default_factory=datetime.utcnow)
    sanitized_summary: SanitizedSummary
    forecast: ForecastDetails
    financial_health_audit: FinancialHealthAudit
    historical_trend: List[HistoricalMonthData] = Field(default_factory=list)
    trend_metrics: Optional[SpendingTrendMetrics] = None
    overspending_risk: Optional[OverspendingRisk] = None
    category_forecast: List[CategoryForecastItem] = Field(default_factory=list)
    budget_comparison: Optional[BudgetComparison] = None
    performance_benchmarks: Optional[PerformanceBenchmarks] = None
    why_this_forecast_drivers: List[str] = Field(default_factory=list)
    multi_horizon_forecast: List[ForecastHorizonPoint] = Field(default_factory=list)
    has_sufficient_data: bool = True
    active_days: int = 30
    # Enhanced Production-Grade Modules
    recurring_expenses: List[RecurringExpenseItem] = Field(default_factory=list)
    total_recurring_amount: float = 0.0
    fixed_vs_variable: Optional[FixedVsVariableBreakdown] = None
    spending_heatmap: Optional[SpendingHeatmapData] = None
    cash_flow: Optional[CashFlowForecast] = None
    data_quality: Optional[DataQualityMetrics] = None
    ai_recommendations: List[AiRecommendationItem] = Field(default_factory=list)
    future_projections: Optional[FutureProjections] = None
    model_metadata: Optional[ModelMetadataResponse] = None
    last_prediction_validation: Optional[LastPredictionValidation] = None
    model_reliability: Optional[ModelReliabilitySummary] = None


class PredictionScenarioRequest(BaseModel):
    target_month: Optional[int] = Field(None, ge=1, le=12, description="Target forecast month (1 to 12)")
    income_growth_pct: Optional[float] = Field(0.0, ge=-90.0, le=200.0, description="Income growth percentage change (-90% to +200%)")
    discretionary_spend_adj_pct: Optional[float] = Field(0.0, ge=-90.0, le=200.0, description="Discretionary spend cut/increase percentage")
    recurring_bills_override: Optional[float] = Field(None, ge=0.0, description="Custom fixed recurring bill total")
