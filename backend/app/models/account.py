import uuid
from datetime import datetime
from typing import List
from sqlalchemy import String, Boolean, CHAR, text, Uuid, ForeignKey, Numeric, CheckConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from app.database.database import Base

class Account(Base):
    __tablename__ = "accounts"
    __table_args__ = (
        CheckConstraint(
            "type IN ('checking', 'savings', 'credit_card', 'investment', 'cash', 'loan')",
            name="chk_account_type"
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid, primary_key=True, default=uuid.uuid4, server_default=text("gen_random_uuid()")
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    type: Mapped[str] = mapped_column(String(30), nullable=False)
    balance: Mapped[float] = mapped_column(Numeric(15, 4), default=0.0000, server_default=text("0.0000"))
    currency: Mapped[str] = mapped_column(CHAR(3), default="USD", server_default=text("'USD'"))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, server_default=text("true"))

    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(server_default=func.now(), onupdate=func.now())

    # Relationships
    user: Mapped["User"] = relationship(back_populates="accounts")
    
    outgoing_transactions: Mapped[List["Transaction"]] = relationship(
        "Transaction",
        foreign_keys="[Transaction.src_account_id]",
        back_populates="src_account"
    )
    incoming_transactions: Mapped[List["Transaction"]] = relationship(
        "Transaction",
        foreign_keys="[Transaction.dest_account_id]",
        back_populates="dest_account"
    )
