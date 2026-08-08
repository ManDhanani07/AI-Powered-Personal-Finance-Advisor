"""
Dashboard REST API Endpoints.
All 7 dashboard endpoints return live database calculations.
"""

from typing import Optional
from fastapi import APIRouter, Depends, Query, status

from app.dependencies.auth import get_current_user
from app.dependencies.service import get_dashboard_service
from app.services.dashboard_service import DashboardService
from app.models.user import User
from app.schemas.base import APIResponse
from app.schemas.dashboard import (
    DashboardOverviewResponse,
    DashboardSummaryResponse,
    DashboardChartsResponse,
    DashboardRecentTransactionsResponse,
    DashboardBudgetOverviewResponse,
    DashboardGoalsOverviewResponse,
    DashboardSpendingAnalysisResponse,
    DashboardCompleteResponse,
)

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get(
    "/complete",
    response_model=APIResponse[DashboardCompleteResponse],
    status_code=status.HTTP_200_OK,
    summary="Get complete consolidated dashboard payload in a single fast parallelized query",
)
async def get_complete_dashboard(
    limit: int = Query(10, ge=5, le=50, description="Number of recent transactions"),
    current_user: User = Depends(get_current_user),
    service: DashboardService = Depends(get_dashboard_service),
):
    user_name = " ".join(
        filter(None, [current_user.first_name, current_user.last_name])
    ) or current_user.email.split("@")[0]

    data = await service.get_complete_dashboard(current_user.id, user_name, tx_limit=limit)
    return APIResponse(
        success=True,
        message="Complete dashboard payload retrieved successfully",
        data=DashboardCompleteResponse(**data),
    )



@router.get(
    "/overview",
    response_model=APIResponse[DashboardOverviewResponse],
    status_code=status.HTTP_200_OK,
    summary="Get dashboard overview KPI cards (balance, income, expense, savings, budget, goals)",
)
async def get_dashboard_overview(
    current_user: User = Depends(get_current_user),
    service: DashboardService = Depends(get_dashboard_service),
):
    data = await service.get_overview(current_user.id)
    return APIResponse(
        success=True,
        message="Dashboard overview retrieved successfully",
        data=DashboardOverviewResponse(**data),
    )


@router.get(
    "/summary",
    response_model=APIResponse[DashboardSummaryResponse],
    status_code=status.HTTP_200_OK,
    summary="Get dashboard summary with greeting, date, and key financial figures",
)
async def get_dashboard_summary(
    current_user: User = Depends(get_current_user),
    service: DashboardService = Depends(get_dashboard_service),
):
    # Build user_name from first_name + last_name
    user_name = " ".join(
        filter(None, [current_user.first_name, current_user.last_name])
    ) or current_user.email.split("@")[0]

    data = await service.get_summary(current_user.id, user_name)
    return APIResponse(
        success=True,
        message="Dashboard summary retrieved successfully",
        data=DashboardSummaryResponse(**data),
    )


@router.get(
    "/charts",
    response_model=APIResponse[DashboardChartsResponse],
    status_code=status.HTTP_200_OK,
    summary="Get all chart data: income/expense bar, cash flow area, category pie, budget bar, goal radial, payment pie",
)
async def get_dashboard_charts(
    current_user: User = Depends(get_current_user),
    service: DashboardService = Depends(get_dashboard_service),
):
    data = await service.get_charts(current_user.id)
    return APIResponse(
        success=True,
        message="Dashboard charts data retrieved successfully",
        data=DashboardChartsResponse(**data),
    )


@router.get(
    "/recent-transactions",
    response_model=APIResponse[DashboardRecentTransactionsResponse],
    status_code=status.HTTP_200_OK,
    summary="Get recent transactions for dashboard (10, 20, or 50)",
)
async def get_recent_transactions(
    limit: int = Query(10, ge=5, le=50, description="Number of recent transactions: 10, 20, or 50"),
    current_user: User = Depends(get_current_user),
    service: DashboardService = Depends(get_dashboard_service),
):
    data = await service.get_recent_transactions(current_user.id, limit=limit)
    return APIResponse(
        success=True,
        message="Recent transactions retrieved successfully",
        data=DashboardRecentTransactionsResponse(**data),
    )


@router.get(
    "/budget-overview",
    response_model=APIResponse[DashboardBudgetOverviewResponse],
    status_code=status.HTTP_200_OK,
    summary="Get active budget overview: counts, utilization percentages, and budget items",
)
async def get_budget_overview(
    current_user: User = Depends(get_current_user),
    service: DashboardService = Depends(get_dashboard_service),
):
    data = await service.get_budget_overview(current_user.id)
    return APIResponse(
        success=True,
        message="Budget overview retrieved successfully",
        data=DashboardBudgetOverviewResponse(**data),
    )


@router.get(
    "/goals-overview",
    response_model=APIResponse[DashboardGoalsOverviewResponse],
    status_code=status.HTTP_200_OK,
    summary="Get goals overview: active goals, progress, deadlines, required monthly saving",
)
async def get_goals_overview(
    current_user: User = Depends(get_current_user),
    service: DashboardService = Depends(get_dashboard_service),
):
    data = await service.get_goals_overview(current_user.id)
    return APIResponse(
        success=True,
        message="Goals overview retrieved successfully",
        data=DashboardGoalsOverviewResponse(**data),
    )


@router.get(
    "/spending-analysis",
    response_model=APIResponse[DashboardSpendingAnalysisResponse],
    status_code=status.HTTP_200_OK,
    summary="Get spending analysis: highest/lowest category, avg daily/monthly, largest/smallest transaction",
)
async def get_spending_analysis(
    current_user: User = Depends(get_current_user),
    service: DashboardService = Depends(get_dashboard_service),
):
    data = await service.get_spending_analysis(current_user.id)
    return APIResponse(
        success=True,
        message="Spending analysis retrieved successfully",
        data=DashboardSpendingAnalysisResponse(**data),
    )
