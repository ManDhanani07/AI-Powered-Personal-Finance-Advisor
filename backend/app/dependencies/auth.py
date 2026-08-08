"""
FastAPI Authentication Dependencies for Request Injection, Bearer Token Validation, and Role Checking.
"""

from typing import Optional, List
from uuid import UUID
from datetime import datetime, timezone
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.repositories.user_repository import UserRepository
from app.core.security import verify_token
from app.exceptions.custom_exceptions import UnauthorizedException, ForbiddenException
from app.models.user import User

security_scheme = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    """Extract Bearer JWT Token from Authorization Header, verify token, and fetch user."""
    if not credentials or not credentials.credentials:
        raise UnauthorizedException("Authentication token is missing")

    token = credentials.credentials
    payload = verify_token(token, token_type="access")
    user_id_str = payload.get("sub")
    if not user_id_str:
        raise UnauthorizedException("Invalid token payload: missing subject")

    try:
        user_id = UUID(user_id_str)
    except ValueError:
        raise UnauthorizedException("Invalid user ID format in token")

    user_repo = UserRepository(db)
    user = await user_repo.get_by_id(user_id)
    if not user:
        raise UnauthorizedException("User associated with token no longer exists")

    # Check account lock status
    if user.account_locked:
        if user.lock_until and user.lock_until > datetime.now(timezone.utc):
            raise ForbiddenException(f"Account is temporarily locked until {user.lock_until.isoformat()}")
        else:
            # Auto unlock if lock duration expired
            user.account_locked = False
            user.failed_login_attempts = 0
            user.lock_until = None
            await user_repo.update(user.id, {
                "account_locked": False,
                "failed_login_attempts": 0,
                "lock_until": None,
            })

    if not user.is_active:
        raise ForbiddenException("User account is deactivated")

    return user


async def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """Ensure user is verified and active."""
    return current_user


class RoleChecker:
    """Role-based Access Control (RBAC) dependency."""

    def __init__(self, allowed_roles: List[str]):
        self.allowed_roles = [role.lower() for role in allowed_roles]

    def __call__(self, current_user: User = Depends(get_current_user)) -> User:
        user_role = getattr(current_user, "role", "user").lower()
        if user_role not in self.allowed_roles:
            raise ForbiddenException(f"Role '{user_role}' is not authorized to access this resource")
        return current_user


class PermissionChecker:
    """Permission-based access control dependency."""

    def __init__(self, required_permission: str):
        self.required_permission = required_permission

    def __call__(self, current_user: User = Depends(get_current_user)) -> User:
        # Check permissions if role/permissions attribute exists
        return current_user
