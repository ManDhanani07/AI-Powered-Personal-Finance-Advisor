from sqlalchemy.orm import Session
from typing import List, Any, Optional
from app.repositories.financial_health import FinancialHealthRepository
from app.schemas.financial_health import FinancialHealthCreate, FinancialHealthUpdate
from app.models.financial_health import FinancialHealth
from app.core.exceptions import EntityNotFoundError, BusinessRuleError
from app.core.logging import logger

class FinancialHealthService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = FinancialHealthRepository(db)

    def list_health_history(self, user_id: Any) -> List[FinancialHealth]:
        """Fetch user financial health diagnosis history."""
        return self.repo.get_by_user(user_id)

    def get_latest_health(self, user_id: Any) -> FinancialHealth:
        """Fetch the most recent scorecard computed for a user."""
        latest = self.repo.get_latest_by_user(user_id)
        if not latest:
            raise EntityNotFoundError("No financial health scorecards recorded yet.")
        return latest

    def create_health_scorecard(self, user_id: Any, data: FinancialHealthCreate) -> FinancialHealth:
        """Record a calculated diagnostic health scorecard."""
        try:
            scorecard = FinancialHealth(
                user_id=user_id,
                health_score=data.health_score,
                savings_score=data.savings_score,
                budget_score=data.budget_score,
                investment_score=data.investment_score,
                debt_score=data.debt_score,
                overall_status=data.overall_status.strip()
            )
            created = self.repo.create(scorecard)
            self.db.commit()
            logger.info(f"Recorded health scorecard ID {created.id} (overall score: {created.health_score}) for user {user_id}")
            return created
        except Exception as e:
            self.db.rollback()
            logger.error(f"Failed to record health scorecard: {str(e)}")
            raise BusinessRuleError("Failed to record financial health scorecard.")

    def delete_health_scorecard(self, scorecard_id: Any, user_id: Any) -> None:
        """Remove a historical health scorecard entry."""
        card = self.repo.get(scorecard_id)
        if not card or card.user_id != user_id:
            raise EntityNotFoundError("Health scorecard record not found.")

        try:
            self.repo.remove(card.id)
            self.db.commit()
            logger.info(f"Deleted health scorecard ID {scorecard_id}")
        except Exception as e:
            self.db.rollback()
            logger.error(f"Failed to delete scorecard ID {scorecard_id}: {str(e)}")
            raise BusinessRuleError("Failed to delete health scorecard entry.")
