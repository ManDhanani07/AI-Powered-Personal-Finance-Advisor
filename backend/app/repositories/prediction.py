from typing import List, Any
from sqlalchemy.orm import Session
from app.repositories.base import BaseRepository
from app.models.prediction import Prediction

class PredictionRepository(BaseRepository[Prediction]):
    def __init__(self, db: Session):
        super().__init__(Prediction, db)

    def get_by_transaction(self, transaction_id: Any) -> List[Prediction]:
        """Fetch all category/metadata predictions for a transaction."""
        return self.db.query(Prediction).filter(Prediction.transaction_id == transaction_id).all()
