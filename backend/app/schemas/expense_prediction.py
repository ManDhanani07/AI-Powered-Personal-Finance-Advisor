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
    txn_count: int = Field(..., description="Total monthly transaction count")
    avg_tx_size: float = Field(..., description="Average transaction size in INR")


class ForecastDetails(BaseModel):
    predicted_routine_spend: float = Field(..., description="Expected routine monthly expense prediction (P50)")
    confidence_range_p10_p90: ConfidenceRange = Field(..., description="Quantile bounds [P10, P50, P90]")
    recommended_emergency_buffer: float = Field(..., description="Calibrated liquidity emergency cushion")
    safe_total_budget_ceiling: float = Field(..., description="Predicted spend + recommended emergency buffer")
    estimated_monthly_savings: float = Field(..., description="Projected monthly disposable cash surplus")
    confidence_tier: str = Field(..., description="Confidence tier and historical depth description")
    target_month_name: Optional[str] = Field(None, description="Target forecast month name (e.g. September)")
    target_month_num: Optional[int] = Field(None, description="Target forecast month number (1-12)")


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


class ExpensePredictionResponse(BaseModel):
    user_id: UUID
    generated_at: datetime = Field(default_factory=datetime.utcnow)
    sanitized_summary: SanitizedSummary
    forecast: ForecastDetails
    financial_health_audit: FinancialHealthAudit
    historical_trend: List[HistoricalMonthData] = Field(default_factory=list)
    has_sufficient_data: bool = True
    active_days: int = 30


class PredictionScenarioRequest(BaseModel):
    target_month: Optional[int] = Field(None, ge=1, le=12, description="Target forecast month (1 to 12)")
    income_growth_pct: Optional[float] = Field(0.0, ge=-90.0, le=200.0, description="Income growth percentage change (-90% to +200%)")
    discretionary_spend_adj_pct: Optional[float] = Field(0.0, ge=-90.0, le=200.0, description="Discretionary spend cut/increase percentage")
    recurring_bills_override: Optional[float] = Field(None, ge=0.0, description="Custom fixed recurring bill total")


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
