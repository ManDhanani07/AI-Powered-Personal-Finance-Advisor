from typing import List, Any
from sqlalchemy.orm import Session
from datetime import date
from app.repositories.base import BaseRepository
from app.models.budget import Budget

class BudgetRepository(BaseRepository[Budget]):
    def __init__(self, db: Session):
        super().__init__(Budget, db)

    def get_by_user(self, user_id: Any) -> List[Budget]:
        """Fetch all budgets configured by a user."""
        return self.db.query(Budget).filter(Budget.user_id == user_id).all()

    def get_active(self, user_id: Any, query_date: date) -> List[Budget]:
        """Fetch user budgets active on a given date (e.g., today)."""
        return self.db.query(Budget).filter(
            Budget.user_id == user_id,
            Budget.start_date <= query_date,
            Budget.end_date >= query_date
        ).all()
