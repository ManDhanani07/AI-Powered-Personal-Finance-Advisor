"""
SystemHealthLog Model Definition.
Stores background technical health checks, latencies, and service statuses.
"""

import uuid
from datetime import datetime
from typing import Optional
from sqlalchemy import String, Text, Integer, DateTime, func, Index
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, UUIDMixin

class SystemHealthLog(Base, UUIDMixin):
    __tablename__ = "system_health_logs"

    service_name: Mapped[str] = mapped_column(String(50), nullable=False, index=True) # API, POSTGRESQL, GEMINI, FORECASTING, ML_SERVICE
    status: Mapped[str] = mapped_column(String(50), default="OPERATIONAL", nullable=False) # OPERATIONAL, WARNING, ERROR
    response_time_ms: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    checked_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False, index=True
    )

    __table_args__ = (
        Index("idx_system_health_service_checked", "service_name", "checked_at"),
    )
