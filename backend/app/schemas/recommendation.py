from pydantic import BaseModel, Field, field_validator
from typing import Optional
from uuid import UUID
from datetime import datetime

class RecommendationCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255, description="Brief header summary of advice")
    description: str = Field(..., min_length=1, description="Detail text context")
    priority: str = Field(..., description="Action preference: High, Medium, Low")
    recommendation_type: str = Field(..., min_length=1, max_length=50, description="Recommendation category/type tag")
    is_read: bool = Field(default=False, description="Status read flag")

    @field_validator("priority")
    @classmethod
    def validate_priority(cls, v: str) -> str:
        v_clean = v.strip()
        allowed = {'High', 'Medium', 'Low'}
        for a in allowed:
            if a.lower() == v_clean.lower():
                return a
        raise ValueError(f"Priority must be one of: {', '.join(allowed)}")

    model_config = {
        "json_schema_extra": {
            "example": {
                "title": "Reduce Dining Spending",
                "description": "You spent 40% more on dining this month. Try cooking at home to save around 5,000 INR.",
                "priority": "Medium",
                "recommendation_type": "Budget Warning",
                "is_read": False
            }
        }
    }


class RecommendationUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, min_length=1)
    priority: Optional[str] = Field(None)
    recommendation_type: Optional[str] = Field(None, min_length=1, max_length=50)
    is_read: Optional[bool] = Field(None)

    @field_validator("priority")
    @classmethod
    def validate_priority(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            v_clean = v.strip()
            allowed = {'High', 'Medium', 'Low'}
            for a in allowed:
                if a.lower() == v_clean.lower():
                    return a
            raise ValueError(f"Priority must be one of: {', '.join(allowed)}")
        return v


class RecommendationResponse(BaseModel):
    id: UUID
    user_id: UUID
    title: str
    description: str
    priority: str
    recommendation_type: str
    is_read: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
