"""
Goal Model Definition.
"""

import uuid
from typing import Optional, TYPE_CHECKING
from datetime import date
from decimal import Decimal
from sqlalchemy import String, Date, Numeric, ForeignKey, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, UUIDMixin, TimestampMixin

if TYPE_CHECKING:
    from app.models.user import User


class Goal(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "goals"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    goal_name: Mapped[str] = mapped_column(String(150), nullable=False)
    goal_type: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)  # SAVINGS, INVESTMENT, DEBT_PAYOFF
    target_amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    current_amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0.00, nullable=False)
    target_date: Mapped[date] = mapped_column(Date, nullable=False)
    priority: Mapped[str] = mapped_column(String(20), default="MEDIUM", nullable=False)  # LOW, MEDIUM, HIGH, CRITICAL
    status: Mapped[str] = mapped_column(String(50), default="IN_PROGRESS", nullable=False)  # IN_PROGRESS, ACHIEVED, CANCELLED

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="goals")

    __table_args__ = (
        Index("idx_user_goal_status", "user_id", "status"),
    )
