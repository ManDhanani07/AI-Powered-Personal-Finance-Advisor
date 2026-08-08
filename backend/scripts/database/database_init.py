"""
Database Initialization Script.
Creates database if missing, generates tables from SQLAlchemy Base metadata, and verifies schema.
"""

import sys
import asyncio
import urllib.parse
from pathlib import Path

# Add backend directory to path
backend_dir = Path(__file__).resolve().parent.parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from app.core.config import settings
from app.core.logging import logger
from app.database.session import Base, engine
import app.models  # Import all models to populate Base.metadata


async def create_database_if_not_exists():
    """Connect to postgres admin DB and create target database if it does not exist."""
    encoded_password = urllib.parse.quote_plus(settings.POSTGRES_PASSWORD)
    admin_db_url = (
        f"postgresql+asyncpg://{settings.POSTGRES_USER}:{encoded_password}"
        f"@{settings.POSTGRES_HOST}:{settings.POSTGRES_PORT}/postgres"
    )
    admin_engine = create_async_engine(admin_db_url, isolation_level="AUTOCOMMIT")

    try:
        async with admin_engine.connect() as conn:
            result = await conn.execute(
                text(f"SELECT 1 FROM pg_database WHERE datname = '{settings.POSTGRES_DB}'")
            )
            exists = result.scalar() is not None

            if not exists:
                logger.info(f"Database '{settings.POSTGRES_DB}' does not exist. Creating database...")
                await conn.execute(text(f'CREATE DATABASE "{settings.POSTGRES_DB}"'))
                logger.info(f"Database '{settings.POSTGRES_DB}' created successfully.")
            else:
                logger.info(f"Database '{settings.POSTGRES_DB}' already exists.")
    except Exception as ex:
        logger.warning(f"Could not check/create database automatically on server: {ex}")
    finally:
        await admin_engine.dispose()


async def initialize_schema():
    """Create all tables in target database using Base.metadata."""
    logger.info("Initializing database tables...")
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Database schema initialized successfully.")

        # Verify created tables
        async with engine.connect() as conn:
            result = await conn.execute(
                text(
                    "SELECT table_name FROM information_schema.tables WHERE table_schema='public'"
                )
            )
            tables = [row[0] for row in result.fetchall()]
            logger.info(f"Verified {len(tables)} tables in database schema: {tables}")
            return True
    except Exception as ex:
        logger.error(f"Failed to initialize database schema: {ex}")
        return False


async def main():
    logger.info("=== Starting Database Initialization ===")
    await create_database_if_not_exists()
    success = await initialize_schema()
    if success:
        logger.info("=== Database Initialization Completed Successfully ===")
    else:
        logger.error("=== Database Initialization Failed ===")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
