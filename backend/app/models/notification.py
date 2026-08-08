"""
Notification Model Definition for Enterprise Alerts & System Notifications.
"""

import uuid
from typing import Optional, Dict, Any, TYPE_CHECKING
from datetime import datetime
from sqlalchemy import String, Text, Boolean, DateTime, ForeignKey, Index
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, UUIDMixin, TimestampMixin

if TYPE_CHECKING:
    from app.models.user import User


class Notification(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "notifications"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    notification_type: Mapped[str] = mapped_column(String(100), nullable=False)  # e.g., BUDGET_EXCEEDED, GOAL_COMPLETED
    type: Mapped[str] = mapped_column(String(100), default="INFO", nullable=False)
    priority: Mapped[str] = mapped_column(String(20), default="MEDIUM", nullable=False)  # CRITICAL, HIGH, MEDIUM, LOW
    status: Mapped[str] = mapped_column(String(20), default="UNREAD", nullable=False)  # UNREAD, READ
    category: Mapped[str] = mapped_column(String(50), default="SYSTEM", nullable=False)  # BUDGET, GOAL, TRANSACTION, HEALTH, FORECAST, AI, REPORT, SECURITY, REMINDER
    related_module: Mapped[str] = mapped_column(String(50), default="SYSTEM", nullable=False)
    icon: Mapped[Optional[str]] = mapped_column(String(50), default="bell", nullable=True)
    reference_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, index=True)
    read_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    metadata_json: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSONB, nullable=True)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="notifications")

    __table_args__ = (
        Index("idx_user_notification_read", "user_id", "is_read"),
        Index("idx_user_notification_created", "user_id", "created_at"),
        Index("idx_user_notification_module", "user_id", "related_module"),
        Index("idx_user_notification_priority", "user_id", "priority"),
    )
