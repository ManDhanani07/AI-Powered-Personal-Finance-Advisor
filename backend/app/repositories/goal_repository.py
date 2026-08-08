"""
Goal Repository handling Database operations for User financial targets.
"""

from typing import List, Optional
from uuid import UUID
from decimal import Decimal
from sqlalchemy import select, and_, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.goal import Goal
from app.repositories.base import BaseRepository
from app.schemas.base import PaginatedResponse
from app.utils.pagination import build_paginated_response


class GoalRepository(BaseRepository[Goal]):
    def __init__(self, db: AsyncSession):
        super().__init__(Goal, db)

    async def get_by_user(
        self,
        user_id: UUID,
        status: Optional[str] = None,
        goal_type: Optional[str] = None,
        priority: Optional[str] = None,
        search: Optional[str] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> PaginatedResponse[Goal]:
        """Fetch filtered financial goals for a user."""
        stmt = select(Goal).where(Goal.user_id == user_id)

        if status and status.upper() != "ALL":
            stmt = stmt.where(Goal.status == status.upper())
        if goal_type and goal_type.upper() != "ALL":
            stmt = stmt.where(Goal.goal_type == goal_type.upper())
        if priority and priority.upper() != "ALL":
            stmt = stmt.where(Goal.priority == priority.upper())
        if search and search.strip():
            q = f"%{search.strip().lower()}%"
            stmt = stmt.where(func.lower(Goal.goal_name).like(q))

        stmt = stmt.order_by(Goal.target_date.asc())

        # Count total
        count_stmt = select(func.count()).select_from(Goal).where(Goal.user_id == user_id)
        if status and status.upper() != "ALL":
            count_stmt = count_stmt.where(Goal.status == status.upper())
        if goal_type and goal_type.upper() != "ALL":
            count_stmt = count_stmt.where(Goal.goal_type == goal_type.upper())
        if priority and priority.upper() != "ALL":
            count_stmt = count_stmt.where(Goal.priority == priority.upper())
        if search and search.strip():
            q = f"%{search.strip().lower()}%"
            count_stmt = count_stmt.where(func.lower(Goal.goal_name).like(q))

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

    async def update_progress(self, goal_id: UUID, amount_delta: Decimal) -> Optional[Goal]:
        """Update current accumulated amount towards goal and check achievement status."""
        goal = await self.get_by_id(goal_id)
        if not goal:
            return None

        new_current = Decimal(str(goal.current_amount)) + Decimal(str(amount_delta))
        new_status = goal.status
        if new_current >= Decimal(str(goal.target_amount)):
            new_status = "ACHIEVED"

        return await self.update(
            goal_id,
            {
                "current_amount": new_current,
                "status": new_status,
            },
        )
