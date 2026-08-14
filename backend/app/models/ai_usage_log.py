"""
AiUsageLog Model Definition.
Tracks Gemini AI queries, token usage, response latencies, and errors.
"""

import uuid
from datetime import datetime
from typing import Optional
from sqlalchemy import String, Text, Integer, DateTime, ForeignKey, func, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, UUIDMixin

class AiUsageLog(Base, UUIDMixin):
    __tablename__ = "ai_usage_logs"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    request_type: Mapped[str] = mapped_column(String(50), default="CHAT_QUERY", nullable=False)
    prompt_summary: Mapped[str] = mapped_column(Text, nullable=False)
    response_status: Mapped[str] = mapped_column(String(50), default="SUCCESS", nullable=False)
    response_time_ms: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    model_name: Mapped[str] = mapped_column(String(100), default="gemini-1.5-pro", nullable=False)
    token_usage: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False, index=True
    )

    __table_args__ = (
        Index("idx_ai_usage_user_created", "user_id", "created_at"),
    )
