from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from app.database.database import get_db
from app.schemas.financial_health import FinancialHealthCreate, FinancialHealthResponse
from app.services.financial_health import FinancialHealthService
from app.api.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/financial-health", tags=["Financial Health"])

@router.get("", response_model=List[FinancialHealthResponse], summary="List financial health scorecards history")
def list_health_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Fetch user scorecard history containing health scores and breakdowns.
    """
    service = FinancialHealthService(db)
    return service.list_health_history(current_user.id)


@router.get("/latest", response_model=FinancialHealthResponse, summary="Get the latest computed health scorecard")
def get_latest_health(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve the most recently recorded diagnostic health scorecard.
    """
    service = FinancialHealthService(db)
    return service.get_latest_health(current_user.id)


@router.post("", response_model=FinancialHealthResponse, status_code=status.HTTP_201_CREATED, summary="Create a health scorecard record")
def create_health_scorecard(
    data: FinancialHealthCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Record a newly computed diagnostic scorecard.
    """
    service = FinancialHealthService(db)
    return service.create_health_scorecard(current_user.id, data)


@router.delete("/{id}", status_code=status.HTTP_200_OK, summary="Delete a scorecard record")
def delete_health_scorecard(
    id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Remove a scorecard diagnostic entry.
    """
    service = FinancialHealthService(db)
    service.delete_health_scorecard(id, current_user.id)
    return {"message": "Financial health scorecard deleted successfully."}
