"""
Pydantic Schemas for Financial Health Score Engine.
"""

from typing import List, Dict, Any, Optional
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, Field


class ParameterDetail(BaseModel):
    key: str
    name: str
    weight_pct: float = Field(..., description="Weight percentage (e.g. 20 for 20%)")
    score: float = Field(..., description="Points earned out of max weight")
    max_score: float = Field(..., description="Max potential points for this parameter")
    percentage: float = Field(..., description="Percentage score (0-100%)")
    value_text: str = Field(..., description="Formatted value (e.g. 32.4% Savings)")
    status: str = Field(..., description="EXCELLENT | GOOD | FAIR | POOR")
    insight: str = Field(..., description="Generated rule-based explanation text")


class RecommendationItem(BaseModel):
    id: str
    category: str = Field(..., description="SAVINGS | BUDGET | STABILITY | GOALS | EMERGENCY | DEBT")
    title: str
    description: str
    impact: str = Field(..., description="HIGH | MEDIUM | LOW")
    action_type: Optional[str] = None


class FinancialHealthResponse(BaseModel):
    overall_score: float = Field(..., ge=0, le=100)
    grade: str = Field(..., description="A+ | A | B+ | B | C | D | F")
    summary: str
    calculated_at: datetime
    parameters: List[ParameterDetail]
    insights: List[str]
    recommendations: List[RecommendationItem]


class FinancialHealthHistoryItem(BaseModel):
    id: UUID
    health_score: float
    grade: str
    calculated_at: datetime
    saving_score: float
    budget_score: float
    income_score: float
    expense_score: float
    goal_score: float
    emergency_score: float
    debt_score: float

    class Config:
        from_attributes = True


class FinancialHealthBreakdownResponse(BaseModel):
    overall_score: float
    grade: str
    weight_distribution: Dict[str, float]
    parameters: List[ParameterDetail]
    insights: List[str]
