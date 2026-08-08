"""
Notification Schema Definitions for Request Validation and Response Serialization.
"""

import uuid
from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field


class NotificationResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    title: str
    message: str
    notification_type: str
    type: str = "INFO"
    priority: str  # CRITICAL, HIGH, MEDIUM, LOW
    status: str = "UNREAD"  # UNREAD, READ
    category: str  # BUDGET, GOAL, TRANSACTION, HEALTH, FORECAST, SYSTEM, AI, REPORT, SECURITY, REMINDER
    related_module: str = "SYSTEM"
    icon: Optional[str] = "bell"
    reference_id: Optional[str] = None
    is_read: bool = False
    read_at: Optional[datetime] = None
    metadata_json: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class NotificationPaginatedResponse(BaseModel):
    items: List[NotificationResponse]
    total_count: int
    unread_count: int
    page: int
    page_size: int
    total_pages: int


class NotificationUnreadSummary(BaseModel):
    unread_count: int
    latest_notifications: List[NotificationResponse]


class NotificationFilterParams(BaseModel):
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=20, ge=1, le=100)
    is_read: Optional[bool] = None
    priority: Optional[str] = None
    category: Optional[str] = None
    related_module: Optional[str] = None
    search: Optional[str] = None
