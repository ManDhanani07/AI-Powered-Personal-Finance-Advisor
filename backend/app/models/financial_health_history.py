"""
FinancialHealthHistory Model Definition.
"""

import uuid
from typing import TYPE_CHECKING, Any, Dict, List, Optional
from datetime import datetime
from decimal import Decimal
from sqlalchemy import Numeric, DateTime, String, ForeignKey, Index, func, JSON
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, UUIDMixin

if TYPE_CHECKING:
    from app.models.user import User


class FinancialHealthHistory(Base, UUIDMixin):
    __tablename__ = "financial_health_histories"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    health_score: Mapped[Decimal] = mapped_column(Numeric(5, 2), nullable=False)
    grade: Mapped[str] = mapped_column(String(10), default="B", nullable=False)

    # Individual Weighted Parameter Scores (out of max points)
    saving_score: Mapped[Decimal] = mapped_column(Numeric(5, 2), default=0.00, nullable=False)
    budget_score: Mapped[Decimal] = mapped_column(Numeric(5, 2), default=0.00, nullable=False)
    income_score: Mapped[Decimal] = mapped_column(Numeric(5, 2), default=0.00, nullable=False)
    expense_score: Mapped[Decimal] = mapped_column(Numeric(5, 2), default=0.00, nullable=False)
    goal_score: Mapped[Decimal] = mapped_column(Numeric(5, 2), default=0.00, nullable=False)
    emergency_score: Mapped[Decimal] = mapped_column(Numeric(5, 2), default=0.00, nullable=False)
    debt_score: Mapped[Decimal] = mapped_column(Numeric(5, 2), default=0.00, nullable=False)

    # Detailed Parameter Breakdown JSON and Generated Recommendations JSON
    breakdown: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)
    recommendations: Mapped[Optional[List[Dict[str, Any]]]] = mapped_column(JSON, nullable=True)

    calculated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="financial_health_histories")

    __table_args__ = (
        Index("idx_user_health_calculated", "user_id", "calculated_at"),
    )
