"""
Notification Repository for Database Operations on Notifications Table.
"""

from typing import Optional, List, Dict, Any
from uuid import UUID
from datetime import datetime, timedelta
from sqlalchemy import select, func, update, delete, and_, or_, desc
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.notification import Notification
from app.repositories.base import BaseRepository


class NotificationRepository(BaseRepository[Notification]):
    def __init__(self, db: AsyncSession):
        super().__init__(Notification, db)

    async def get_by_id_and_user(self, notification_id: UUID, user_id: UUID) -> Optional[Notification]:
        """Get single notification by ID and User ID."""
        stmt = select(Notification).where(
            Notification.id == notification_id,
            Notification.user_id == user_id
        )
        res = await self.db.execute(stmt)
        return res.scalar_one_or_none()

    async def get_user_notifications(
        self,
        user_id: UUID,
        is_read: Optional[bool] = None,
        priority: Optional[str] = None,
        category: Optional[str] = None,
        related_module: Optional[str] = None,
        search: Optional[str] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> tuple[List[Notification], int]:
        """Fetch paginated notifications with priority, category, module, search, and read status filters."""
        stmt = select(Notification).where(Notification.user_id == user_id)

        if is_read is not None:
            stmt = stmt.where(Notification.is_read == is_read)
        if priority and priority.upper() != "ALL":
            stmt = stmt.where(Notification.priority == priority.upper())
        if category and category.upper() != "ALL":
            stmt = stmt.where(Notification.category == category.upper())
        if related_module and related_module.upper() != "ALL":
            stmt = stmt.where(
                or_(
                    Notification.related_module == related_module.upper(),
                    Notification.category == related_module.upper()
                )
            )
        if search:
            search_pattern = f"%{search.strip()}%"
            stmt = stmt.where(
                or_(
                    Notification.title.ilike(search_pattern),
                    Notification.message.ilike(search_pattern),
                    Notification.notification_type.ilike(search_pattern)
                )
            )

        # Count total matching items
        count_stmt = select(func.count()).select_from(stmt.subquery())
        total_count = (await self.db.execute(count_stmt)).scalar() or 0

        # Apply ordering and pagination
        stmt = stmt.order_by(desc(Notification.created_at))
        offset = (page - 1) * page_size
        stmt = stmt.offset(offset).limit(page_size)

        result = await self.db.execute(stmt)
        items = list(result.scalars().all())

        return items, total_count

    async def get_unread_count(self, user_id: UUID) -> int:
        """Count unread notifications for a user."""
        stmt = select(func.count(Notification.id)).where(
            Notification.user_id == user_id,
            Notification.is_read == False
        )
        res = await self.db.execute(stmt)
        return res.scalar() or 0

    async def get_latest_unread(self, user_id: UUID, limit: int = 5) -> List[Notification]:
        """Fetch latest unread notifications for popover dropdown."""
        stmt = (
            select(Notification)
            .where(Notification.user_id == user_id, Notification.is_read == False)
            .order_by(desc(Notification.created_at))
            .limit(limit)
        )
        res = await self.db.execute(stmt)
        return list(res.scalars().all())

    async def mark_as_read(self, notification_id: UUID, user_id: UUID) -> Optional[Notification]:
        """Mark single notification as read."""
        notif = await self.get_by_id_and_user(notification_id, user_id)
        if not notif:
            return None

        notif.is_read = True
        notif.status = "READ"
        notif.read_at = datetime.utcnow()
        await self.db.commit()
        await self.db.refresh(notif)
        return notif

    async def mark_all_as_read(self, user_id: UUID) -> int:
        """Mark all unread notifications as read for a user."""
        now = datetime.utcnow()
        stmt = (
            update(Notification)
            .where(Notification.user_id == user_id, Notification.is_read == False)
            .values(is_read=True, status="READ", read_at=now)
        )
        result = await self.db.execute(stmt)
        await self.db.commit()
        return result.rowcount

    async def delete_notification(self, notification_id: UUID, user_id: UUID) -> bool:
        """Delete notification by ID for user."""
        stmt = delete(Notification).where(
            Notification.id == notification_id,
            Notification.user_id == user_id
        )
        res = await self.db.execute(stmt)
        await self.db.commit()
        return res.rowcount > 0

    async def exists_recent_type(
        self, user_id: UUID, notification_type: str, within_hours: int = 24
    ) -> bool:
        """Check if a notification of the same type was created recently (deduplication)."""
        since_time = datetime.utcnow() - timedelta(hours=within_hours)
        stmt = select(func.count(Notification.id)).where(
            Notification.user_id == user_id,
            Notification.notification_type == notification_type,
            Notification.created_at >= since_time
        )
        res = await self.db.execute(stmt)
        return (res.scalar() or 0) > 0
