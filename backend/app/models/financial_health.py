import uuid
from datetime import datetime
from sqlalchemy import String, Integer, text, Uuid, ForeignKey, CheckConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from app.database.database import Base

class FinancialHealth(Base):
    __tablename__ = "financial_health"
    __table_args__ = (
        CheckConstraint(
            "health_score BETWEEN 0 AND 100",
            name="chk_health_score"
        ),
        CheckConstraint(
            "savings_score BETWEEN 0 AND 100",
            name="chk_savings_score"
        ),
        CheckConstraint(
            "budget_score BETWEEN 0 AND 100",
            name="chk_budget_score"
        ),
        CheckConstraint(
            "investment_score BETWEEN 0 AND 100",
            name="chk_investment_score"
        ),
        CheckConstraint(
            "debt_score BETWEEN 0 AND 100",
            name="chk_debt_score"
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid, primary_key=True, default=uuid.uuid4, server_default=text("gen_random_uuid()")
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    health_score: Mapped[int] = mapped_column(Integer, nullable=False)
    savings_score: Mapped[int] = mapped_column(Integer, nullable=False)
    budget_score: Mapped[int] = mapped_column(Integer, nullable=False)
    investment_score: Mapped[int] = mapped_column(Integer, nullable=False)
    debt_score: Mapped[int] = mapped_column(Integer, nullable=False)
    overall_status: Mapped[str] = mapped_column(String(50), nullable=False)

    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(server_default=func.now(), onupdate=func.now())

    # Relationships
    user: Mapped["User"] = relationship(back_populates="financial_health")
