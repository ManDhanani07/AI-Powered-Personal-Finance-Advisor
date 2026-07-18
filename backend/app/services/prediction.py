from sqlalchemy.orm import Session
from typing import List, Any, Optional
from datetime import datetime, timezone
from app.repositories.prediction import PredictionRepository
from app.repositories.transaction import TransactionRepository
from app.schemas.prediction import PredictionCreate, PredictionUpdate
from app.models.prediction import Prediction
from app.core.exceptions import EntityNotFoundError, BusinessRuleError
from app.core.logging import logger

class PredictionService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = PredictionRepository(db)
        self.tx_repo = TransactionRepository(db)

    def list_predictions_by_transaction(self, transaction_id: Any, user_id: Any) -> List[Prediction]:
        """Fetch predictions generated for a specific transaction."""
        tx = self.tx_repo.get(transaction_id)
        if not tx or tx.user_id != user_id:
            raise EntityNotFoundError("Transaction not found.")
        return self.repo.get_by_transaction(transaction_id)

    def create_prediction(self, user_id: Any, data: PredictionCreate) -> Prediction:
        """Log a transaction classification prediction."""
        tx = self.tx_repo.get(data.transaction_id)
        if not tx or tx.user_id != user_id:
            raise EntityNotFoundError("Transaction not found.")

        try:
            pred = Prediction(
                transaction_id=data.transaction_id,
                predicted_category=data.predicted_category.strip(),
                confidence_score=data.confidence_score,
                model_version=data.model_version.strip(),
                prediction_time=data.prediction_time if data.prediction_time else datetime.now(timezone.utc)
            )
            created = self.repo.create(pred)
            self.db.commit()
            logger.info(f"Recorded prediction ID {created.id} for transaction {created.transaction_id}")
            return created
        except Exception as e:
            self.db.rollback()
            logger.error(f"Failed to record prediction: {str(e)}")
            raise BusinessRuleError("Failed to record prediction entry.")

    def delete_prediction(self, prediction_id: Any, user_id: Any) -> None:
        """Remove a prediction record from history."""
        pred = self.repo.get(prediction_id)
        if not pred or pred.transaction.user_id != user_id:
            raise EntityNotFoundError("Prediction not found.")

        try:
            self.repo.remove(pred.id)
            self.db.commit()
            logger.info(f"Deleted prediction ID {prediction_id}")
        except Exception as e:
            self.db.rollback()
            logger.error(f"Failed to delete prediction ID {prediction_id}: {str(e)}")
            raise BusinessRuleError("Failed to delete prediction record.")
