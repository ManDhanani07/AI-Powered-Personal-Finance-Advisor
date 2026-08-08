"""
Category Model Definition.
"""

from typing import Optional, List, TYPE_CHECKING
import uuid
from sqlalchemy import String, Text, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, UUIDMixin, TimestampMixin

if TYPE_CHECKING:
    from app.models.transaction import Transaction
    from app.models.budget import Budget


class Category(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "categories"

    category_name: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    category_type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)  # INCOME, EXPENSE, INVESTMENT
    icon: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    color: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_default: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Self-referential parent/sub-category
    parent_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("categories.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    # Relationships
    transactions: Mapped[List["Transaction"]] = relationship(
        "Transaction", back_populates="category"
    )
    budgets: Mapped[List["Budget"]] = relationship(
        "Budget", back_populates="category"
    )
    # Parent category (optional)
    parent: Mapped[Optional["Category"]] = relationship(
        "Category", remote_side="Category.id", back_populates="children", foreign_keys="Category.parent_id"
    )
    # Sub-categories
    children: Mapped[List["Category"]] = relationship(
        "Category", back_populates="parent", foreign_keys="Category.parent_id"
    )
