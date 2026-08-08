"""
Automatic Database Table Schema Migration for Notifications Table.
"""

import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from app.core.config import settings
from app.core.logging import logger
from app.models.base import Base
from app.models.notification import Notification  # noqa: F401


async def ensure_notification_schema():
    """Ensure notifications table and columns exist in PostgreSQL database."""
    try:
        engine = create_async_engine(settings.DATABASE_URL)
        async with engine.begin() as conn:
            logger.info("Verifying PostgreSQL notifications table schema...")
            await conn.run_sync(Base.metadata.create_all)
            
            # ALTER TABLE migrations for new columns
            await conn.execute(text("ALTER TABLE notifications ADD COLUMN IF NOT EXISTS type VARCHAR(100) DEFAULT 'INFO' NOT NULL;"))
            await conn.execute(text("ALTER TABLE notifications ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'UNREAD' NOT NULL;"))
            await conn.execute(text("ALTER TABLE notifications ADD COLUMN IF NOT EXISTS related_module VARCHAR(50) DEFAULT 'SYSTEM' NOT NULL;"))
            await conn.execute(text("ALTER TABLE notifications ADD COLUMN IF NOT EXISTS icon VARCHAR(50) DEFAULT 'bell';"))
            await conn.execute(text("ALTER TABLE notifications ADD COLUMN IF NOT EXISTS reference_id VARCHAR(255);"))
            
            logger.info("PostgreSQL notifications table schema verified and migrated successfully!")
        await engine.dispose()
    except Exception as e:
        logger.error(f"Failed to verify notifications table: {e}")


if __name__ == "__main__":
    asyncio.run(ensure_notification_schema())
