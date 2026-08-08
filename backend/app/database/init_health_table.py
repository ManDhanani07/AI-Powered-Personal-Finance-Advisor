"""
Automatic Database Schema Migration for Financial Health Histories Table.
"""

import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from app.core.config import settings
from app.core.logging import logger


async def ensure_financial_health_schema():
    """Ensure financial_health_histories table has all required columns."""
    try:
        engine = create_async_engine(settings.DATABASE_URL)
        async with engine.begin() as conn:
            logger.info("Verifying PostgreSQL financial_health_histories table schema...")
            await conn.execute(text("ALTER TABLE financial_health_histories ADD COLUMN IF NOT EXISTS grade VARCHAR(10) DEFAULT 'B' NOT NULL;"))
            await conn.execute(text("ALTER TABLE financial_health_histories ADD COLUMN IF NOT EXISTS goal_score NUMERIC(5, 2) DEFAULT 0.00 NOT NULL;"))
            await conn.execute(text("ALTER TABLE financial_health_histories ADD COLUMN IF NOT EXISTS emergency_score NUMERIC(5, 2) DEFAULT 0.00 NOT NULL;"))
            await conn.execute(text("ALTER TABLE financial_health_histories ADD COLUMN IF NOT EXISTS debt_score NUMERIC(5, 2) DEFAULT 0.00 NOT NULL;"))
            await conn.execute(text("ALTER TABLE financial_health_histories ADD COLUMN IF NOT EXISTS breakdown JSON;"))
            await conn.execute(text("ALTER TABLE financial_health_histories ADD COLUMN IF NOT EXISTS recommendations JSON;"))
            logger.info("PostgreSQL financial_health_histories table schema verified and updated successfully!")
        await engine.dispose()
    except Exception as e:
        logger.error(f"Failed to migrate financial_health_histories table: {e}")


if __name__ == "__main__":
    asyncio.run(ensure_financial_health_schema())
