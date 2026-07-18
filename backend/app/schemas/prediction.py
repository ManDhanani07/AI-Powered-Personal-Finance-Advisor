from pydantic import BaseModel, Field, field_validator
from typing import Optional
from uuid import UUID
from datetime import datetime

class PredictionCreate(BaseModel):
    transaction_id: UUID = Field(..., description="Target Transaction UUID")
    predicted_category: str = Field(..., min_length=1, max_length=100, description="Name of category predicted by model")
    confidence_score: float = Field(..., description="Prediction confidence score")
    model_version: str = Field(..., min_length=1, max_length=50, description="Version tag of model used")
    prediction_time: Optional[datetime] = Field(None, description="Timestamp of inference")

    @field_validator("confidence_score")
    @classmethod
    def validate_confidence(cls, v: float) -> float:
        if not (0.0 <= v <= 1.0):
            raise ValueError("Confidence score must be between 0.0 and 1.0.")
        return v

    model_config = {
        "protected_namespaces": (),
        "json_schema_extra": {
            "example": {
                "transaction_id": "42dbceb5-4a5c-42ea-8226-5b4d6d1cf98f",
                "predicted_category": "Food",
                "confidence_score": 0.9250,
                "model_version": "v1.0.2",
                "prediction_time": "2026-07-18T14:06:23Z"
            }
        }
    }


class PredictionUpdate(BaseModel):
    transaction_id: Optional[UUID] = Field(None)
    predicted_category: Optional[str] = Field(None, min_length=1, max_length=100)
    confidence_score: Optional[float] = Field(None)
    model_version: Optional[str] = Field(None, min_length=1, max_length=50)
    prediction_time: Optional[datetime] = Field(None)

    @field_validator("confidence_score")
    @classmethod
    def validate_confidence(cls, v: Optional[float]) -> Optional[float]:
        if v is not None and not (0.0 <= v <= 1.0):
            raise ValueError("Confidence score must be between 0.0 and 1.0.")
        return v

    model_config = {
        "protected_namespaces": ()
    }


class PredictionResponse(BaseModel):
    id: UUID
    transaction_id: UUID
    predicted_category: str
    confidence_score: float
    model_version: str
    prediction_time: datetime

    class Config:
        from_attributes = True
        protected_namespaces = ()
