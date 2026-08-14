"""
Ensure Admin User Credentials in Database.
Creates or updates the primary admin user account idempotently using backend .env settings.
"""

import sys
import asyncio
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from sqlalchemy import select
from app.core.config import settings
from app.core.logging import logger
from app.database.session import AsyncSessionLocal
from app.models.user import User

async def ensure_admin():
    admin_email = settings.ADMIN_EMAIL
    admin_hash = settings.ADMIN_PASSWORD_HASH

    logger.info(f"=== Ensuring Admin Account: {admin_email} ===")
    async with AsyncSessionLocal() as session:
        try:
            res = await session.execute(select(User).where(User.email == admin_email))
            user = res.scalar_one_or_none()

            if not user:
                user = User(
                    first_name="System",
                    last_name="Admin",
                    email=admin_email,
                    password_hash=admin_hash,
                    role="ADMIN",
                    is_active=True,
                    is_verified=True,
                    email_verified=True,
                    currency="INR",
                    country="India",
                )
                session.add(user)
                logger.info(f"Admin account created successfully for {admin_email}.")
            else:
                user.role = "ADMIN"
                user.password_hash = admin_hash
                user.is_active = True
                user.is_verified = True
                user.email_verified = True
                logger.info(f"Admin account updated for {admin_email}.")

            await session.commit()
            return True
        except Exception as ex:
            await session.rollback()
            logger.error(f"Failed to ensure admin account: {ex}")
            return False

if __name__ == "__main__":
    asyncio.run(ensure_admin())
