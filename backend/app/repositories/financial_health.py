from typing import List, Any, Optional
from sqlalchemy.orm import Session
from app.repositories.base import BaseRepository
from app.models.financial_health import FinancialHealth

class FinancialHealthRepository(BaseRepository[FinancialHealth]):
    def __init__(self, db: Session):
        super().__init__(FinancialHealth, db)

    def get_by_user(self, user_id: Any) -> List[FinancialHealth]:
        """Fetch all scorecard histories for a user."""
        return self.db.query(FinancialHealth).filter(FinancialHealth.user_id == user_id).order_by(FinancialHealth.created_at.desc()).all()

    def get_latest_by_user(self, user_id: Any) -> Optional[FinancialHealth]:
        """Fetch the most recent scorecard computed for a user."""
        return self.db.query(FinancialHealth).filter(
            FinancialHealth.user_id == user_id
        ).order_by(FinancialHealth.created_at.desc()).first()
