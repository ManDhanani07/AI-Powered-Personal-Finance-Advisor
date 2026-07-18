from pydantic import BaseModel, Field, field_validator
from typing import Optional
from uuid import UUID
from datetime import datetime

class FinancialHealthCreate(BaseModel):
    health_score: int = Field(..., ge=0, le=100, description="Overall health score")
    savings_score: int = Field(..., ge=0, le=100, description="Savings subscore")
    budget_score: int = Field(..., ge=0, le=100, description="Budget subscore")
    investment_score: int = Field(..., ge=0, le=100, description="Investment subscore")
    debt_score: int = Field(..., ge=0, le=100, description="Debt subscore")
    overall_status: str = Field(..., min_length=1, max_length=50, description="Overall diagnostic status tag, e.g. Healthy, Critical")

    model_config = {
        "json_schema_extra": {
            "example": {
                "health_score": 85,
                "savings_score": 90,
                "budget_score": 75,
                "investment_score": 80,
                "debt_score": 100,
                "overall_status": "Healthy"
            }
        }
    }


class FinancialHealthUpdate(BaseModel):
    health_score: Optional[int] = Field(None, ge=0, le=100)
    savings_score: Optional[int] = Field(None, ge=0, le=100)
    budget_score: Optional[int] = Field(None, ge=0, le=100)
    investment_score: Optional[int] = Field(None, ge=0, le=100)
    debt_score: Optional[int] = Field(None, ge=0, le=100)
    overall_status: Optional[str] = Field(None, min_length=1, max_length=50)


class FinancialHealthResponse(BaseModel):
    id: UUID
    user_id: UUID
    health_score: int
    savings_score: int
    budget_score: int
    investment_score: int
    debt_score: int
    overall_status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
