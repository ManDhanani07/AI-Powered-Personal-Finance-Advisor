"""
Create Admin Database Tables & Apply Schema Upgrades Idempotently.
"""

import sys
import asyncio
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from sqlalchemy import text
from app.core.logging import logger
from app.database.session import engine, AsyncSessionLocal
from app.models.base import Base
import app.models  # Ensure all models registered with Base metadata

ADMIN_EMAIL = "mandhanani536@gmail.com"

async def init_admin_db():
    logger.info("=== Creating Admin Database Tables & Schema Upgrades ===")
    async with engine.begin() as conn:
        # 1. Add role column to users table if not existing
        await conn.execute(text("""
            DO $$ 
            BEGIN 
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name='users' AND column_name='role'
                ) THEN
                    ALTER TABLE users ADD COLUMN role VARCHAR(50) NOT NULL DEFAULT 'USER';
                    CREATE INDEX idx_users_role ON users(role);
                END IF;
            END $$;
        """))

        # 2. Create missing tables registered under Base
        await conn.run_sync(Base.metadata.create_all)

        # 3. Set mandhanani536@gmail.com role to 'ADMIN'
        await conn.execute(text(f"""
            UPDATE users SET role = 'ADMIN' WHERE LOWER(email) = LOWER('{ADMIN_EMAIL}');
        """))

    logger.info("=== Admin Database Schema Successfully Applied & Verified ===")

if __name__ == "__main__":
    asyncio.run(init_admin_db())
