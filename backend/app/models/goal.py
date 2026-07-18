import uuid
from datetime import datetime, date
from typing import Optional, List
from sqlalchemy import String, Boolean, text, Uuid, ForeignKey, Numeric, CheckConstraint, Date
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from app.database.database import Base

class Goal(Base):
    __tablename__ = "financial_goals"
    __table_args__ = (
        CheckConstraint(
            "target_amount > 0.0000",
            name="chk_goal_target_amount"
        ),
        CheckConstraint(
            "current_amount >= 0.0000",
            name="chk_goal_current_amount"
        ),
        CheckConstraint(
            "priority IN ('High', 'Medium', 'Low')",
            name="chk_goal_priority"
        ),
        CheckConstraint(
            "goal_status IN ('In Progress', 'Completed', 'Abandoned')",
            name="chk_goal_status"
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid, primary_key=True, default=uuid.uuid4, server_default=text("gen_random_uuid()")
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(String(100), nullable=False)
    goal_type: Mapped[str] = mapped_column(String(50), nullable=False)
    target_amount: Mapped[float] = mapped_column(Numeric(15, 4), nullable=False)
    current_amount: Mapped[float] = mapped_column(Numeric(15, 4), default=0.0000, server_default=text("0.0000"), nullable=False)
    target_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    priority: Mapped[str] = mapped_column(String(15), nullable=False)
    goal_status: Mapped[str] = mapped_column(String(30), default="In Progress", server_default=text("'In Progress'"), nullable=False)
    auto_save: Mapped[bool] = mapped_column(Boolean, default=False, server_default=text("false"), nullable=False)
    monthly_target: Mapped[float] = mapped_column(Numeric(15, 4), default=0.0000, server_default=text("0.0000"), nullable=False)
    notes: Mapped[Optional[str]] = mapped_column(String, nullable=True)

    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(server_default=func.now(), onupdate=func.now())

    # Relationships
    user: Mapped["User"] = relationship(back_populates="goals")
    contributions: Mapped[List["GoalContribution"]] = relationship(
        back_populates="goal",
        cascade="all, delete-orphan"
    )


class GoalContribution(Base):
    __tablename__ = "goal_contributions"
    __table_args__ = (
        CheckConstraint(
            "amount <> 0.0000",
            name="chk_contribution_amount"
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid, primary_key=True, default=uuid.uuid4, server_default=text("gen_random_uuid()")
    )
    goal_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("financial_goals.id", ondelete="CASCADE"), nullable=False, index=True
    )
    transaction_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        Uuid, ForeignKey("transactions.id", ondelete="SET NULL"), nullable=True, index=True
    )
    amount: Mapped[float] = mapped_column(Numeric(15, 4), nullable=False)
    contribution_date: Mapped[datetime] = mapped_column(server_default=func.now())

    created_at: Mapped[datetime] = mapped_column(server_default=func.now())

    # Relationships
    goal: Mapped["Goal"] = relationship(back_populates="contributions")
    transaction: Mapped[Optional["Transaction"]] = relationship(back_populates="goal_contributions")
