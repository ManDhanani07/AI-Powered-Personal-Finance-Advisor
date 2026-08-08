"""
Database Migration Utility for Financial Health Score table updates.
"""

import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from app.core.config import settings


async def run_migration():
    engine = create_async_engine(settings.DATABASE_URL)
    async with engine.begin() as conn:
        print("Migrating financial_health_histories table schema...")
        await conn.execute(text("ALTER TABLE financial_health_histories ADD COLUMN IF NOT EXISTS grade VARCHAR(10) DEFAULT 'B' NOT NULL;"))
        await conn.execute(text("ALTER TABLE financial_health_histories ADD COLUMN IF NOT EXISTS goal_score NUMERIC(5, 2) DEFAULT 0.00 NOT NULL;"))
        await conn.execute(text("ALTER TABLE financial_health_histories ADD COLUMN IF NOT EXISTS emergency_score NUMERIC(5, 2) DEFAULT 0.00 NOT NULL;"))
        await conn.execute(text("ALTER TABLE financial_health_histories ADD COLUMN IF NOT EXISTS debt_score NUMERIC(5, 2) DEFAULT 0.00 NOT NULL;"))
        await conn.execute(text("ALTER TABLE financial_health_histories ADD COLUMN IF NOT EXISTS breakdown JSON;"))
        await conn.execute(text("ALTER TABLE financial_health_histories ADD COLUMN IF NOT EXISTS recommendations JSON;"))
        print("Schema migration completed successfully!")
    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(run_migration())
