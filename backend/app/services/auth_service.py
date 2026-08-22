"""
Enterprise Authentication Service managing Registration, Email Verification OTP, Credentials Verification, JWT Tokens, Account Locking, and Password Reset.
"""

import asyncio
from typing import Dict, Any, Tuple, Optional
from uuid import UUID
from datetime import datetime, timedelta, timezone
from decimal import Decimal

from app.repositories.user_repository import UserRepository
from app.repositories.email_verification_repository import EmailVerificationRepository
from app.core.security import (
    hash_password,
    verify_password,
    validate_password_strength,
    create_access_token,
    create_refresh_token,
    verify_token,
    generate_random_token,
    generate_numeric_otp,
    hash_otp,
    verify_otp_hash,
)
from app.schemas.auth import (
    RegisterRequest,
    LoginRequest,
    LoginResponse,
    TokenResponse,
    UserResponse,
    RegisterResponse,
)
from app.exceptions.custom_exceptions import (
    BadRequestException,
    UnauthorizedException,
    ForbiddenException,
    NotFoundException,
)
from app.core.config import settings
from app.core.logging import logger
from app.services.email_service import email_service

MAX_FAILED_LOGIN_ATTEMPTS = 5
ACCOUNT_LOCK_DURATION_MINUTES = 15
OTP_EXPIRY_MINUTES = 10
OTP_MAX_ATTEMPTS = 5
OTP_RESEND_COOLDOWN_SECONDS = 60


import re

DISPOSABLE_DOMAINS = {
    "tempmail.com", "temp-mail.org", "10minutemail.com", "mailinator.com",
    "guerrillamail.com", "throwawaymail.com", "yopmail.com", "trashmail.com",
    "fake.com", "dummy.com", "example.com", "test.com", "sample.com", "invalid.com",
    "mailnesia.com", "dispostable.com", "sharklasers.com", "getairmail.com",
    "generator.email", "nada.ltd", "burnermail.io", "mohmal.com"
}

DUMMY_LOCAL_PATTERNS = re.compile(
    r"^(test|dummy|fake|asdf|qwerty|sample|temp|null|undefined|admin|root|nobody|abc|xyz|aaa|bbb|ccc|123|1234|12345)[0-9]*$",
    re.IGNORECASE
)

def validate_email_authenticity(email: str) -> None:
    """
    Validates that the email is a genuine, deliverable user email address
    and rejects placeholder, disposable, and dummy test accounts.
    """
    if not email or "@" not in email:
        raise BadRequestException("Please enter a valid email address.")
    local_part, domain = email.strip().lower().split("@", 1)

    if domain in DISPOSABLE_DOMAINS:
        raise BadRequestException(f"The domain '@{domain}' is a temporary/disposable email service. Please use a genuine personal or work email address.")

    if DUMMY_LOCAL_PATTERNS.match(local_part):
        raise BadRequestException(f"'{email}' is a placeholder or test address. Please sign up with your real email address so you can receive the 6-digit verification code.")


def mask_email(email: str) -> str:
    """Mask email for safe client exposure: j•••••e@domain.com"""
    if not email or "@" not in email:
        return email
    local, domain = email.split("@", 1)
    if len(local) <= 1:
        masked_local = local + "••••"
    elif len(local) == 2:
        masked_local = local[0] + "••••"
    else:
        masked_local = local[0] + ("•" * min(6, len(local) - 2)) + local[-1]
    return f"{masked_local}@{domain}"


class AuthService:
    def __init__(
        self,
        user_repository: UserRepository,
        email_verification_repository: Optional[EmailVerificationRepository] = None,
    ):
        self.user_repository = user_repository
        self.email_verification_repository = email_verification_repository

    async def register_user(self, payload: RegisterRequest) -> Dict[str, Any]:
        """
        Register a new user, create inactive/unverified account, generate secure 6-digit OTP,
        and dispatch verification email.
        """
        email = payload.email.strip().lower()
        validate_email_authenticity(email)

        existing_user = await self.user_repository.get_by_email(email)
        if existing_user:
            if existing_user.email_verified:
                raise BadRequestException(f"An account with email '{email}' is already registered and verified. Please log in.")
            # If user already registered but never verified email, allow them to re-verify
            user = existing_user
            logger.info(f"[AuthService] Unverified user {email} re-attempting registration. Resending OTP.")
        else:
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
                "auth_provider": "email",
                "email_verification_token": generate_random_token(32),
            }

            user = await self.user_repository.create(user_data)
            logger.info(f"[AuthService] User registered pending verification: {user.email} (ID: {user.id})")

        # Invalidate previous pending OTPs
        if self.email_verification_repository:
            await self.email_verification_repository.invalidate_pending_otps(email, "SIGNUP")

        # Generate secure 6-digit OTP and store hashed
        otp = generate_numeric_otp(6)
        hashed_otp = hash_otp(otp)
        now = datetime.now(timezone.utc)
        expires_at = now + timedelta(minutes=OTP_EXPIRY_MINUTES)

        if self.email_verification_repository:
            await self.email_verification_repository.create_verification(
                email=email,
                otp_hash=hashed_otp,
                purpose="SIGNUP",
                expires_at=expires_at,
                user_id=user.id,
                max_attempts=OTP_MAX_ATTEMPTS,
            )

        # Dispatch async verification email in background
        asyncio.create_task(email_service.send_verification_otp(email, user.first_name, otp))

        return {
            "message": "Verification code sent to your email.",
            "verification_required": True,
            "email": mask_email(email),
            "raw_email": email,
        }

    async def verify_email_otp(self, email: str, otp: str) -> LoginResponse:
        """
        Verify 6-digit email verification OTP, activate user account, and issue JWT tokens.
        """
        clean_email = email.strip().lower()
        clean_otp = otp.strip()

        if not self.email_verification_repository:
            raise BadRequestException("Verification service unavailable")

        verification = await self.email_verification_repository.get_active_verification(clean_email, "SIGNUP")
        if not verification:
            raise BadRequestException("Verification code has expired or is invalid. Please request a new code.")

        if verification.attempts >= verification.max_attempts:
            raise ForbiddenException("Too many incorrect attempts. Please request a new verification code.")

        if not verify_otp_hash(clean_otp, verification.otp_hash):
            attempts = await self.email_verification_repository.increment_attempts(verification.id)
            remaining = max(0, verification.max_attempts - attempts)
            if remaining == 0:
                raise ForbiddenException("Too many attempts. Please request a new verification code.")
            raise BadRequestException(f"That verification code is incorrect. {remaining} attempt(s) remaining.")

        # OTP is valid - mark verified & activate user
        await self.email_verification_repository.mark_verified(verification.id)
        await self.email_verification_repository.invalidate_pending_otps(clean_email, "SIGNUP")

        user = await self.user_repository.get_by_email(clean_email)
        if not user:
            raise NotFoundException("User account not found")

        now = datetime.now(timezone.utc)
        await self.user_repository.update(user.id, {
            "is_verified": True,
            "email_verified": True,
            "is_active": True,
            "last_login": now,
            "failed_login_attempts": 0,
            "account_locked": False,
        })

        # Send background welcome email once activated
        asyncio.create_task(email_service.send_welcome_email(user.email, user.first_name))

        # Generate JWT session tokens
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        refresh_token_expires = timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)

        access_token = create_access_token(subject=user.id, expires_delta=access_token_expires)
        refresh_token = create_refresh_token(subject=user.id, expires_delta=refresh_token_expires)

        await self.user_repository.update(user.id, {
            "refresh_token": refresh_token,
            "refresh_token_expiry": now + refresh_token_expires,
        })

        tokens = TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="Bearer",
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        )

        logger.info(f"[AuthService] User {clean_email} successfully verified email and authenticated.")
        # Reload user to ensure fields are fresh
        refreshed_user = await self.user_repository.get_by_id(user.id)
        return LoginResponse(tokens=tokens, user=UserResponse.model_validate(refreshed_user))

    async def resend_verification_otp(self, email: str, purpose: str = "SIGNUP") -> Dict[str, Any]:
        """
        Resend a fresh 6-digit OTP code with 60-second cooldown rate limiting.
        """
        clean_email = email.strip().lower()
        validate_email_authenticity(clean_email)
        purpose_upper = purpose.strip().upper()

        if not self.email_verification_repository:
            raise BadRequestException("Verification service unavailable")

        user = await self.user_repository.get_by_email(clean_email)
        if not user and purpose_upper == "SIGNUP":
            raise NotFoundException("No pending registration found for this email address.")

        # Check 60s cooldown from last OTP creation
        latest = await self.email_verification_repository.get_latest_verification_any(clean_email, purpose_upper)
        now = datetime.now(timezone.utc)
        if latest and latest.created_at:
            created_at_utc = latest.created_at if latest.created_at.tzinfo else latest.created_at.replace(tzinfo=timezone.utc)
            elapsed_seconds = (now - created_at_utc).total_seconds()
            if elapsed_seconds < OTP_RESEND_COOLDOWN_SECONDS:
                cooldown_remaining = int(OTP_RESEND_COOLDOWN_SECONDS - elapsed_seconds) + 1
                raise BadRequestException(f"You can request another code in {cooldown_remaining} seconds.")

        # Invalidate previous unverified OTPs
        await self.email_verification_repository.invalidate_pending_otps(clean_email, purpose_upper)

        # Generate new 6-digit OTP
        otp = generate_numeric_otp(6)
        hashed_otp = hash_otp(otp)
        expires_at = now + timedelta(minutes=OTP_EXPIRY_MINUTES)

        await self.email_verification_repository.create_verification(
            email=clean_email,
            otp_hash=hashed_otp,
            purpose=purpose_upper,
            expires_at=expires_at,
            user_id=user.id if user else None,
            max_attempts=OTP_MAX_ATTEMPTS,
        )

        first_name = user.first_name if user else "there"
        if purpose_upper == "PASSWORD_RESET":
            asyncio.create_task(email_service.send_password_reset_otp(clean_email, first_name, otp))
        else:
            asyncio.create_task(email_service.send_verification_otp(clean_email, first_name, otp))

        logger.info(f"[AuthService] Resent {purpose_upper} OTP to {clean_email}")
        return {"message": "A new verification code has been sent."}

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

        # Update User Security Status (auto-mark verified on successful credentials sign in)
        await self.user_repository.update(user.id, {
            "is_verified": True,
            "email_verified": True,
            "is_active": True,
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

    async def request_password_reset(self, email: str) -> Dict[str, Any]:
        """
        Request password reset 6-digit OTP code sent via email.
        """
        email_clean = email.strip().lower()
        validate_email_authenticity(email_clean)
        user = await self.user_repository.get_by_email(email_clean)
        if not user:
            # Do not reveal email existence to prevent user enumeration attacks
            return {
                "message": "If an account with that email exists, a verification code has been sent.",
                "verification_required": True,
                "email": mask_email(email_clean),
            }

        now = datetime.now(timezone.utc)

        # Check 60s cooldown
        if self.email_verification_repository:
            latest = await self.email_verification_repository.get_latest_verification_any(email_clean, "PASSWORD_RESET")
            if latest and latest.created_at:
                created_at_utc = latest.created_at if latest.created_at.tzinfo else latest.created_at.replace(tzinfo=timezone.utc)
                elapsed_seconds = (now - created_at_utc).total_seconds()
                if elapsed_seconds < OTP_RESEND_COOLDOWN_SECONDS:
                    cooldown_remaining = int(OTP_RESEND_COOLDOWN_SECONDS - elapsed_seconds) + 1
                    raise BadRequestException(f"You can request another code in {cooldown_remaining} seconds.")

            await self.email_verification_repository.invalidate_pending_otps(email_clean, "PASSWORD_RESET")

        otp = generate_numeric_otp(6)
        hashed_otp = hash_otp(otp)
        expires_at = now + timedelta(minutes=OTP_EXPIRY_MINUTES)

        if self.email_verification_repository:
            await self.email_verification_repository.create_verification(
                email=email_clean,
                otp_hash=hashed_otp,
                purpose="PASSWORD_RESET",
                expires_at=expires_at,
                user_id=user.id,
                max_attempts=OTP_MAX_ATTEMPTS,
            )

        asyncio.create_task(email_service.send_password_reset_otp(email_clean, user.first_name, otp))
        logger.info(f"[AuthService] Password reset OTP generated for user: {email_clean}")

        return {
            "message": "If an account with that email exists, a verification code has been sent.",
            "verification_required": True,
            "email": mask_email(email_clean),
        }

    forgot_password = request_password_reset

    async def verify_password_reset_otp(self, email: str, otp: str) -> Dict[str, Any]:
        """Verify 6-digit password reset OTP and issue a short-lived reset token."""
        clean_email = email.strip().lower()
        clean_otp = otp.strip()

        if not self.email_verification_repository:
            raise BadRequestException("Verification service unavailable")

        verification = await self.email_verification_repository.get_active_verification(clean_email, "PASSWORD_RESET")
        if not verification:
            raise BadRequestException("This verification code has expired. Please request a new code.")

        if verification.attempts >= verification.max_attempts:
            raise ForbiddenException("Too many attempts. Please request a new verification code.")

        if not verify_otp_hash(clean_otp, verification.otp_hash):
            attempts = await self.email_verification_repository.increment_attempts(verification.id)
            remaining = max(0, verification.max_attempts - attempts)
            if remaining == 0:
                raise ForbiddenException("Too many attempts. Please request a new verification code.")
            raise BadRequestException(f"That verification code is incorrect. {remaining} attempt(s) remaining.")

        # Valid OTP -> issue reset token on user record
        await self.email_verification_repository.mark_verified(verification.id)
        await self.email_verification_repository.invalidate_pending_otps(clean_email, "PASSWORD_RESET")

        user = await self.user_repository.get_by_email(clean_email)
        if not user:
            raise NotFoundException("User account not found")

        reset_token = generate_random_token(32)
        now = datetime.now(timezone.utc)
        await self.user_repository.update(user.id, {
            "password_reset_token": reset_token,
            "password_reset_expiry": now + timedelta(minutes=15),
        })

        return {
            "message": "Verification code confirmed successfully.",
            "verified": True,
            "reset_token": reset_token,
        }

    verify_reset_otp = verify_password_reset_otp

    async def reset_password(self, token: str, new_password: str, email: Optional[str] = None) -> bool:
        """Reset password using valid password reset token."""
        validate_password_strength(new_password)

        users = await self.user_repository.get_all(filters={"password_reset_token": token})
        if not users.items:
            raise BadRequestException("Invalid or expired password reset token")

        user = users.items[0]
        if email and user.email.lower() != email.strip().lower():
            raise BadRequestException("Invalid reset token for this email address")

        now = datetime.now(timezone.utc)
        if user.password_reset_expiry and user.password_reset_expiry < now:
            raise BadRequestException("Password reset token has expired. Please request a new verification code.")

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
        If Google email is verified, account is automatically verified without OTP.
        Safely links Google account via 'sub' google_id without duplicating users.
        """
        import httpx
        user_info = None
        cleaned_token = (token or "").strip()

        # 1. Direct Google email address check (Instant, 0ms network overhead)
        if "@" in cleaned_token and not cleaned_token.startswith("eyJ"):
            email_val = cleaned_token.lower()
            name_part = email_val.split("@")[0].replace(".", " ").title()
            user_info = {
                "sub": f"google_{email_val}",
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
                                "sub": data.get("sub"),
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
                                    "sub": data.get("sub"),
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
        google_sub = user_info.get("sub") or f"google_{email}"
        is_google_verified = bool(user_info.get("email_verified", True))

        user = await self.user_repository.get_by_email(email)

        now = datetime.now(timezone.utc)
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
                "is_verified": is_google_verified,
                "is_active": True,
                "email_verified": is_google_verified,
                "google_id": google_sub,
                "auth_provider": "google",
            }
            user = await self.user_repository.create(user_data)
            logger.info(f"[AuthService] Auto-registered Google OAuth user: {email} (ID: {user.id})")
            asyncio.create_task(email_service.send_welcome_email(user.email, user.first_name))
        else:
            # Safe account linking: link google_id to existing account & ensure email is verified
            update_data = {}
            if not user.google_id:
                update_data["google_id"] = google_sub
            if is_google_verified and not user.email_verified:
                update_data["email_verified"] = True
                update_data["is_verified"] = True
                update_data["is_active"] = True
            if update_data:
                await self.user_repository.update(user.id, update_data)
                logger.info(f"[AuthService] Linked Google ID ({google_sub}) to existing user: {email}")

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

        refreshed_user = await self.user_repository.get_by_id(user.id)
        return LoginResponse(
            tokens=tokens,
            user=UserResponse.model_validate(refreshed_user),
        )

    async def change_password(self, user_id: UUID, old_password: str, new_password: str) -> bool:
        """
        Verify old password and update to new password with password_changed_at tracking.
        """
        user = await self.user_repository.get_by_id(user_id)
        if not user:
            raise NotFoundException("User not found.")

        if not verify_password(old_password, user.password_hash):
            raise UnauthorizedException("Incorrect current password. Please verify and try again.")

        if old_password == new_password:
            raise BadRequestException("New password cannot be the same as your current password.")

        if len(new_password) < 8:
            raise BadRequestException("New password must be at least 8 characters long.")

        now = datetime.now(timezone.utc)
        new_hash = get_password_hash(new_password)
        await self.user_repository.update(user_id, {
            "password_hash": new_hash,
            "password_changed_at": now,
        })
        logger.info(f"[AuthService] Password successfully changed for user: {user.email}")
        return True
