import uuid
from datetime import datetime
from typing import Optional, List
from sqlalchemy import String, Boolean, text, Uuid, ForeignKey, Numeric, CheckConstraint, Index, DateTime
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
            "transaction_type IN ('Expense', 'Income', 'Investment', 'Transfer')",
            name="chk_transaction_type"
        ),
        Index("idx_transactions_user_date", "user_id", text("transaction_date DESC")),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid, primary_key=True, default=uuid.uuid4, server_default=text("gen_random_uuid()")
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    account_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("accounts.id", ondelete="CASCADE"), nullable=False, index=True
    )
    category_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        Uuid, ForeignKey("categories.id", ondelete="SET NULL"), nullable=True, index=True
    )
    merchant: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    amount: Mapped[float] = mapped_column(Numeric(15, 4), nullable=False)
    transaction_type: Mapped[str] = mapped_column(String(30), nullable=False)
    payment_method: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    transaction_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    description: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    location: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    
    # AI ML metadata fields
    ai_predicted_category: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    prediction_confidence: Mapped[Optional[float]] = mapped_column(Numeric(5, 4), nullable=True)
    is_user_corrected: Mapped[bool] = mapped_column(Boolean, default=False, server_default=text("false"))
    receipt_image: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)

    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(server_default=func.now(), onupdate=func.now())

    # Relationships
    user: Mapped["User"] = relationship(
        "User", 
        back_populates="transactions",
        foreign_keys=[user_id]
    )
    category: Mapped[Optional["Category"]] = relationship("Category", back_populates="transactions")
    account: Mapped["Account"] = relationship("Account", back_populates="transactions", foreign_keys=[account_id])
    
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
