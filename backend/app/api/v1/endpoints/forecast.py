"""
AI Financial Forecasting REST API Endpoints.
Meta Prophet Time-Series Predictions for Expense, Income, Savings, and Account Balance.
"""

from typing import Optional
from fastapi import APIRouter, Depends, Query, status

from app.dependencies.auth import get_current_user
from app.dependencies.service import get_forecast_service
from app.services.forecast_service import ForecastService
from app.models.user import User
from app.schemas.base import APIResponse
from app.schemas.forecast import ForecastResponse, ForecastSummaryResponse

router = APIRouter(prefix="/forecast", tags=["AI Forecasting"])


@router.get(
    "/monthly-expense",
    response_model=APIResponse[ForecastResponse],
    status_code=status.HTTP_200_OK,
    summary="Get Meta Prophet forecast for monthly expenses",
)
async def get_monthly_expense_forecast(
    period_days: int = Query(90, ge=30, le=365, description="Forecast period horizon in days: 30, 90, 180, or 365"),
    current_user: User = Depends(get_current_user),
    service: ForecastService = Depends(get_forecast_service),
):
    data = await service.get_monthly_expense_forecast(current_user.id, period_days=period_days)
    return APIResponse(
        success=True,
        message="Monthly expense forecast generated successfully",
        data=ForecastResponse(**data),
    )


@router.get(
    "/monthly-income",
    response_model=APIResponse[ForecastResponse],
    status_code=status.HTTP_200_OK,
    summary="Get Meta Prophet forecast for monthly income",
)
async def get_monthly_income_forecast(
    period_days: int = Query(90, ge=30, le=365, description="Forecast period horizon in days: 30, 90, 180, or 365"),
    current_user: User = Depends(get_current_user),
    service: ForecastService = Depends(get_forecast_service),
):
    data = await service.get_monthly_income_forecast(current_user.id, period_days=period_days)
    return APIResponse(
        success=True,
        message="Monthly income forecast generated successfully",
        data=ForecastResponse(**data),
    )


@router.get(
    "/savings",
    response_model=APIResponse[ForecastResponse],
    status_code=status.HTTP_200_OK,
    summary="Get Meta Prophet forecast for net monthly savings",
)
async def get_savings_forecast(
    period_days: int = Query(90, ge=30, le=365, description="Forecast period horizon in days: 30, 90, 180, or 365"),
    current_user: User = Depends(get_current_user),
    service: ForecastService = Depends(get_forecast_service),
):
    data = await service.get_savings_forecast(current_user.id, period_days=period_days)
    return APIResponse(
        success=True,
        message="Savings forecast generated successfully",
        data=ForecastResponse(**data),
    )


@router.get(
    "/account-balance",
    response_model=APIResponse[ForecastResponse],
    status_code=status.HTTP_200_OK,
    summary="Get Meta Prophet forecast for account balance trajectory",
)
async def get_account_balance_forecast(
    period_days: int = Query(90, ge=30, le=365, description="Forecast period horizon in days: 30, 90, 180, or 365"),
    current_user: User = Depends(get_current_user),
    service: ForecastService = Depends(get_forecast_service),
):
    data = await service.get_account_balance_forecast(current_user.id, period_days=period_days)
    return APIResponse(
        success=True,
        message="Account balance forecast generated successfully",
        data=ForecastResponse(**data),
    )


@router.get(
    "/summary",
    response_model=APIResponse[ForecastSummaryResponse],
    status_code=status.HTTP_200_OK,
    summary="Get consolidated forecast summary (Expense, Income, Savings, Balance, Insights, Smart Warnings)",
)
async def get_forecast_summary(
    period_days: int = Query(90, ge=30, le=365, description="Forecast period horizon in days: 30, 90, 180, or 365"),
    current_user: User = Depends(get_current_user),
    service: ForecastService = Depends(get_forecast_service),
):
    data = await service.get_forecast_summary(current_user.id, period_days=period_days)
    return APIResponse(
        success=True,
        message="Forecast summary payload retrieved successfully",
        data=ForecastSummaryResponse(**data),
    )
