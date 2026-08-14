"""
AdminActivitySummary Model Definition.
Stores daily aggregated platform analytics for fast admin dashboard rendering.
"""

import uuid
from datetime import date
from decimal import Decimal
from sqlalchemy import Date, Integer, Numeric, Index
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, UUIDMixin

class AdminActivitySummary(Base, UUIDMixin):
    __tablename__ = "admin_activity_summaries"

    date: Mapped[date] = mapped_column(Date, unique=True, index=True, nullable=False)
    total_users: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    active_users: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    new_users: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    total_transactions: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    transaction_value: Mapped[Decimal] = mapped_column(Numeric(14, 2), default=0.00, nullable=False)
    ai_requests: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    failed_requests: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
