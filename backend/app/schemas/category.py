from pydantic import BaseModel, Field, field_validator
from typing import Optional
from uuid import UUID
from datetime import datetime
import re

class CategoryCreate(BaseModel):
    parent_id: Optional[UUID] = Field(None, description="Optional parent category ID for nested subcategories")
    name: str = Field(..., min_length=1, max_length=50)
    type: str = Field(..., description="Type: income, expense, transfer")
    icon: Optional[str] = Field(None, max_length=50)
    color: Optional[str] = Field(None, description="Hex color format, e.g. #FF5733")

    @field_validator("type")
    @classmethod
    def validate_type(cls, v: str) -> str:
        v = v.strip().lower()
        if v not in {'income', 'expense', 'transfer'}:
            raise ValueError("Category type must be: income, expense, or transfer.")
        return v

    @field_validator("color")
    @classmethod
    def validate_color(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            v = v.strip()
            if not re.match(r"^#[0-9A-Fa-f]{6}$", v):
                raise ValueError("Color must be a valid 6-character Hex string (e.g. #FFFFFF).")
        return v


class CategoryUpdate(BaseModel):
    parent_id: Optional[UUID] = Field(None)
    name: Optional[str] = Field(None, min_length=1, max_length=50)
    type: Optional[str] = Field(None)
    icon: Optional[str] = Field(None, max_length=50)
    color: Optional[str] = Field(None)

    @field_validator("type")
    @classmethod
    def validate_type(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            v = v.strip().lower()
            if v not in {'income', 'expense', 'transfer'}:
                raise ValueError("Category type must be: income, expense, or transfer.")
        return v

    @field_validator("color")
    @classmethod
    def validate_color(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            v = v.strip()
            if not re.match(r"^#[0-9A-Fa-f]{6}$", v):
                raise ValueError("Color must be a valid 6-character Hex string (e.g. #FFFFFF).")
        return v


class CategoryResponse(BaseModel):
    id: UUID
    user_id: Optional[UUID] = None
    parent_id: Optional[UUID] = None
    name: str
    type: str
    icon: Optional[str] = None
    color: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
