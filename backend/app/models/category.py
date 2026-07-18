import uuid
from datetime import datetime
from typing import List, Optional
from sqlalchemy import String, CHAR, text, Uuid, ForeignKey, CheckConstraint, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from app.database.database import Base

class Category(Base):
    __tablename__ = "categories"
    __table_args__ = (
        CheckConstraint(
            "type IN ('income', 'expense', 'transfer')",
            name="chk_category_type"
        ),
        CheckConstraint(
            "color IS NULL OR color ~ '^#[0-9A-Fa-f]{6}$'",
            name="chk_category_color"
        ),
        UniqueConstraint("user_id", "parent_id", "name", name="uq_category_name_per_user"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid, primary_key=True, default=uuid.uuid4, server_default=text("gen_random_uuid()")
    )
    user_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        Uuid, ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True
    )
    parent_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        Uuid, ForeignKey("categories.id", ondelete="RESTRICT"), nullable=True, index=True
    )
    name: Mapped[str] = mapped_column(String(50), nullable=False)
    type: Mapped[str] = mapped_column(String(15), nullable=False)
    icon: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    color: Mapped[Optional[str]] = mapped_column(CHAR(7), nullable=True)

    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(server_default=func.now(), onupdate=func.now())

    # Relationships
    user: Mapped[Optional["User"]] = relationship(back_populates="categories")
    
    parent: Mapped[Optional["Category"]] = relationship(
        "Category",
        remote_side=[id],
        back_populates="subcategories"
    )
    subcategories: Mapped[List["Category"]] = relationship(
        "Category",
        back_populates="parent",
        cascade="all, delete-orphan"
    )

    transactions: Mapped[List["Transaction"]] = relationship(
        "Transaction",
        back_populates="category"
    )
    budgets: Mapped[List["Budget"]] = relationship(
        "Budget",
        back_populates="category",
        cascade="all, delete-orphan"
    )
    predictions: Mapped[List["ExpensePrediction"]] = relationship(
        "ExpensePrediction",
        back_populates="category",
        cascade="all, delete-orphan"
    )
