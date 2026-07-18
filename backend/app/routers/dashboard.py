from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.schemas.dashboard import DashboardSummaryResponse, DashboardAnalyticsResponse
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
    Consolidates overall income, expense, savings, monthly budget, remaining budget, 
    financial health scores, monthly growth rates, goal progress, and recent transactions.
    """
    service = DashboardService(db)
    return service.get_summary(current_user.id)


@router.get(
    "/analytics",
    response_model=DashboardAnalyticsResponse,
    summary="Get detailed finance analytics and breakdowns"
)
def get_dashboard_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Aggregates net worth, active budget ratios, spending category shares, and detailed savings goals progress.
    """
    service = DashboardService(db)
    return service.get_analytics(current_user.id)
