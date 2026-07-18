from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from app.database.database import get_db
from app.schemas.prediction import PredictionCreate, PredictionResponse
from app.services.prediction import PredictionService
from app.api.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/predictions", tags=["Predictions"])

@router.get("/transaction/{transaction_id}", response_model=List[PredictionResponse], summary="List predictions for a transaction")
def list_predictions(
    transaction_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Fetch all category predictions computed for a specific transaction UUID.
    """
    service = PredictionService(db)
    return service.list_predictions_by_transaction(transaction_id, current_user.id)


@router.post("", response_model=PredictionResponse, status_code=status.HTTP_201_CREATED, summary="Create a prediction record")
def create_prediction(
    data: PredictionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Log an ML categorization inference scorecard against a transaction.
    """
    service = PredictionService(db)
    return service.create_prediction(current_user.id, data)


@router.delete("/{id}", status_code=status.HTTP_200_OK, summary="Delete a prediction record")
def delete_prediction(
    id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Remove a classification prediction record.
    """
    service = PredictionService(db)
    service.delete_prediction(id, current_user.id)
    return {"message": "Prediction record deleted successfully."}
