"""
Budget Model Definition.
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
    from app.models.category import Category


class Budget(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "budgets"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    category_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("categories.id", ondelete="SET NULL"), index=True, nullable=True
    )
    budget_name: Mapped[str] = mapped_column(String(150), nullable=False)
    budget_amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    spent_amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0.00, nullable=False)
    remaining_amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0.00, nullable=False)
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date] = mapped_column(Date, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="ACTIVE", nullable=False)  # ACTIVE, EXCEEDED, COMPLETED

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="budgets")
    category: Mapped[Optional["Category"]] = relationship("Category", back_populates="budgets")

    __table_args__ = (
        Index("idx_user_budget_dates", "user_id", "start_date", "end_date"),
    )
