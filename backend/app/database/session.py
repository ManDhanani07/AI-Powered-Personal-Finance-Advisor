"""
SQLAlchemy 2.x Async Engine, Session Factory, and Database Health Checks.
"""

from typing import AsyncGenerator
from sqlalchemy import text
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    AsyncEngine,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase
from app.core.config import settings
from app.core.logging import logger


class Base(DeclarativeBase):
    """Base Declarative Class for all SQLAlchemy models."""
    pass


# Create Async Engine
engine: AsyncEngine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG and settings.is_development,
    pool_size=settings.DB_POOL_SIZE,
    max_overflow=settings.DB_MAX_OVERFLOW,
    pool_recycle=settings.DB_POOL_RECYCLE,
    pool_pre_ping=settings.DB_POOL_PRE_PING,
)

# Async Session Factory
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
    autocommit=False,
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency Injection for acquiring AsyncSession per request."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception as ex:
            await session.rollback()
            logger.error(f"Database session rollback due to error: {ex}")
            raise
        finally:
            try:
                await session.rollback()
            except Exception:
                pass
            await session.close()



async def check_database_connection() -> bool:
    """Connection Test utility for Health Checks."""
    try:
        async with AsyncSessionLocal() as session:
            result = await session.execute(text("SELECT 1"))
            value = result.scalar()
            return value == 1
    except Exception as ex:
        logger.warning(f"Database health check failed: {ex}")
        return False
