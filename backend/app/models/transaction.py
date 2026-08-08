"""
Transaction Model Definition.
"""

import uuid
from typing import Optional, TYPE_CHECKING
from datetime import datetime
from decimal import Decimal
from sqlalchemy import String, Text, Numeric, Boolean, DateTime, ForeignKey, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, UUIDMixin, TimestampMixin, SoftDeleteMixin

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.category import Category


class Transaction(Base, UUIDMixin, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "transactions"

    transaction_number: Mapped[str] = mapped_column(
        String(50), unique=True, index=True, nullable=False
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    category_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("categories.id", ondelete="SET NULL"), index=True, nullable=True
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    merchant: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    transaction_type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)  # INCOME, EXPENSE, TRANSFER
    payment_method: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)  # UPI, CREDIT_CARD, CASH, BANK
    account_type: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)  # SAVINGS, CHECKING, CREDIT
    amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    transaction_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)
    location: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_recurring: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="transactions")
    category: Mapped[Optional["Category"]] = relationship("Category", back_populates="transactions")

    __table_args__ = (
        Index("idx_user_transaction_date", "user_id", "transaction_date"),
    )
