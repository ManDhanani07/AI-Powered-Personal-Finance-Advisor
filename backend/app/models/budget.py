import uuid
from datetime import datetime, date
from sqlalchemy import String, text, Uuid, ForeignKey, Numeric, CheckConstraint, UniqueConstraint, Date
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from app.database.database import Base

class Budget(Base):
    __tablename__ = "budgets"
    __table_args__ = (
        CheckConstraint(
            "amount_limit > 0.0000",
            name="chk_budget_amount_limit"
        ),
        CheckConstraint(
            "start_date <= end_date",
            name="chk_budget_dates"
        ),
        CheckConstraint(
            "period IN ('weekly', 'monthly', 'yearly', 'custom')",
            name="chk_budget_period"
        ),
        UniqueConstraint("user_id", "category_id", "period", "start_date", name="uq_budget_category_period"),
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
    amount_limit: Mapped[float] = mapped_column(Numeric(15, 4), nullable=False)
    period: Mapped[str] = mapped_column(String(15), default="monthly", server_default=text("'monthly'"))
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date] = mapped_column(Date, nullable=False)

    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(server_default=func.now(), onupdate=func.now())

    # Relationships
    user: Mapped["User"] = relationship(back_populates="budgets")
    category: Mapped["Category"] = relationship(back_populates="budgets")
