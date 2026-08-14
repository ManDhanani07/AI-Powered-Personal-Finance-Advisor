"""
AuditLog Model Definition for Security & Enterprise Activity Tracking.
"""

import uuid
from datetime import datetime
from typing import Optional
from sqlalchemy import String, Text, DateTime, ForeignKey, func, Index
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, UUIDMixin

class AuditLog(Base, UUIDMixin):
    __tablename__ = "audit_logs"

    user_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    actor_type: Mapped[str] = mapped_column(String(50), default="USER", nullable=False, index=True) # USER, ADMIN, SYSTEM
    action: Mapped[str] = mapped_column(String(100), nullable=False, index=True) # LOGIN, LOGOUT, CREATE, UPDATE, DELETE, etc.
    resource_type: Mapped[str] = mapped_column(String(100), nullable=False, index=True) # USER, TRANSACTION, BUDGET, GOAL, etc.
    resource_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    ip_address: Mapped[Optional[str]] = mapped_column(String(50), default="127.0.0.1", nullable=True)
    user_agent: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    metadata_json: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="Success", nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False, index=True
    )

    __table_args__ = (
        Index("idx_audit_logs_user_created", "user_id", "created_at"),
        Index("idx_audit_logs_action_resource", "action", "resource_type"),
    )
