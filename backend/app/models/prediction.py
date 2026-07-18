import uuid
from datetime import datetime, date
from typing import Optional
from sqlalchemy import String, text, Uuid, ForeignKey, Numeric, CheckConstraint, UniqueConstraint, Date, Boolean, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from app.database.database import Base

class ExpensePrediction(Base):
    __tablename__ = "expense_predictions"
    __table_args__ = (
        CheckConstraint(
            "predicted_amount >= 0.0000",
            name="chk_prediction_amount"
        ),
        CheckConstraint(
            "lower_bound <= predicted_amount AND predicted_amount <= upper_bound",
            name="chk_prediction_bounds"
        ),
        UniqueConstraint("user_id", "category_id", "forecast_month", name="uq_prediction_user_category_month"),
        Index("idx_predictions_lookup", "user_id", "forecast_month"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid, primary_key=True, default=uuid.uuid4, server_default=text("gen_random_uuid()")
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    category_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("categories.id", ondelete="CASCADE"), nullable=False, index=True
    )
    forecast_month: Mapped[date] = mapped_column(Date, nullable=False)
    predicted_amount: Mapped[float] = mapped_column(Numeric(15, 4), nullable=False)
    lower_bound: Mapped[float] = mapped_column(Numeric(15, 4), nullable=False)
    upper_bound: Mapped[float] = mapped_column(Numeric(15, 4), nullable=False)
    model_version: Mapped[str] = mapped_column(String(50), nullable=False)

    created_at: Mapped[datetime] = mapped_column(server_default=func.now())

    # Relationships
    user: Mapped["User"] = relationship(back_populates="predictions")
    category: Mapped["Category"] = relationship(back_populates="predictions")


class AICategorizationFeedback(Base):
    __tablename__ = "ai_categorization_feedback"
    __table_args__ = (
        CheckConstraint(
            "confidence_score BETWEEN 0.0000 AND 1.0000",
            name="chk_ai_confidence"
        ),
        Index("idx_ai_feedback_model_override", "model_version", "is_override"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid, primary_key=True, default=uuid.uuid4, server_default=text("gen_random_uuid()")
    )
    transaction_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("transactions.id", ondelete="CASCADE"), nullable=False, index=True, unique=True
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    predicted_category_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("categories.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    actual_category_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("categories.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    confidence_score: Mapped[float] = mapped_column(Numeric(5, 4), nullable=False)
    model_version: Mapped[str] = mapped_column(String(50), nullable=False)
    is_override: Mapped[bool] = mapped_column(Boolean, nullable=False)

    created_at: Mapped[datetime] = mapped_column(server_default=func.now())

    # Relationships
    transaction: Mapped["Transaction"] = relationship(back_populates="ai_feedback")
    user: Mapped["User"] = relationship(back_populates="ai_feedbacks")
    predicted_category: Mapped["Category"] = relationship("Category", foreign_keys=[predicted_category_id])
    actual_category: Mapped["Category"] = relationship("Category", foreign_keys=[actual_category_id])
