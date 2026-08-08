"""
User Repository handling Database operations for User entity.
"""

from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User
from app.repositories.base import BaseRepository
from app.schemas.base import PaginatedResponse


class UserRepository(BaseRepository[User]):
    def __init__(self, db: AsyncSession):
        super().__init__(User, db)

    async def get_by_email(self, email: str) -> Optional[User]:
        """Retrieve user by unique email address."""
        query = select(User).where(User.email == email.strip().lower())
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def exists_by_email(self, email: str) -> bool:
        """Check if a user with given email already exists."""
        user = await self.get_by_email(email)
        return user is not None

    async def get_active_users(self, page: int = 1, page_size: int = 20) -> PaginatedResponse[User]:
        """Fetch active verified users with pagination."""
        return await self.get_all(
            page=page,
            page_size=page_size,
            filters={"is_active": True, "is_verified": True},
            sort_by="created_at",
            sort_order="desc",
        )
