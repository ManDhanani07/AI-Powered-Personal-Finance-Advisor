from typing import List, Any
from sqlalchemy.orm import Session
from app.repositories.base import BaseRepository
from app.models.recommendation import Recommendation

class RecommendationRepository(BaseRepository[Recommendation]):
    def __init__(self, db: Session):
        super().__init__(Recommendation, db)

    def get_by_user(self, user_id: Any) -> List[Recommendation]:
        """Fetch all recommendations logged for a user."""
        return self.db.query(Recommendation).filter(Recommendation.user_id == user_id).all()

    def get_unread_by_user(self, user_id: Any) -> List[Recommendation]:
        """Fetch unread recommendations for notifications check."""
        return self.db.query(Recommendation).filter(
            Recommendation.user_id == user_id,
            Recommendation.is_read == False
        ).all()
