"""
Financial Health Repository Definition.
"""

from typing import List, Optional
from uuid import UUID
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_

from app.models.financial_health_history import FinancialHealthHistory
from app.models.transaction import Transaction
from app.models.budget import Budget
from app.models.goal import Goal


class FinancialHealthRepository:
    """Repository handling all financial health queries and history persistence."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_user_transactions(self, user_id: UUID) -> List[Transaction]:
        stmt = select(Transaction).where(
            and_(
                Transaction.user_id == user_id,
                Transaction.is_deleted == False,
            )
        ).order_by(Transaction.transaction_date.desc())
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def get_user_budgets(self, user_id: UUID) -> List[Budget]:
        stmt = select(Budget).where(Budget.user_id == user_id)
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def get_user_goals(self, user_id: UUID) -> List[Goal]:
        stmt = select(Goal).where(Goal.user_id == user_id)
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def save_history(self, history: FinancialHealthHistory) -> FinancialHealthHistory:
        self.db.add(history)
        await self.db.commit()
        await self.db.refresh(history)
        return history

    async def get_history(self, user_id: UUID, limit: int = 12) -> List[FinancialHealthHistory]:
        stmt = (
            select(FinancialHealthHistory)
            .where(FinancialHealthHistory.user_id == user_id)
            .order_by(FinancialHealthHistory.calculated_at.desc())
            .limit(limit)
        )
        result = await self.db.execute(stmt)
        return list(result.scalars().all())
