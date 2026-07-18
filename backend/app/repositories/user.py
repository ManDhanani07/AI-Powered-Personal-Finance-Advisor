from typing import Optional, Any
from sqlalchemy.orm import Session
from app.repositories.base import BaseRepository
from app.models.user import User

class UserRepository(BaseRepository[User]):
    def __init__(self, db: Session):
        super().__init__(User, db)

    def get_by_email(self, email: str) -> Optional[User]:
        """Fetch a user by email address."""
        return self.db.query(User).filter(User.email == email.strip().lower()).first()
