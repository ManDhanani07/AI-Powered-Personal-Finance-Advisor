"""
Category Repository handling Database operations for Category entity.
"""

from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.category import Category
from app.repositories.base import BaseRepository


class CategoryRepository(BaseRepository[Category]):
    def __init__(self, db: AsyncSession):
        super().__init__(Category, db)

    async def get_by_name(self, category_name: str) -> Optional[Category]:
        """Fetch category by exact category name, eager-loading parent."""
        query = (
            select(Category)
            .options(selectinload(Category.parent))
            .where(Category.category_name == category_name.strip())
        )
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def get_by_id(self, id) -> Optional[Category]:
        """Override to eagerly load parent."""
        query = (
            select(Category)
            .options(selectinload(Category.parent))
            .where(Category.id == id)
        )
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def get_default_categories(self) -> List[Category]:
        """Fetch system default pre-seeded categories with parent."""
        query = (
            select(Category)
            .options(selectinload(Category.parent))
            .where(Category.is_default == True)
            .order_by(Category.category_name)
        )
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_by_type(self, category_type: str) -> List[Category]:
        """Fetch categories filtered by type (INCOME, EXPENSE, INVESTMENT) with parent."""
        query = (
            select(Category)
            .options(selectinload(Category.parent))
            .where(Category.category_type == category_type.upper().strip())
            .order_by(Category.category_name)
        )
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_all_with_parent(self, page_size: int = 200) -> List[Category]:
        """Fetch all categories with parent eagerly loaded, ordered by parent then name."""
        query = (
            select(Category)
            .options(selectinload(Category.parent))
            .order_by(Category.category_name)
            .limit(page_size)
        )
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_by_name_or_create(
        self,
        category_name: str,
        category_type: str = "EXPENSE",
        color: Optional[str] = "#6366F1",
        icon: Optional[str] = "tag",
    ) -> Category:
        """Fetch existing category by name or create a new category if it does not exist."""
        cat = await self.get_by_name(category_name)
        if cat:
            return cat

        new_cat = Category(
            category_name=category_name.strip(),
            category_type=category_type.upper().strip(),
            color=color,
            icon=icon,
            is_default=False,
        )
        self.db.add(new_cat)
        await self.db.commit()
        await self.db.refresh(new_cat)
        return new_cat
