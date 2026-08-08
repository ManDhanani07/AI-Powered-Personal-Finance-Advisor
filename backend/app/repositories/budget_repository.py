"""
Budget Repository handling Database operations for Budget allocations.
"""

from typing import List, Optional
from uuid import UUID
from datetime import date
from decimal import Decimal
from sqlalchemy import select, and_, func
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.budget import Budget
from app.models.transaction import Transaction
from app.repositories.base import BaseRepository
from app.schemas.base import PaginatedResponse
from app.utils.pagination import build_paginated_response


class BudgetRepository(BaseRepository[Budget]):
    def __init__(self, db: AsyncSession):
        super().__init__(Budget, db)

    async def get_by_user(
        self, user_id: UUID, status: Optional[str] = None, page: int = 1, page_size: int = 20
    ) -> PaginatedResponse[Budget]:
        """Fetch active or status-filtered budgets for a user with category eager loaded."""
        stmt = select(Budget).options(selectinload(Budget.category)).where(Budget.user_id == user_id)
        if status and status.upper() != "ALL":
            stmt = stmt.where(Budget.status == status.upper())

        stmt = stmt.order_by(Budget.start_date.desc())
        
        # Count total
        count_stmt = select(func.count()).select_from(Budget).where(Budget.user_id == user_id)
        if status and status.upper() != "ALL":
            count_stmt = count_stmt.where(Budget.status == status.upper())
        
        total_res = await self.db.execute(count_stmt)
        total_items = total_res.scalar_one()

        offset = (page - 1) * page_size
        stmt = stmt.offset(offset).limit(page_size)

        result = await self.db.execute(stmt)
        items = list(result.scalars().all())

        return build_paginated_response(
            items=items,
            total_items=total_items,
            page=page,
            page_size=page_size,
        )

    async def get_by_id_with_category(self, budget_id: UUID) -> Optional[Budget]:
        """Fetch single budget with category eagerly loaded."""
        stmt = select(Budget).options(selectinload(Budget.category)).where(Budget.id == budget_id)
        res = await self.db.execute(stmt)
        return res.scalar_one_or_none()

    async def get_user_category_budget(
        self, user_id: UUID, category_id: UUID, target_date: Optional[date] = None
    ) -> Optional[Budget]:
        """Fetch active budget for specific user and category active on date."""
        check_date = target_date or date.today()
        query = select(Budget).where(
            and_(
                Budget.user_id == user_id,
                Budget.category_id == category_id,
                Budget.start_date <= check_date,
                Budget.end_date >= check_date,
                Budget.status == "ACTIVE",
            )
        )
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def calculate_spent_from_transactions(
        self, user_id: UUID, category_id: Optional[UUID], start_date: date, end_date: date
    ) -> Decimal:
        """Calculate total expense sum from transactions for a budget date range."""
        query = select(func.coalesce(func.sum(Transaction.amount), 0.00)).where(
            and_(
                Transaction.user_id == user_id,
                Transaction.transaction_type == "EXPENSE",
                Transaction.transaction_date >= start_date,
                Transaction.transaction_date <= end_date,
            )
        )
        if category_id:
            query = query.where(Transaction.category_id == category_id)

        result = await self.db.execute(query)
        return Decimal(str(result.scalar_one()))

    async def update_spent_amount(self, budget_id: UUID, amount_delta: Decimal) -> Optional[Budget]:
        """Adjust budget spent amount and update remaining balance & status."""
        budget = await self.get_by_id(budget_id)
        if not budget:
            return None

        new_spent = Decimal(str(budget.spent_amount)) + Decimal(str(amount_delta))
        new_remaining = Decimal(str(budget.budget_amount)) - new_spent

        new_status = "ACTIVE"
        if new_remaining < 0:
            new_status = "EXCEEDED"
        elif new_remaining == 0:
            new_status = "COMPLETED"

        return await self.update(
            budget_id,
            {
                "spent_amount": new_spent,
                "remaining_amount": new_remaining,
                "status": new_status,
            },
        )
