"""
ForecastHistory Model Definition.
"""

import uuid
from typing import Dict, Any, TYPE_CHECKING
from datetime import datetime
from sqlalchemy import String, DateTime, ForeignKey, Index, func
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, UUIDMixin

if TYPE_CHECKING:
    from app.models.user import User


class ForecastHistory(Base, UUIDMixin):
    __tablename__ = "forecast_histories"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    forecast_type: Mapped[str] = mapped_column(String(50), nullable=False)  # INCOME_FORECAST, EXPENSE_FORECAST, PROPHET
    forecast_period: Mapped[str] = mapped_column(String(50), default="MONTHLY", nullable=False)
    prediction_json: Mapped[Dict[str, Any]] = mapped_column(JSONB, nullable=False)
    generated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="forecast_histories")

    __table_args__ = (
        Index("idx_user_forecast_generated", "user_id", "generated_at"),
    )
