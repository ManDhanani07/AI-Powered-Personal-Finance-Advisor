"""
Authentication API Integration Verification Test Script.
Tests all 8 /api/v1/auth/* endpoints via HTTPX AsyncClient against FastAPI app and PostgreSQL.
"""

import sys
import asyncio
from datetime import datetime
from pathlib import Path
from httpx import AsyncClient, ASGITransport

# Add backend directory to path
backend_dir = Path(__file__).resolve().parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.main import app
from app.database.session import AsyncSessionLocal
from app.repositories.user_repository import UserRepository
from app.core.logging import logger


async def run_auth_api_tests():
    logger.info("=== Starting Authentication API Integration Tests ===")

    test_email = f"api_user_{int(datetime.utcnow().timestamp())}@fintech.com"
    test_password = "ApiPassword@123"
    new_password = "NewApiPassword@999"

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:

        # 1. Register Endpoint
        logger.info("--- Testing POST /api/v1/auth/register ---")
        reg_payload = {
            "first_name": "API",
            "last_name": "Tester",
            "email": test_email,
            "password": test_password,
            "phone": "+919999988888",
            "monthly_income": 85000.00,
        }
        res_reg = await client.post("/api/v1/auth/register", json=reg_payload)
        logger.info(f"Register Response Code: {res_reg.status_code}")
        assert res_reg.status_code == 201, f"Register failed: {res_reg.text}"
        data_reg = res_reg.json()
        assert data_reg["success"] is True, "Register success flag should be True"
        user_id = data_reg["data"]["user"]["id"]
        logger.info(f"Registered User ID: {user_id}")

        # 2. Login Endpoint
        logger.info("--- Testing POST /api/v1/auth/login ---")
        login_payload = {
            "email": test_email,
            "password": test_password,
            "remember_me": True,
        }
        res_login = await client.post("/api/v1/auth/login", json=login_payload)
        logger.info(f"Login Response Code: {res_login.status_code}")
        assert res_login.status_code == 200, f"Login failed: {res_login.text}"
        data_login = res_login.json()
        assert data_login["success"] is True, "Login success flag should be True"
        
        access_token = data_login["data"]["tokens"]["access_token"]
        refresh_token = data_login["data"]["tokens"]["refresh_token"]

        # 3. GET /me Endpoint
        logger.info("--- Testing GET /api/v1/auth/me ---")
        headers = {"Authorization": f"Bearer {access_token}"}
        res_me = await client.get("/api/v1/auth/me", headers=headers)
        logger.info(f"Get Me Response Code: {res_me.status_code}")
        assert res_me.status_code == 200, f"Get Me failed: {res_me.text}"
        data_me = res_me.json()
        assert data_me["data"]["email"] == test_email, "User email should match"

        # 4. Token Refresh Endpoint
        logger.info("--- Testing POST /api/v1/auth/refresh ---")
        res_ref = await client.post("/api/v1/auth/refresh", json={"refresh_token": refresh_token})
        logger.info(f"Refresh Response Code: {res_ref.status_code}")
        assert res_ref.status_code == 200, f"Refresh failed: {res_ref.text}"
        data_ref = res_ref.json()
        new_access_token = data_ref["data"]["access_token"]
        new_refresh_token = data_ref["data"]["refresh_token"]
        assert new_access_token != access_token, "Refreshed access token should be new"

        # 5. Change Password Endpoint
        logger.info("--- Testing POST /api/v1/auth/change-password ---")
        headers_new = {"Authorization": f"Bearer {new_access_token}"}
        change_payload = {
            "old_password": test_password,
            "new_password": new_password,
        }
        res_change = await client.post("/api/v1/auth/change-password", json=change_payload, headers=headers_new)
        logger.info(f"Change Password Response Code: {res_change.status_code}")
        assert res_change.status_code == 200, f"Change password failed: {res_change.text}"

        # 6. Forgot Password Endpoint
        logger.info("--- Testing POST /api/v1/auth/forgot-password ---")
        res_forgot = await client.post("/api/v1/auth/forgot-password", json={"email": test_email})
        logger.info(f"Forgot Password Response Code: {res_forgot.status_code}")
        assert res_forgot.status_code == 200, f"Forgot password failed: {res_forgot.text}"
        reset_tok = res_forgot.json()["data"]["reset_token"]

        # 7. Reset Password Endpoint
        logger.info("--- Testing POST /api/v1/auth/reset-password ---")
        res_reset = await client.post(
            "/api/v1/auth/reset-password", json={"token": reset_tok, "new_password": "FinalResetPassword@123"}
        )
        logger.info(f"Reset Password Response Code: {res_reset.status_code}")
        assert res_reset.status_code == 200, f"Reset password failed: {res_reset.text}"

        # 8. Logout Endpoint
        logger.info("--- Testing POST /api/v1/auth/logout ---")
        res_logout = await client.post("/api/v1/auth/logout", headers=headers_new)
        logger.info(f"Logout Response Code: {res_logout.status_code}")
        assert res_logout.status_code == 200, f"Logout failed: {res_logout.text}"

    # Cleanup test user from PostgreSQL DB
    async with AsyncSessionLocal() as db:
        user_repo = UserRepository(db)
        user_db = await user_repo.get_by_email(test_email)
        if user_db:
            await user_repo.delete(user_db.id, hard=True)
            logger.info(f"[Cleanup] Deleted test user {user_db.id} successfully.")

    logger.info("=== All 8 Authentication API End-to-End Tests PASSED Successfully ===")


if __name__ == "__main__":
    asyncio.run(run_auth_api_tests())
