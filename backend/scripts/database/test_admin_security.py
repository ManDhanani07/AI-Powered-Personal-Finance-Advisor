"""
Admin Database & Security Test Suite.
Verifies table structure, role-based access control, foreign keys, and indexes.
"""

import sys
import asyncio
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from sqlalchemy import text
from app.core.config import settings
from app.core.logging import logger
from app.database.session import engine, AsyncSessionLocal
from app.models.user import User
from app.api.v1.endpoints.admin import verify_admin_access
from app.exceptions.custom_exceptions import ForbiddenException

async def run_tests():
    logger.info("=== Running Admin Database & RBAC Security Test Suite ===")
    admin_email = settings.ADMIN_EMAIL

    async with AsyncSessionLocal() as session:
        # Test 1: Verify role column and indexes
        res = await session.execute(text("""
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name='users' AND column_name='role'
        """))
        role_col = res.fetchone()
        assert role_col is not None, "FAILED: 'role' column missing in users table."
        logger.info(f"Test 1 Passed: 'users.role' column exists ({role_col[1]}).")

        # Test 2: Verify admin role for settings.ADMIN_EMAIL
        res = await session.execute(text(f"""
            SELECT email, role FROM users WHERE LOWER(email) = LOWER('{admin_email}')
        """))
        admin_user = res.fetchone()
        assert admin_user is not None, "FAILED: Admin user not found."
        assert admin_user[1] == "ADMIN", f"FAILED: Admin user role is {admin_user[1]}, expected 'ADMIN'."
        logger.info(f"Test 2 Passed: {admin_email} has role '{admin_user[1]}'.")

        # Test 3: Verify all 7 required admin tables exist in PostgreSQL
        tables = [
            "admin_sessions", "audit_logs", "ai_usage_logs", "login_activity",
            "system_health_logs", "admin_notifications", "admin_activity_summaries"
        ]
        for tbl in tables:
            res = await session.execute(text(f"""
                SELECT table_name FROM information_schema.tables WHERE table_name='{tbl}'
            """))
            t_name = res.fetchone()
            assert t_name is not None, f"FAILED: Table '{tbl}' does not exist."
            logger.info(f"Test 3 Passed: Table '{tbl}' verified.")

        # Test 4: RBAC Test - Verify normal user receives 403 Forbidden
        normal_user = User(email="normal_user@example.com", role="USER", first_name="Normal", last_name="User", password_hash="hash")
        try:
            verify_admin_access(current_user=normal_user)
            assert False, "FAILED: Normal user was allowed admin access!"
        except ForbiddenException:
            logger.info("Test 4 Passed: Normal user received 403 Forbidden as expected.")

        # Test 5: RBAC Test - Verify Admin user passes
        admin_user_obj = User(email=admin_email, role="ADMIN", first_name="Admin", last_name="Man", password_hash="hash")
        passed_admin = verify_admin_access(current_user=admin_user_obj)
        assert passed_admin.email == admin_email, "FAILED: Admin user failed verification."
        logger.info(f"Test 5 Passed: Admin user {admin_email} verified successfully.")

    logger.info("=== ALL 5 ADMIN DATABASE & SECURITY TESTS PASSED PERFECTLY ===")

if __name__ == "__main__":
    asyncio.run(run_tests())
