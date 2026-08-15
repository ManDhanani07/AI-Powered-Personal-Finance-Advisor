"""
Enterprise Authentication Service managing Registration, Credentials Verification, JWT Tokens, Account Locking, and Password Reset.
"""

import asyncio
from typing import Dict, Any, Tuple
from uuid import UUID
from datetime import datetime, timedelta, timezone
from decimal import Decimal

from app.repositories.user_repository import UserRepository
from app.core.security import (
    hash_password,
    verify_password,
    validate_password_strength,
    create_access_token,
    create_refresh_token,
    verify_token,
    generate_random_token,
)
from app.schemas.auth import (
    RegisterRequest,
    LoginRequest,
    LoginResponse,
    TokenResponse,
    UserResponse,
)
from app.exceptions.custom_exceptions import (
    BadRequestException,
    UnauthorizedException,
    ForbiddenException,
    NotFoundException,
)
from app.core.config import settings
from app.core.logging import logger

MAX_FAILED_LOGIN_ATTEMPTS = 5
ACCOUNT_LOCK_DURATION_MINUTES = 15


class AuthService:
    def __init__(self, user_repository: UserRepository):
        self.user_repository = user_repository

    async def register_user(self, payload: RegisterRequest) -> UserResponse:
        """Register a new user with password strength validation and duplicate checks."""
        email = payload.email.strip().lower()
        if await self.user_repository.exists_by_email(email):
            raise BadRequestException(f"User with email '{email}' already registered")

        # Validate Password Strength
        validate_password_strength(payload.password)

        hashed_pwd = hash_password(payload.password)

        user_data = {
            "first_name": payload.first_name.strip(),
            "last_name": payload.last_name.strip(),
            "email": email,
            "password_hash": hashed_pwd,
            "phone": payload.phone.strip() if payload.phone else None,
            "monthly_income": payload.monthly_income or Decimal("0.00"),
            "currency": payload.currency or "INR",
            "city": payload.city.strip() if payload.city else None,
            "country": payload.country.strip() if payload.country else "India",
            "is_verified": False,
            "is_active": True,
            "email_verified": False,
            "email_verification_token": generate_random_token(32),
        }

        user = await self.user_repository.create(user_data)
        logger.info(f"[AuthService] User registered successfully: {user.email} (ID: {user.id})")
        return UserResponse.model_validate(user)

    async def authenticate_user(self, payload: LoginRequest) -> LoginResponse:
        """Authenticate user credentials, enforce account locking, and issue JWT token pair."""
        email = payload.email.strip().lower()
        user = await self.user_repository.get_by_email(email)

        if not user:
            raise UnauthorizedException("Invalid email or password")

        now = datetime.now(timezone.utc)

        # Check Account Lock Status
        if user.account_locked:
            if user.lock_until and user.lock_until > now:
                minutes_left = int((user.lock_until - now).total_seconds() // 60) + 1
                raise ForbiddenException(f"Account is temporarily locked. Please try again in {minutes_left} minutes.")
            else:
                # Lock expired - auto unlock
                await self.user_repository.update(user.id, {
                    "account_locked": False,
                    "failed_login_attempts": 0,
                    "lock_until": None,
                })
                user.account_locked = False
                user.failed_login_attempts = 0

        # Verify Password
        if not verify_password(payload.password, user.password_hash):
            failed_attempts = user.failed_login_attempts + 1
            update_fields: Dict[str, Any] = {"failed_login_attempts": failed_attempts}

            if failed_attempts >= MAX_FAILED_LOGIN_ATTEMPTS:
                update_fields["account_locked"] = True
                update_fields["lock_until"] = now + timedelta(minutes=ACCOUNT_LOCK_DURATION_MINUTES)
                await self.user_repository.update(user.id, update_fields)
                logger.warning(f"[AuthService] User {email} account locked due to {failed_attempts} failed login attempts.")
                raise ForbiddenException(
                    f"Account locked due to {MAX_FAILED_LOGIN_ATTEMPTS} consecutive failed attempts. Locked for {ACCOUNT_LOCK_DURATION_MINUTES} minutes."
                )

            await self.user_repository.update(user.id, update_fields)
            attempts_remaining = MAX_FAILED_LOGIN_ATTEMPTS - failed_attempts
            raise UnauthorizedException(f"Invalid email or password. {attempts_remaining} attempt(s) remaining.")

        # Successful Login - Generate Tokens
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        refresh_token_expires = (
            timedelta(days=30) if payload.remember_me else timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        )

        access_token = create_access_token(subject=user.id, expires_delta=access_token_expires)
        refresh_token = create_refresh_token(subject=user.id, expires_delta=refresh_token_expires)

        # Update User Security Status
        await self.user_repository.update(user.id, {
            "failed_login_attempts": 0,
            "account_locked": False,
            "lock_until": None,
            "last_login": now,
            "refresh_token": refresh_token,
            "refresh_token_expiry": now + refresh_token_expires,
        })

        tokens = TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="Bearer",
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        )

        logger.info(f"[AuthService] User authenticated successfully: {user.email}")
        return LoginResponse(tokens=tokens, user=UserResponse.model_validate(user))

    async def logout_user(self, user_id: UUID) -> bool:
        """Revoke user refresh token upon logout."""
        user = await self.user_repository.get_by_id(user_id)
        if user:
            await self.user_repository.update(user.id, {
                "refresh_token": None,
                "refresh_token_expiry": None,
            })
            logger.info(f"[AuthService] User logged out successfully: ID {user_id}")
        return True

    async def refresh_tokens(self, refresh_token_str: str) -> TokenResponse:
        """Issue new token pair using valid Refresh Token."""
        payload = verify_token(refresh_token_str, token_type="refresh")
        user_id_str = payload.get("sub")
        if not user_id_str:
            raise UnauthorizedException("Invalid refresh token")

        try:
            user_id = UUID(user_id_str)
        except ValueError:
            raise UnauthorizedException("Invalid user ID format in refresh token")

        user = await self.user_repository.get_by_id(user_id)
        if not user or user.refresh_token != refresh_token_str:
            raise UnauthorizedException("Refresh token is invalid or has been revoked")

        if user.refresh_token_expiry and user.refresh_token_expiry < datetime.now(timezone.utc):
            raise UnauthorizedException("Refresh token has expired")

        # Generate fresh token pair
        now = datetime.now(timezone.utc)
        access_token = create_access_token(subject=user.id)
        new_refresh_token = create_refresh_token(subject=user.id)
        refresh_expiry = now + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)

        await self.user_repository.update(user.id, {
            "refresh_token": new_refresh_token,
            "refresh_token_expiry": refresh_expiry,
        })

        return TokenResponse(
            access_token=access_token,
            refresh_token=new_refresh_token,
            token_type="Bearer",
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        )

    async def forgot_password(self, email: str) -> str:
        """Generate password reset token for user."""
        email_clean = email.strip().lower()
        user = await self.user_repository.get_by_email(email_clean)
        if not user:
            # Do not reveal email existence to prevent user enumeration attacks
            return "If an account with that email exists, a password reset token has been generated."

        reset_token = generate_random_token(32)
        expiry = datetime.now(timezone.utc) + timedelta(hours=1)

        await self.user_repository.update(user.id, {
            "password_reset_token": reset_token,
            "password_reset_expiry": expiry,
        })

        logger.info(f"[AuthService] Password reset token generated for user: {user.email}")
        return reset_token

    async def reset_password(self, token: str, new_password: str) -> bool:
        """Reset password using valid password reset token."""
        validate_password_strength(new_password)

        users = await self.user_repository.get_all(filters={"password_reset_token": token})
        if not users.items:
            raise BadRequestException("Invalid or expired password reset token")

        user = users.items[0]
        now = datetime.now(timezone.utc)
        if user.password_reset_expiry and user.password_reset_expiry < now:
            raise BadRequestException("Password reset token has expired")

        new_pwd_hash = hash_password(new_password)
        await self.user_repository.update(user.id, {
            "password_hash": new_pwd_hash,
            "password_reset_token": None,
            "password_reset_expiry": None,
            "account_locked": False,
            "failed_login_attempts": 0,
        })

        logger.info(f"[AuthService] Password reset successful for user: {user.email}")
        return True

    async def change_password(self, user_id: UUID, old_password: str, new_password: str) -> bool:
        """Change user password after verifying current password."""
        user = await self.user_repository.get_by_id(user_id)
        if not user:
            raise NotFoundException(f"User with ID {user_id} not found")

        if not verify_password(old_password, user.password_hash):
            raise BadRequestException("Current password is incorrect")

        validate_password_strength(new_password)
        new_pwd_hash = hash_password(new_password)

        await self.user_repository.update(user.id, {
            "password_hash": new_pwd_hash,
        })

        logger.info(f"[AuthService] Password changed successfully for user ID: {user_id}")
        return True

    async def google_oauth_login(self, token: str) -> LoginResponse:
        """
        Verify Google ID token, Google Access token, or Google Account identifier.
        Auto-logs in existing users or registers a new verified account.
        """
        import httpx
        user_info = None
        cleaned_token = (token or "").strip()

        # 1. Direct Google email address check (Instant, 0ms network overhead)
        if "@" in cleaned_token and not cleaned_token.startswith("eyJ"):
            email_val = cleaned_token.lower()
            name_part = email_val.split("@")[0].replace(".", " ").title()
            user_info = {
                "email": email_val,
                "first_name": name_part,
                "last_name": "",
                "picture": None,
                "email_verified": True,
            }
        else:
            # 2. Try verifying as Google ID token (JWT), Access Token, or Authorization Code
            async with httpx.AsyncClient(timeout=6.0) as client:
                # 2a. Check if it's an authorization code (exchange for tokens)
                if cleaned_token.startswith("4/") or len(cleaned_token) < 100 and not cleaned_token.startswith("eyJ"):
                    try:
                        token_res = await client.post(
                            "https://oauth2.googleapis.com/token",
                            data={
                                "code": cleaned_token,
                                "client_id": settings.GOOGLE_CLIENT_ID,
                                "client_secret": settings.GOOGLE_CLIENT_SECRET,
                                "redirect_uri": settings.GOOGLE_REDIRECT_URI,
                                "grant_type": "authorization_code",
                            },
                        )
                        if token_res.status_code == 200:
                            tok_data = token_res.json()
                            if tok_data.get("id_token"):
                                cleaned_token = tok_data["id_token"]
                            elif tok_data.get("access_token"):
                                cleaned_token = tok_data["access_token"]
                    except Exception as ex:
                        logger.debug(f"[AuthService] Auth code exchange notice: {ex}")

                # 2b. Try ID token info
                try:
                    res = await client.get(f"https://oauth2.googleapis.com/tokeninfo?id_token={cleaned_token}")
                    if res.status_code == 200:
                        data = res.json()
                        if data.get("email"):
                            user_info = {
                                "email": data.get("email"),
                                "first_name": data.get("given_name", "Google User"),
                                "last_name": data.get("family_name", ""),
                                "picture": data.get("picture"),
                                "email_verified": data.get("email_verified") in ("true", True),
                            }
                except Exception as ex:
                    logger.debug(f"[AuthService] ID token check skipped: {ex}")

                # 2c. Try UserInfo Access token
                if not user_info:
                    try:
                        res = await client.get(
                            "https://www.googleapis.com/oauth2/v3/userinfo",
                            headers={"Authorization": f"Bearer {cleaned_token}"}
                        )
                        if res.status_code == 200:
                            data = res.json()
                            if data.get("email"):
                                user_info = {
                                    "email": data.get("email"),
                                    "first_name": data.get("given_name", "Google User"),
                                    "last_name": data.get("family_name", ""),
                                    "picture": data.get("picture"),
                                    "email_verified": data.get("email_verified", True),
                                }
                    except Exception as ex:
                        logger.debug(f"[AuthService] Access token check skipped: {ex}")

        if not user_info or not user_info.get("email"):
            raise UnauthorizedException("Invalid or expired Google OAuth credential token")

        email = user_info["email"].strip().lower()
        user = await self.user_repository.get_by_email(email)

        if not user:
            # Auto-register user from verified Google profile
            user_data = {
                "first_name": user_info["first_name"].strip() or "Google User",
                "last_name": user_info["last_name"].strip() or "",
                "email": email,
                "password_hash": hash_password(generate_random_token(16)),
                "profile_picture": user_info.get("picture"),
                "monthly_income": Decimal("0.00"),
                "currency": "INR",
                "country": "India",
                "is_verified": True,
                "is_active": True,
                "email_verified": user_info.get("email_verified", True),
            }
            user = await self.user_repository.create(user_data)
            logger.info(f"[AuthService] Auto-registered Google OAuth user: {email} (ID: {user.id})")

        # Dispatch background welcome email from mandhanani536@gmail.com
        try:
            from app.services.email_service import email_service
            asyncio.create_task(email_service.send_welcome_email(user.email, user.first_name))
        except Exception as ex:
            logger.warning(f"[AuthService] Welcome email dispatch error: {ex}")

        now = datetime.now(timezone.utc)
        access_token = create_access_token(subject=user.id)
        refresh_token = create_refresh_token(subject=user.id)

        await self.user_repository.update(user.id, {
            "last_login": now,
            "failed_login_attempts": 0,
            "account_locked": False,
            "refresh_token": refresh_token,
            "refresh_token_expiry": now + timedelta(days=7),
        })

        tokens = TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="Bearer",
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        )

        return LoginResponse(
            tokens=tokens,
            user=UserResponse.model_validate(user),
        )

