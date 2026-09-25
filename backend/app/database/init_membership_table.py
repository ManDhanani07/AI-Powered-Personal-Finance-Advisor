"""
Automatic Database Schema Migration for User Membership Tier.
"""

import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from app.core.config import settings
from app.core.logging import logger


async def ensure_membership_schema():
    """Ensure users table has membership_tier column."""
    try:
        engine = create_async_engine(settings.DATABASE_URL)
        async with engine.begin() as conn:
            logger.info("Verifying PostgreSQL users table membership_tier schema...")
            await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS membership_tier VARCHAR(50) DEFAULT 'starter' NOT NULL;"))
            logger.info("PostgreSQL users table membership_tier schema verified and updated successfully!")
        await engine.dispose()
    except Exception as e:
        logger.error(f"Failed to migrate membership_tier on users table: {e}")


if __name__ == "__main__":
    asyncio.run(ensure_membership_schema())
