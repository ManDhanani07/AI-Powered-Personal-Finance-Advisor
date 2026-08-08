"""
Pydantic v2 Schemas for Category Management.
"""

from typing import Optional
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, Field, ConfigDict


class CategoryCreateRequest(BaseModel):
    category_name: str = Field(..., min_length=1, max_length=100)
    category_type: str = Field(..., description="INCOME, EXPENSE, INVESTMENT, or TRANSFER")
    icon: Optional[str] = Field(default="Tag", max_length=100)
    color: Optional[str] = Field(default="#6366F1", max_length=50)
    description: Optional[str] = None
    is_default: bool = False
    parent_id: Optional[UUID] = None   # sub-category support


class CategoryUpdateRequest(BaseModel):
    category_name: Optional[str] = Field(None, min_length=1, max_length=100)
    category_type: Optional[str] = None
    icon: Optional[str] = Field(None, max_length=100)
    color: Optional[str] = Field(None, max_length=50)
    description: Optional[str] = None
    parent_id: Optional[UUID] = None   # allow re-parenting


class CategoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    category_name: str
    category_type: str
    icon: Optional[str] = "Tag"
    color: Optional[str] = "#6366F1"
    description: Optional[str] = None
    is_default: bool
    parent_id: Optional[UUID] = None
    parent_name: Optional[str] = None  # resolved from parent relationship
    created_at: datetime
    updated_at: datetime
