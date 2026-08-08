"""
Financial Health Score REST API Endpoints.
"""

from typing import List
from fastapi import APIRouter, Depends, Query, status

from app.dependencies.auth import get_current_user
from app.dependencies.service import get_financial_health_service
from app.models.user import User
from app.schemas.base import APIResponse
from app.schemas.financial_health import (
    FinancialHealthResponse,
    FinancialHealthHistoryItem,
    FinancialHealthBreakdownResponse,
)
from app.services.financial_health_service import FinancialHealthService

router = APIRouter(prefix="/financial-health", tags=["Financial Health Score"])


@router.get(
    "",
    response_model=APIResponse[FinancialHealthResponse],
    status_code=status.HTTP_200_OK,
    summary="Get current financial health score, grade, parameter breakdown & recommendations",
)
async def get_financial_health_score(
    current_user: User = Depends(get_current_user),
    service: FinancialHealthService = Depends(get_financial_health_service),
):
    result = await service.calculate_health_score(current_user.id)
    return APIResponse(
        success=True,
        message="Financial health score calculated successfully",
        data=result,
    )


@router.get(
    "/history",
    response_model=APIResponse[List[FinancialHealthHistoryItem]],
    status_code=status.HTTP_200_OK,
    summary="Get historical financial health score trajectory over time",
)
async def get_financial_health_history(
    limit: int = Query(12, ge=1, le=50, description="Max history records to return"),
    current_user: User = Depends(get_current_user),
    service: FinancialHealthService = Depends(get_financial_health_service),
):
    records = await service.get_health_history(current_user.id, limit)
    return APIResponse(
        success=True,
        message="Financial health history fetched successfully",
        data=records,
    )


@router.get(
    "/breakdown",
    response_model=APIResponse[FinancialHealthBreakdownResponse],
    status_code=status.HTTP_200_OK,
    summary="Get detailed parameter weight distribution and category breakdown",
)
async def get_financial_health_breakdown(
    current_user: User = Depends(get_current_user),
    service: FinancialHealthService = Depends(get_financial_health_service),
):
    breakdown = await service.get_health_breakdown(current_user.id)
    return APIResponse(
        success=True,
        message="Financial health breakdown fetched successfully",
        data=breakdown,
    )
