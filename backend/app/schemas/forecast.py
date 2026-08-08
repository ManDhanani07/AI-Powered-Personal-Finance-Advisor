"""
Pydantic v2 Schemas for AI Financial Forecasting Module.
"""

from typing import Optional, List, Dict, Any
from datetime import date, datetime
from decimal import Decimal
from pydantic import BaseModel


class ForecastPointSchema(BaseModel):
    ds: date                     # Date of forecast or historical point
    yhat: Decimal                # Predicted target value
    yhat_lower: Decimal          # Lower 95% confidence bound
    yhat_upper: Decimal          # Upper 95% confidence bound
    trend: Decimal               # Underlying trend component
    is_projection: bool          # True if future prediction, False if historical actual


class ForecastAccuracyMetricsSchema(BaseModel):
    mae: Decimal                 # Mean Absolute Error
    rmse: Decimal                # Root Mean Squared Error
    mape: Decimal                # Mean Absolute Percentage Error (%)
    data_points_count: int       # Number of historical transaction days trained on
    model_name: str = "Meta Prophet v1.3"


class SmartWarningSchema(BaseModel):
    id: str
    severity: str                # DANGER, WARNING, SUCCESS, INFO
    title: str
    message: str
    recommendation: str
    metric: str                  # EXPENSE, INCOME, SAVINGS, BALANCE


class BusinessInsightsSchema(BaseModel):
    expected_monthly_expense: Decimal
    expected_monthly_income: Decimal
    expected_savings: Decimal
    expected_balance: Decimal
    expense_trend_pct: Decimal
    income_trend_pct: Decimal
    growth_trend_pct: Decimal
    forecast_horizon_days: int


class ForecastResponse(BaseModel):
    forecast_type: str           # EXPENSE, INCOME, SAVINGS, BALANCE, CASH_FLOW
    period_days: int
    sufficient_data: bool
    message: str
    accuracy_metrics: Optional[ForecastAccuracyMetricsSchema] = None
    forecast_points: List[ForecastPointSchema] = []
    insights: Optional[BusinessInsightsSchema] = None
    smart_warnings: List[SmartWarningSchema] = []


class ForecastSummaryResponse(BaseModel):
    period_days: int
    sufficient_data: bool
    message: str
    accuracy_metrics: Optional[ForecastAccuracyMetricsSchema] = None
    expense_forecast: List[ForecastPointSchema] = []
    income_forecast: List[ForecastPointSchema] = []
    savings_forecast: List[ForecastPointSchema] = []
    balance_forecast: List[ForecastPointSchema] = []
    insights: Optional[BusinessInsightsSchema] = None
    smart_warnings: List[SmartWarningSchema] = []
