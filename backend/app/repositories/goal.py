from typing import List, Any
from sqlalchemy.orm import Session
from app.repositories.base import BaseRepository
from app.models.goal import Goal, GoalContribution

class GoalRepository(BaseRepository[Goal]):
    def __init__(self, db: Session):
        super().__init__(Goal, db)

    def get_by_user(self, user_id: Any) -> List[Goal]:
        """Fetch all financial goals defined by a user."""
        return self.db.query(Goal).filter(Goal.user_id == user_id).all()

    def get_contributions(self, goal_id: Any) -> List[GoalContribution]:
        """Fetch all historical saving actions for a specific goal."""
        return self.db.query(GoalContribution).filter(GoalContribution.goal_id == goal_id).all()

    def create_contribution(self, contribution: GoalContribution, flush: bool = True) -> GoalContribution:
        """Create a savings contribution in the session without committing."""
        self.db.add(contribution)
        if flush:
            self.db.flush()
            self.db.refresh(contribution)
        return contribution
