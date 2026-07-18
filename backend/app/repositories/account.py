from typing import List, Any
from sqlalchemy.orm import Session
from app.repositories.base import BaseRepository
from app.models.account import Account

class AccountRepository(BaseRepository[Account]):
    def __init__(self, db: Session):
        super().__init__(Account, db)

    def get_by_user(self, user_id: Any, include_inactive: bool = False) -> List[Account]:
        """Fetch all accounts belonging to a specific user."""
        query = self.db.query(Account).filter(Account.user_id == user_id)
        if not include_inactive:
            query = query.filter(Account.is_active == True)
        return query.all()
