import uuid
from datetime import datetime
from typing import Optional, List
from sqlalchemy import String, text, Uuid, ForeignKey, Numeric, CheckConstraint, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from app.database.database import Base

class Transaction(Base):
    __tablename__ = "transactions"
    __table_args__ = (
        CheckConstraint(
            "amount > 0.0000",
            name="chk_transaction_amount"
        ),
        CheckConstraint(
            "type IN ('income', 'expense', 'transfer')",
            name="chk_transaction_type"
        ),
        CheckConstraint(
            "status IN ('pending', 'completed', 'failed')",
            name="chk_transaction_status"
        ),
        CheckConstraint(
            "(type = 'expense' AND src_account_id IS NOT NULL AND dest_account_id IS NULL) OR "
            "(type = 'income' AND dest_account_id IS NOT NULL AND src_account_id IS NULL) OR "
            "(type = 'transfer' AND src_account_id IS NOT NULL AND dest_account_id IS NOT NULL AND src_account_id <> dest_account_id)",
            name="chk_transaction_accounts"
        ),
        Index("idx_transactions_user_date", "user_id", text("transaction_date DESC")),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid, primary_key=True, default=uuid.uuid4, server_default=text("gen_random_uuid()")
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    category_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        Uuid, ForeignKey("categories.id", ondelete="SET NULL"), nullable=True, index=True
    )
    src_account_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        Uuid, ForeignKey("accounts.id", ondelete="RESTRICT"), nullable=True, index=True
    )
    dest_account_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        Uuid, ForeignKey("accounts.id", ondelete="RESTRICT"), nullable=True, index=True
    )
    amount: Mapped[float] = mapped_column(Numeric(15, 4), nullable=False)
    type: Mapped[str] = mapped_column(String(15), nullable=False)
    status: Mapped[str] = mapped_column(String(15), default="completed", server_default=text("'completed'"))
    description: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    transaction_date: Mapped[datetime] = mapped_column(server_default=func.now())
    notes: Mapped[Optional[str]] = mapped_column(String, nullable=True)

    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(server_default=func.now(), onupdate=func.now())

    # Relationships
    user: Mapped["User"] = relationship(
        "User", 
        back_populates="transactions",
        foreign_keys=[user_id]
    )
    category: Mapped[Optional["Category"]] = relationship("Category", back_populates="transactions")
    
    src_account: Mapped[Optional["Account"]] = relationship(
        "Account",
        foreign_keys=[src_account_id],
        back_populates="outgoing_transactions"
    )
    dest_account: Mapped[Optional["Account"]] = relationship(
        "Account",
        foreign_keys=[dest_account_id],
        back_populates="incoming_transactions"
    )

    ai_feedback: Mapped[Optional["AICategorizationFeedback"]] = relationship(
        "AICategorizationFeedback",
        back_populates="transaction",
        cascade="all, delete-orphan"
    )
    goal_contributions: Mapped[List["GoalContribution"]] = relationship(
        "GoalContribution",
        back_populates="transaction",
        cascade="all, delete-orphan"
    )
