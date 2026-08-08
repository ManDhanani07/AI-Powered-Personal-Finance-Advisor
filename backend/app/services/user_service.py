"""
User Service providing business logic for User accounts and profiles.
"""

from typing import Dict, Any, Optional
from uuid import UUID
from decimal import Decimal
from app.repositories.user_repository import UserRepository
from app.services.base import BaseService
from app.exceptions.custom_exceptions import BadRequestException, NotFoundException
from app.utils.validators import is_valid_email


class UserService(BaseService[UserRepository]):
    def __init__(self, user_repository: UserRepository):
        super().__init__(user_repository)
        self.user_repository = user_repository

    async def create_user(self, user_data: Dict[str, Any]):
        """Business validation & user creation."""
        email = user_data.get("email")
        if not email or not is_valid_email(email):
            raise BadRequestException("A valid email address is required")

        # Check duplicate email
        if await self.user_repository.exists_by_email(email):
            raise BadRequestException(f"User with email '{email}' already exists")

        # Validate monthly income
        monthly_income = user_data.get("monthly_income", 0.00)
        if Decimal(str(monthly_income)) < 0:
            raise BadRequestException("Monthly income cannot be negative")

        user_data["email"] = email.strip().lower()
        return await self.user_repository.create(user_data)

    async def get_user_by_email(self, email: str):
        """Retrieve user by email."""
        if not email or not is_valid_email(email):
            raise BadRequestException("Invalid email format")
        user = await self.user_repository.get_by_email(email)
        if not user:
            raise NotFoundException(f"User with email '{email}' not found")
        return user

    async def update_user_profile(self, user_id: UUID, update_data: Dict[str, Any]):
        """Update user profile with validation."""
        user = await self.get_by_id(user_id)

        new_email = update_data.get("email")
        if new_email and new_email.lower() != user.email.lower():
            if not is_valid_email(new_email):
                raise BadRequestException("Invalid email format")
            if await self.user_repository.exists_by_email(new_email):
                raise BadRequestException(f"Email '{new_email}' is already in use")
            update_data["email"] = new_email.strip().lower()

        if "monthly_income" in update_data:
            if Decimal(str(update_data["monthly_income"])) < 0:
                raise BadRequestException("Monthly income cannot be negative")

        return await self.user_repository.update(user_id, update_data)
