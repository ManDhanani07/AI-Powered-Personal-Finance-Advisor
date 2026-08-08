"""
User Model Definition with Enterprise Security and Authentication Fields.
"""

from typing import Optional, List, TYPE_CHECKING
from datetime import date, datetime
from decimal import Decimal
from sqlalchemy import String, Date, Numeric, Boolean, DateTime, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, UUIDMixin, TimestampMixin

if TYPE_CHECKING:
    from app.models.transaction import Transaction
    from app.models.budget import Budget
    from app.models.goal import Goal
    from app.models.forecast_history import ForecastHistory
    from app.models.financial_health_history import FinancialHealthHistory
    from app.models.chat_history import ChatHistory
    from app.models.notification import Notification


class User(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "users"

    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    gender: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    date_of_birth: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    occupation: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    monthly_income: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0.00, nullable=False)
    currency: Mapped[str] = mapped_column(String(10), default="INR", nullable=False)
    city: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    state: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    country: Mapped[str] = mapped_column(String(100), default="India", nullable=False)
    profile_picture: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Enterprise Authentication & Security Fields
    email_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    email_verification_token: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    password_reset_token: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    password_reset_expiry: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    last_login: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    failed_login_attempts: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    account_locked: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    lock_until: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    refresh_token: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    refresh_token_expiry: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    transactions: Mapped[List["Transaction"]] = relationship(
        "Transaction", back_populates="user", cascade="all, delete-orphan"
    )
    budgets: Mapped[List["Budget"]] = relationship(
        "Budget", back_populates="user", cascade="all, delete-orphan"
    )
    goals: Mapped[List["Goal"]] = relationship(
        "Goal", back_populates="user", cascade="all, delete-orphan"
    )
    forecast_histories: Mapped[List["ForecastHistory"]] = relationship(
        "ForecastHistory", back_populates="user", cascade="all, delete-orphan"
    )
    financial_health_histories: Mapped[List["FinancialHealthHistory"]] = relationship(
        "FinancialHealthHistory", back_populates="user", cascade="all, delete-orphan"
    )
    chat_histories: Mapped[List["ChatHistory"]] = relationship(
        "ChatHistory", back_populates="user", cascade="all, delete-orphan"
    )
    notifications: Mapped[List["Notification"]] = relationship(
        "Notification", back_populates="user", cascade="all, delete-orphan"
    )
