from sqlalchemy.orm import Session
from typing import List, Any, Optional
from app.repositories.recommendation import RecommendationRepository
from app.schemas.recommendation import RecommendationCreate, RecommendationUpdate
from app.models.recommendation import Recommendation
from app.core.exceptions import EntityNotFoundError, BusinessRuleError
from app.core.logging import logger

class RecommendationService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = RecommendationRepository(db)

    def list_recommendations(self, user_id: Any) -> List[Recommendation]:
        """Fetch all savings advice items configured for a user."""
        return self.repo.get_by_user(user_id)

    def list_unread_recommendations(self, user_id: Any) -> List[Recommendation]:
        """Fetch unread recommendations for notifications check."""
        return self.repo.get_unread_by_user(user_id)

    def get_recommendation(self, rec_id: Any, user_id: Any) -> Recommendation:
        """Fetch a specific advice record, verifying authorization."""
        rec = self.repo.get(rec_id)
        if not rec or rec.user_id != user_id:
            raise EntityNotFoundError("Recommendation advice not found.")
        return rec

    def create_recommendation(self, user_id: Any, data: RecommendationCreate) -> Recommendation:
        """Record a newly generated ML recommendation advice."""
        try:
            rec = Recommendation(
                user_id=user_id,
                title=data.title.strip(),
                description=data.description.strip(),
                priority=data.priority,
                recommendation_type=data.recommendation_type.strip(),
                is_read=data.is_read
            )
            created = self.repo.create(rec)
            self.db.commit()
            logger.info(f"Recorded recommendation advice ID {created.id} for user {user_id}")
            return created
        except Exception as e:
            self.db.rollback()
            logger.error(f"Failed to record recommendation: {str(e)}")
            raise BusinessRuleError("Failed to record recommendation entry.")

    def mark_as_read(self, rec_id: Any, user_id: Any) -> Recommendation:
        """Mark a recommendation notice as read."""
        rec = self.get_recommendation(rec_id, user_id)
        try:
            rec.is_read = True
            updated = self.repo.update(rec)
            self.db.commit()
            logger.info(f"Marked recommendation ID {rec_id} as read.")
            return updated
        except Exception as e:
            self.db.rollback()
            logger.error(f"Failed to update read state: {str(e)}")
            raise BusinessRuleError("Failed to update recommendation notice.")

    def delete_recommendation(self, rec_id: Any, user_id: Any) -> None:
        """Remove a recommendation advice notice."""
        rec = self.get_recommendation(rec_id, user_id)
        try:
            self.repo.remove(rec.id)
            self.db.commit()
            logger.info(f"Deleted recommendation advice ID {rec_id}")
        except Exception as e:
            self.db.rollback()
            logger.error(f"Failed to delete recommendation ID {rec_id}: {str(e)}")
            raise BusinessRuleError("Failed to delete recommendation notice.")
