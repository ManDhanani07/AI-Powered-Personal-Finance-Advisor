"""
Security Utilities for Password Hashing, Validation, JWT Generation, and Token Verification using bcrypt and PyJWT.
"""

import re
import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any, Union
from uuid import UUID
import bcrypt
import jwt

from app.core.config import settings
from app.exceptions.custom_exceptions import UnauthorizedException, BadRequestException

SPECIAL_CHARACTERS_REGEX = re.compile(r"[!@#$%^&*()_+\-=\[\]{};':\"\\|,.<>/?]")


def hash_password(password: str) -> str:
    """Generate bcrypt hash for a plain text password."""
    if not password:
        raise BadRequestException("Password cannot be empty")
    # Truncate password bytes to max 72 bytes as per bcrypt specification
    pwd_bytes = password.encode("utf-8")[:72]
    salt = bcrypt.gensalt()
    hashed_bytes = bcrypt.hashpw(pwd_bytes, salt)
    return hashed_bytes.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify plain text password against stored bcrypt hash."""
    if not plain_password or not hashed_password:
        return False
    try:
        pwd_bytes = plain_password.encode("utf-8")[:72]
        hashed_bytes = hashed_password.encode("utf-8")
        return bcrypt.checkpw(pwd_bytes, hashed_bytes)
    except Exception:
        return False


def validate_password_strength(password: str) -> bool:
    """
    Validate password strength:
    - Minimum 8 characters
    - At least one uppercase letter
    - At least one lowercase letter
    - At least one digit
    - At least one special character
    """
    if len(password) < 8:
        raise BadRequestException("Password must be at least 8 characters long")
    if not any(char.isupper() for char in password):
        raise BadRequestException("Password must contain at least one uppercase letter")
    if not any(char.islower() for char in password):
        raise BadRequestException("Password must contain at least one lowercase letter")
    if not any(char.isdigit() for char in password):
        raise BadRequestException("Password must contain at least one number")
    if not SPECIAL_CHARACTERS_REGEX.search(password):
        raise BadRequestException("Password must contain at least one special character (!@#$%^&*)")
    return True


def create_access_token(
    subject: Union[str, UUID],
    expires_delta: Optional[timedelta] = None,
    extra_claims: Optional[Dict[str, Any]] = None,
) -> str:
    """Create signed JWT Access Token with unique JTI claims."""
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode = {
        "sub": str(subject),
        "iat": int(now.timestamp()),
        "exp": int(expire.timestamp()),
        "type": "access",
        "jti": secrets.token_hex(16),
    }
    if extra_claims:
        to_encode.update(extra_claims)

    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def create_refresh_token(
    subject: Union[str, UUID],
    expires_delta: Optional[timedelta] = None,
) -> str:
    """Create signed JWT Refresh Token with unique JTI claims."""
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)

    to_encode = {
        "sub": str(subject),
        "iat": int(now.timestamp()),
        "exp": int(expire.timestamp()),
        "type": "refresh",
        "jti": secrets.token_hex(16),
    }

    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def decode_token(token: str) -> Dict[str, Any]:
    """Decode and verify signature of JWT token using PyJWT."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise UnauthorizedException("Token has expired")
    except jwt.InvalidTokenError as ex:
        raise UnauthorizedException(f"Invalid token: {ex}")


def verify_token(token: str, token_type: str = "access") -> Dict[str, Any]:
    """Decode token and assert matching token type (access or refresh)."""
    payload = decode_token(token)
    if payload.get("type") != token_type:
        raise UnauthorizedException(f"Invalid token type. Expected '{token_type}' token")
    return payload


def generate_random_token(length: int = 32) -> str:
    """Generate secure cryptographically random hex token."""
    return secrets.token_hex(length // 2)


def generate_numeric_otp(length: int = 6) -> str:
    """
    Generate cryptographically secure numeric OTP using secrets module.
    Example: '583214'
    """
    # Generate integer in range [10^(length-1), 10^length - 1]
    min_val = 10 ** (length - 1)
    max_val = (10 ** length) - 1
    # secrets.randbelow is cryptographically secure
    otp_int = min_val + secrets.randbelow(max_val - min_val + 1)
    return str(otp_int)


def hash_otp(otp: str) -> str:
    """
    Hash OTP code using SHA-256 with project SECRET_KEY pepper for secure database storage.
    Never stores raw OTP.
    """
    import hashlib
    if not otp:
        raise BadRequestException("OTP cannot be empty")
    data_to_hash = f"{settings.SECRET_KEY}:{otp.strip()}".encode("utf-8")
    return hashlib.sha256(data_to_hash).hexdigest()


def verify_otp_hash(plain_otp: str, hashed_otp: str) -> bool:
    """
    Constant-time comparison of plain OTP against stored hash to prevent timing attacks.
    """
    import hmac
    if not plain_otp or not hashed_otp:
        return False
    computed_hash = hash_otp(plain_otp)
    return hmac.compare_digest(computed_hash, hashed_otp)
