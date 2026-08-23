"""
Ensure Admin User Credentials in Database.
Creates or updates the primary admin user account idempotently with password 'Fintech1234'.
"""

import sys
import asyncio
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from sqlalchemy import select
from app.core.config import settings
from app.core.security import hash_password
from app.core.logging import logger
from app.database.session import AsyncSessionLocal
from app.models.user import User

ADMIN_EMAIL = "fintech0707@gmail.com"
ADMIN_RAW_PASS = "Fintech1234"

async def ensure_admin():
    admin_email = ADMIN_EMAIL
    admin_hash = hash_password(ADMIN_RAW_PASS)

    logger.info(f"=== Ensuring Admin Account: {admin_email} with password '{ADMIN_RAW_PASS}' ===")
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
                    failed_login_attempts=0,
                    account_locked=False,
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
                user.failed_login_attempts = 0
                user.account_locked = False
                logger.info(f"Admin account updated for {admin_email} (Role: ADMIN, Verified: True, Active: True).")

            await session.commit()
            print(f"SUCCESS: Admin account {admin_email} ensured with role ADMIN and password '{ADMIN_RAW_PASS}'")
            return True
        except Exception as ex:
            await session.rollback()
            logger.error(f"Failed to ensure admin account: {ex}")
            print(f"ERROR: {ex}")
            return False

if __name__ == "__main__":
    asyncio.run(ensure_admin())
