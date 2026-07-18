import uuid
from datetime import datetime
from sqlalchemy import String, Integer, text, Uuid, ForeignKey, Numeric, CheckConstraint, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from app.database.database import Base

class Budget(Base):
    __tablename__ = "budgets"
    __table_args__ = (
        CheckConstraint(
            "monthly_limit > 0.0000",
            name="chk_budget_monthly_limit"
        ),
        CheckConstraint(
            "warning_percentage > 0 AND warning_percentage <= 100",
            name="chk_budget_warning_percentage"
        ),
        CheckConstraint(
            "month >= 1 AND month <= 12",
            name="chk_budget_month"
        ),
        CheckConstraint(
            "year >= 2000 AND year <= 2100",
            name="chk_budget_year"
        ),
        UniqueConstraint("user_id", "category_id", "month", "year", name="uq_budget_category_month_year"),
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
    monthly_limit: Mapped[float] = mapped_column(Numeric(15, 4), nullable=False)
    warning_percentage: Mapped[int] = mapped_column(Integer, default=80, server_default=text("80"))
    month: Mapped[int] = mapped_column(Integer, nullable=False)
    year: Mapped[int] = mapped_column(Integer, nullable=False)
    currency: Mapped[str] = mapped_column(String(3), default="INR", server_default=text("'INR'"))

    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(server_default=func.now(), onupdate=func.now())

    # Relationships
    user: Mapped["User"] = relationship(back_populates="budgets")
    category: Mapped["Category"] = relationship(back_populates="budgets")
