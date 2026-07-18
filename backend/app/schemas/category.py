from pydantic import BaseModel, Field, field_validator
from typing import Optional
from uuid import UUID
from datetime import datetime
import re

class CategoryCreate(BaseModel):
    parent_id: Optional[UUID] = Field(None, description="Optional parent category ID for nested subcategories")
    name: str = Field(..., min_length=1, max_length=50)
    category_type: str = Field(..., description="Category type: Expense, Income, Investment, Transfer")
    icon: Optional[str] = Field(None, max_length=50)
    color: Optional[str] = Field(None, description="Hex color format, e.g. #FF9800")
    is_default: bool = Field(default=False, description="System default category flag")

    @field_validator("category_type")
    @classmethod
    def validate_type(cls, v: str) -> str:
        v_clean = v.strip()
        allowed = {'Expense', 'Income', 'Investment', 'Transfer'}
        for a in allowed:
            if a.lower() == v_clean.lower():
                return a
        raise ValueError(f"Category type must be one of: {', '.join(allowed)}")

    @field_validator("color")
    @classmethod
    def validate_color(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            v = v.strip()
            if not re.match(r"^#[0-9A-Fa-f]{6}$", v):
                raise ValueError("Color must be a valid 6-character Hex string (e.g. #FFFFFF).")
        return v

    model_config = {
        "json_schema_extra": {
            "example": {
                "name": "Food",
                "icon": "🍔",
                "color": "#FF9800",
                "category_type": "Expense"
            }
        }
    }


class CategoryUpdate(BaseModel):
    parent_id: Optional[UUID] = Field(None)
    name: Optional[str] = Field(None, min_length=1, max_length=50)
    category_type: Optional[str] = Field(None)
    icon: Optional[str] = Field(None, max_length=50)
    color: Optional[str] = Field(None)
    is_default: Optional[bool] = Field(None)

    @field_validator("category_type")
    @classmethod
    def validate_type(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            v_clean = v.strip()
            allowed = {'Expense', 'Income', 'Investment', 'Transfer'}
            for a in allowed:
                if a.lower() == v_clean.lower():
                    return a
            raise ValueError(f"Category type must be one of: {', '.join(allowed)}")
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
    category_type: str
    icon: Optional[str] = None
    color: Optional[str] = None
    is_default: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
