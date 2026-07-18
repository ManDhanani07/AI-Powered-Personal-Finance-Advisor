from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.schemas.dashboard import DashboardSummaryResponse
from app.services.dashboard import DashboardService
from app.api.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get(
    "/summary", 
    response_model=DashboardSummaryResponse, 
    summary="Get user consolidated financial summary stats"
)
def get_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Aggregates net worth, monthly income/expense flow, active budget ratios, 
    spending category shares, and savings targets into one unified payload.
    """
    service = DashboardService(db)
    return service.get_summary(current_user.id)
