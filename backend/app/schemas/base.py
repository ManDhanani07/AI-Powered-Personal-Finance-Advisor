"""
Reusable Base Pydantic Schemas and API Response Envelopes.
"""

from typing import Generic, TypeVar, Optional, Dict, Any, List
from pydantic import BaseModel, ConfigDict, Field

T = TypeVar("T")


class APIResponse(BaseModel, Generic[T]):
    """Standardized API JSON Envelope."""
    model_config = ConfigDict(from_attributes=True, arbitrary_types_allowed=True)

    success: bool = True
    message: str = "Operation completed successfully"
    data: Optional[T] = None
    meta: Optional[Dict[str, Any]] = None


class PaginatedMeta(BaseModel):
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=20, ge=1, le=1000)
    total_items: int = Field(default=0, ge=0)
    total_pages: int = Field(default=0, ge=0)
    has_next: bool = False
    has_prev: bool = False


class PaginatedResponse(BaseModel, Generic[T]):
    model_config = ConfigDict(from_attributes=True, arbitrary_types_allowed=True)

    items: List[T] = []
    pagination: PaginatedMeta


class HealthCheckResponse(BaseModel):
    status: str = "healthy"
    version: str
    environment: str
    database_connected: bool
