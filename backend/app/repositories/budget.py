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
        """Fetch user budgets active on a given date (matching month and year)."""
        return self.db.query(Budget).filter(
            Budget.user_id == user_id,
            Budget.month == query_date.month,
            Budget.year == query_date.year
        ).all()
