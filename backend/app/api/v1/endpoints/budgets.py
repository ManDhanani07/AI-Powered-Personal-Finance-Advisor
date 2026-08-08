"""
Budget Management REST API Endpoints.
"""

from typing import Optional, List, Dict, Any
from uuid import UUID
from fastapi import APIRouter, Depends, Query, status

from app.dependencies.auth import get_current_user
from app.dependencies.service import get_budget_service
from app.services.budget_service import BudgetService
from app.models.user import User
from app.schemas.base import APIResponse, PaginatedResponse
from app.schemas.budget import (
    BudgetCreateRequest,
    BudgetUpdateRequest,
    BudgetResponse,
    BudgetSummaryResponse,
    BudgetAlertResponse,
    BudgetReallocateRequest,
    TransactionValidateBudgetRequest,
    TransactionValidateBudgetResponse,
    BudgetIntelligenceResponse,
)

router = APIRouter(prefix="/budgets", tags=["Budgets"])


@router.get(
    "",
    response_model=APIResponse[PaginatedResponse[BudgetResponse]],
    status_code=status.HTTP_200_OK,
    summary="Get paginated list of user budgets",
)
async def get_budgets(
    status_filter: Optional[str] = Query(None, alias="status", description="ACTIVE, EXCEEDED, COMPLETED, ALL"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    service: BudgetService = Depends(get_budget_service),
):
    paginated = await service.get_user_budgets(
        user_id=current_user.id, status=status_filter, page=page, page_size=page_size
    )

    items_data = [BudgetResponse.model_validate(b) for b in paginated.items]
    paginated.items = items_data

    return APIResponse(
        success=True,
        message="Budgets retrieved successfully",
        data=paginated,
    )


@router.get(
    "/summary",
    response_model=APIResponse[BudgetSummaryResponse],
    status_code=status.HTTP_200_OK,
    summary="Get budget summary analytics and utilization metrics",
)
async def get_budget_summary(
    current_user: User = Depends(get_current_user),
    service: BudgetService = Depends(get_budget_service),
):
    summary_data = await service.get_budget_summary(current_user.id)
    return APIResponse(
        success=True,
        message="Budget summary retrieved successfully",
        data=BudgetSummaryResponse(**summary_data),
    )


@router.get(
    "/alerts",
    response_model=APIResponse[List[BudgetAlertResponse]],
    status_code=status.HTTP_200_OK,
    summary="Get automated budget threshold alerts",
)
async def get_budget_alerts(
    current_user: User = Depends(get_current_user),
    service: BudgetService = Depends(get_budget_service),
):
    alerts = await service.get_budget_alerts(current_user.id)
    alert_responses = [BudgetAlertResponse(**a) for a in alerts]
    return APIResponse(
        success=True,
        message="Budget alerts retrieved successfully",
        data=alert_responses,
    )


@router.get(
    "/intelligence",
    response_model=APIResponse[BudgetIntelligenceResponse],
    status_code=status.HTTP_200_OK,
    summary="Get Intelligent Budget Management System analytics & recommendations",
)
async def get_budget_intelligence(
    current_user: User = Depends(get_current_user),
    service: BudgetService = Depends(get_budget_service),
):
    intel = await service.get_budget_intelligence(current_user.id)
    return APIResponse(
        success=True,
        message="Budget intelligence analytics generated successfully",
        data=BudgetIntelligenceResponse(**intel),
    )


@router.post(
    "/reallocate",
    response_model=APIResponse[Dict[str, Any]],
    status_code=status.HTTP_200_OK,
    summary="Reallocate funds from source budget to target budget",
)
async def reallocate_budget(
    payload: BudgetReallocateRequest,
    current_user: User = Depends(get_current_user),
    service: BudgetService = Depends(get_budget_service),
):
    res = await service.reallocate_budget(
        user_id=current_user.id,
        source_budget_id=payload.source_budget_id,
        target_budget_id=payload.target_budget_id,
        amount=payload.amount,
    )
    return APIResponse(
        success=True,
        message=res["message"],
        data=res,
    )


@router.post(
    "/validate-transaction",
    response_model=APIResponse[TransactionValidateBudgetResponse],
    status_code=status.HTTP_200_OK,
    summary="Validate proposed transaction against remaining category budget",
)
async def validate_transaction_budget(
    payload: TransactionValidateBudgetRequest,
    current_user: User = Depends(get_current_user),
    service: BudgetService = Depends(get_budget_service),
):
    res = await service.validate_transaction_budget(
        user_id=current_user.id,
        category_id=payload.category_id,
        amount=payload.amount,
    )
    return APIResponse(
        success=True,
        message=res["message"],
        data=TransactionValidateBudgetResponse(**res),
    )


@router.get(
    "/{budget_id}",
    response_model=APIResponse[BudgetResponse],
    status_code=status.HTTP_200_OK,
    summary="Get single budget details by ID",
)
async def get_budget_by_id(
    budget_id: UUID,
    current_user: User = Depends(get_current_user),
    service: BudgetService = Depends(get_budget_service),
):
    b = await service.get_budget_by_id(budget_id, current_user.id)
    return APIResponse(
        success=True,
        message="Budget details retrieved successfully",
        data=BudgetResponse.model_validate(b),
    )


@router.post(
    "",
    response_model=APIResponse[BudgetResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Create a new budget",
)
async def create_budget(
    payload: BudgetCreateRequest,
    current_user: User = Depends(get_current_user),
    service: BudgetService = Depends(get_budget_service),
):
    data = payload.model_dump()
    created = await service.create_budget(current_user.id, data)
    return APIResponse(
        success=True,
        message="Budget created successfully",
        data=BudgetResponse.model_validate(created),
    )


@router.put(
    "/{budget_id}",
    response_model=APIResponse[BudgetResponse],
    status_code=status.HTTP_200_OK,
    summary="Update existing budget details",
)
async def update_budget(
    budget_id: UUID,
    payload: BudgetUpdateRequest,
    current_user: User = Depends(get_current_user),
    service: BudgetService = Depends(get_budget_service),
):
    update_data = payload.model_dump(exclude_unset=True)
    updated = await service.update_budget(budget_id, current_user.id, update_data)
    return APIResponse(
        success=True,
        message="Budget updated successfully",
        data=BudgetResponse.model_validate(updated),
    )


@router.delete(
    "/{budget_id}",
    response_model=APIResponse[dict],
    status_code=status.HTTP_200_OK,
    summary="Delete budget",
)
async def delete_budget(
    budget_id: UUID,
    current_user: User = Depends(get_current_user),
    service: BudgetService = Depends(get_budget_service),
):
    await service.delete_budget(budget_id, current_user.id)
    return APIResponse(
        success=True,
        message="Budget deleted successfully",
        data={"deleted": True, "id": str(budget_id)},
    )
