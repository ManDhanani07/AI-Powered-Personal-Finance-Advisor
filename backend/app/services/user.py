from sqlalchemy.orm import Session
from app.repositories.user import UserRepository
from app.schemas.user import UserUpdate
from app.models.user import User
from app.core.exceptions import BusinessRuleError
from app.core.logging import logger

class UserService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = UserRepository(db)

    def update_profile(self, user: User, update_data: UserUpdate) -> User:
        """Update user profile configuration variables and commit the database transaction safely."""
        try:
            data = update_data.model_dump(exclude_unset=True)
            for key, value in data.items():
                if value is not None:
                    setattr(user, key, value)
            updated_user = self.repo.update(user)
            self.db.commit()
            logger.info(f"Updated profile values for user ID: {user.id}")
            return updated_user
        except Exception as e:
            self.db.rollback()
            logger.error(f"Profile update failed for user ID {user.id}: {str(e)}")
            raise BusinessRuleError("Failed to update user profile.")

    def deactivate_user(self, user: User) -> None:
        """Deactivate user account (soft delete) and commit transaction."""
        try:
            user.is_active = False
            self.repo.update(user)
            self.db.commit()
            logger.info(f"Deactivated user account for user ID: {user.id}")
        except Exception as e:
            self.db.rollback()
            logger.error(f"Account deactivation failed for user ID {user.id}: {str(e)}")
            raise BusinessRuleError("Failed to deactivate account.")
