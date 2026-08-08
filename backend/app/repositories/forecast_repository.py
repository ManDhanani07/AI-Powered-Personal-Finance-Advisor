"""
Forecast Repository handling Database operations for Prophet AI forecasts.
"""

from typing import Optional, List
from uuid import UUID
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.forecast_history import ForecastHistory
from app.repositories.base import BaseRepository


class ForecastRepository(BaseRepository[ForecastHistory]):
    def __init__(self, db: AsyncSession):
        super().__init__(ForecastHistory, db)

    async def get_latest_by_user(
        self, user_id: UUID, forecast_type: Optional[str] = None
    ) -> Optional[ForecastHistory]:
        """Fetch the most recent forecast calculation for a user."""
        query = select(ForecastHistory).where(ForecastHistory.user_id == user_id)
        if forecast_type:
            query = query.where(ForecastHistory.forecast_type == forecast_type.upper())
        query = query.order_by(desc(ForecastHistory.generated_at)).limit(1)

        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def get_user_forecast_history(
        self, user_id: UUID, limit: int = 10
    ) -> List[ForecastHistory]:
        """Fetch historical forecast records for user trend evaluation."""
        query = (
            select(ForecastHistory)
            .where(ForecastHistory.user_id == user_id)
            .order_by(desc(ForecastHistory.generated_at))
            .limit(limit)
        )
        result = await self.db.execute(query)
        return list(result.scalars().all())
