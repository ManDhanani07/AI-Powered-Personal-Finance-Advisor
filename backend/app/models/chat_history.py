"""
ChatHistory Model Definition.
"""

import uuid
from typing import TYPE_CHECKING
from datetime import datetime
from sqlalchemy import String, Text, DateTime, ForeignKey, Index, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, UUIDMixin

if TYPE_CHECKING:
    from app.models.user import User


class ChatHistory(Base, UUIDMixin):
    __tablename__ = "chat_histories"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    question: Mapped[str] = mapped_column(Text, nullable=False)
    answer: Mapped[str] = mapped_column(Text, nullable=False)
    model_name: Mapped[str] = mapped_column(String(100), default="gemini-1.5-pro", nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="chat_histories")

    __table_args__ = (
        Index("idx_user_chat_created", "user_id", "created_at"),
    )
