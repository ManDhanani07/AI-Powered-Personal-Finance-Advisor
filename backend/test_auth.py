"""
Authentication Layer Verification Test Script.
Tests password security, password strength rules, JWT generation/verification, user registration,
authentication flow, account locking policy, token refresh, and password resets against PostgreSQL.
"""

import sys
import asyncio
from datetime import datetime
from pathlib import Path

# Add backend directory to path
backend_dir = Path(__file__).resolve().parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.database.session import AsyncSessionLocal
from app.repositories.user_repository import UserRepository
from app.services.auth_service import AuthService
from app.core.security import (
    hash_password,
    verify_password,
    validate_password_strength,
    create_access_token,
    create_refresh_token,
    verify_token,
)
from app.schemas.auth import RegisterRequest, LoginRequest
from app.exceptions.custom_exceptions import BadRequestException, UnauthorizedException, ForbiddenException
from app.core.logging import logger


async def run_auth_tests():
    logger.info("=== Starting Authentication Layer Verification Tests ===")

    # 1. Test Password Security & Validation Utilities
    logger.info("--- Testing Password Hashing & Password Strength Validation ---")
    pwd_raw = "FinTech@SaaS2026"
    hashed = hash_password(pwd_raw)
    assert verify_password(pwd_raw, hashed), "Password verification failed"
    assert not verify_password("WrongPassword123!", hashed), "Invalid password should fail verification"
    assert validate_password_strength(pwd_raw), "Valid password should pass strength check"

    # Test weak password failure cases
    try:
        validate_password_strength("weak")
        assert False, "Should fail length check"
    except BadRequestException:
        logger.info("Caught weak password (too short).")

    try:
        validate_password_strength("lowercaseonly123!")
        assert False, "Should fail uppercase check"
    except BadRequestException:
        logger.info("Caught password missing uppercase.")

    try:
        validate_password_strength("UPPERCASEONLY123!")
        assert False, "Should fail lowercase check"
    except BadRequestException:
        logger.info("Caught password missing lowercase.")

    try:
        validate_password_strength("NoSpecialChar123")
        assert False, "Should fail special character check"
    except BadRequestException:
        logger.info("Caught password missing special character.")

    # 2. Test JWT Utilities
    logger.info("--- Testing JWT Access and Refresh Token Generation & Verification ---")
    user_id_test = "11111111-2222-3333-4444-555555555555"
    access_tok = create_access_token(subject=user_id_test)
    refresh_tok = create_refresh_token(subject=user_id_test)

    access_payload = verify_token(access_tok, token_type="access")
    assert access_payload["sub"] == user_id_test, "Access token subject mismatch"
    assert access_payload["type"] == "access", "Token type should be access"

    refresh_payload = verify_token(refresh_tok, token_type="refresh")
    assert refresh_payload["sub"] == user_id_test, "Refresh token subject mismatch"
    assert refresh_payload["type"] == "refresh", "Token type should be refresh"
    logger.info("JWT Access and Refresh token generation & verification passed.")

    # 3. Test AuthService against Database
    logger.info("--- Testing AuthService Database Operations ---")
    async with AsyncSessionLocal() as db:
        user_repo = UserRepository(db)
        auth_service = AuthService(user_repo)

        test_email = f"auth_tester_{int(datetime.utcnow().timestamp())}@fintech.com"
        reg_payload = RegisterRequest(
            first_name="Security",
            last_name="Architect",
            email=test_email,
            password="SecurePassword@123",
            phone="+919876543210",
        )

        user_res = await auth_service.register_user(reg_payload)
        logger.info(f"[AuthService] User Registered: {user_res.email} (ID: {user_res.id})")
        assert user_res.email == test_email, "Registered email mismatch"

        # Test Authentication
        login_req = LoginRequest(email=test_email, password="SecurePassword@123", remember_me=True)
        login_res = await auth_service.authenticate_user(login_req)
        logger.info(f"[AuthService] Authenticated User. Issued Access Token: {login_res.tokens.access_token[:25]}...")
        assert login_res.tokens.access_token is not None, "Access token should be returned"
        assert login_res.tokens.refresh_token is not None, "Refresh token should be returned"

        # Test Token Refresh
        refreshed_tokens = await auth_service.refresh_tokens(login_res.tokens.refresh_token)
        logger.info("[AuthService] Tokens Refreshed successfully.")
        assert refreshed_tokens.access_token is not None, "New access token should be generated"

        # Test Account Locking after 5 failed attempts
        logger.info("--- Testing Account Lockout Policy ---")
        wrong_login_req = LoginRequest(email=test_email, password="WrongPassword@123")
        for attempt in range(1, 5):
            try:
                await auth_service.authenticate_user(wrong_login_req)
            except UnauthorizedException as ex:
                logger.info(f"Failed Attempt #{attempt}: {str(ex)}")

        # 5th attempt trigger lock
        try:
            await auth_service.authenticate_user(wrong_login_req)
            assert False, "5th attempt should lock account"
        except ForbiddenException as ex:
            logger.info(f"5th Attempt Lockout Success: {str(ex)}")

        # Test Reset Password
        reset_token = await auth_service.forgot_password(test_email)
        logger.info(f"[AuthService] Generated Reset Token: {reset_token[:15]}...")
        await auth_service.reset_password(reset_token, "NewStrongPassword@999")
        logger.info("[AuthService] Password Reset completed.")

        # Authenticate with new password after unlock
        login_req_new = LoginRequest(email=test_email, password="NewStrongPassword@999")
        login_res_new = await auth_service.authenticate_user(login_req_new)
        logger.info("[AuthService] Authenticated with new password after reset.")

        # Cleanup Test User
        await user_repo.delete(user_res.id, hard=True)
        logger.info(f"[Cleanup] Deleted test user {user_res.id} successfully.")

    logger.info("=== All Authentication Layer Verification Tests PASSED Successfully ===")


if __name__ == "__main__":
    asyncio.run(run_auth_tests())
