"""
Savings Goals Management REST API Endpoints.
"""

from typing import Optional, List
from uuid import UUID
from fastapi import APIRouter, Depends, Query, status

from app.dependencies.auth import get_current_user
from app.dependencies.service import get_goal_service
from app.services.goal_service import GoalService
from app.models.user import User
from app.schemas.base import APIResponse, PaginatedResponse
from app.schemas.goal import (
    GoalCreateRequest,
    GoalUpdateRequest,
    GoalDepositRequest,
    GoalResponse,
    GoalSummaryResponse,
    GoalRecommendationResponse,
)

router = APIRouter(prefix="/goals", tags=["Savings Goals"])


@router.get(
    "",
    response_model=APIResponse[PaginatedResponse[GoalResponse]],
    status_code=status.HTTP_200_OK,
    summary="Get paginated list of financial savings goals",
)
async def get_goals(
    status_filter: Optional[str] = Query(None, alias="status", description="IN_PROGRESS, ACHIEVED, PAUSED, ARCHIVED, ALL"),
    goal_type: Optional[str] = Query(None, description="SAVINGS, EMERGENCY_FUND, VACATION, CAR, HOUSE, etc."),
    priority: Optional[str] = Query(None, description="LOW, MEDIUM, HIGH, CRITICAL"),
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    service: GoalService = Depends(get_goal_service),
):
    paginated = await service.get_user_goals(
        user_id=current_user.id,
        status=status_filter,
        goal_type=goal_type,
        priority=priority,
        search=search,
        page=page,
        page_size=page_size,
    )

    items_data = [GoalResponse.model_validate(g) for g in paginated.items]
    paginated.items = items_data

    return APIResponse(
        success=True,
        message="Savings goals retrieved successfully",
        data=paginated,
    )


@router.get(
    "/summary",
    response_model=APIResponse[GoalSummaryResponse],
    status_code=status.HTTP_200_OK,
    summary="Get savings goals overall summary metrics",
)
async def get_goal_summary(
    current_user: User = Depends(get_current_user),
    service: GoalService = Depends(get_goal_service),
):
    summary_data = await service.get_goal_summary(current_user.id)
    return APIResponse(
        success=True,
        message="Goal summary retrieved successfully",
        data=GoalSummaryResponse(**summary_data),
    )


@router.get(
    "/recommendations",
    response_model=APIResponse[List[GoalRecommendationResponse]],
    status_code=status.HTTP_200_OK,
    summary="Get AI-driven smart goal recommendations and warnings",
)
async def get_goal_recommendations(
    current_user: User = Depends(get_current_user),
    service: GoalService = Depends(get_goal_service),
):
    recs = await service.get_goal_recommendations(current_user.id)
    rec_responses = [GoalRecommendationResponse(**r) for r in recs]
    return APIResponse(
        success=True,
        message="Goal recommendations retrieved successfully",
        data=rec_responses,
    )


@router.get(
    "/{goal_id}",
    response_model=APIResponse[GoalResponse],
    status_code=status.HTTP_200_OK,
    summary="Get single goal details by ID",
)
async def get_goal_by_id(
    goal_id: UUID,
    current_user: User = Depends(get_current_user),
    service: GoalService = Depends(get_goal_service),
):
    g = await service.get_goal_by_id(goal_id, current_user.id)
    return APIResponse(
        success=True,
        message="Goal details retrieved successfully",
        data=GoalResponse.model_validate(g),
    )


@router.post(
    "",
    response_model=APIResponse[GoalResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Create a new savings goal",
)
async def create_goal(
    payload: GoalCreateRequest,
    current_user: User = Depends(get_current_user),
    service: GoalService = Depends(get_goal_service),
):
    data = payload.model_dump()
    created = await service.create_goal(current_user.id, data)
    return APIResponse(
        success=True,
        message="Savings goal created successfully",
        data=GoalResponse.model_validate(created),
    )


@router.put(
    "/{goal_id}",
    response_model=APIResponse[GoalResponse],
    status_code=status.HTTP_200_OK,
    summary="Update existing goal details",
)
async def update_goal(
    goal_id: UUID,
    payload: GoalUpdateRequest,
    current_user: User = Depends(get_current_user),
    service: GoalService = Depends(get_goal_service),
):
    update_data = payload.model_dump(exclude_unset=True)
    updated = await service.update_goal(goal_id, current_user.id, update_data)
    return APIResponse(
        success=True,
        message="Savings goal updated successfully",
        data=GoalResponse.model_validate(updated),
    )


@router.patch(
    "/{goal_id}/status",
    response_model=APIResponse[GoalResponse],
    status_code=status.HTTP_200_OK,
    summary="Update goal status (PAUSED, IN_PROGRESS, ACHIEVED, ARCHIVED)",
)
async def update_goal_status(
    goal_id: UUID,
    status_value: str = Query(..., alias="status", description="PAUSED, IN_PROGRESS, ACHIEVED, ARCHIVED"),
    current_user: User = Depends(get_current_user),
    service: GoalService = Depends(get_goal_service),
):
    updated = await service.update_goal(goal_id, current_user.id, {"status": status_value.upper()})
    return APIResponse(
        success=True,
        message=f"Goal status changed to {status_value.upper()}",
        data=GoalResponse.model_validate(updated),
    )


@router.post(
    "/{goal_id}/deposit",
    response_model=APIResponse[GoalResponse],
    status_code=status.HTTP_200_OK,
    summary="Deposit funds into Goal Vault and deduct from monthly cash surplus",
)
async def deposit_to_goal(
    goal_id: UUID,
    payload: GoalDepositRequest,
    current_user: User = Depends(get_current_user),
    service: GoalService = Depends(get_goal_service),
):
    updated = await service.deposit_funds(
        goal_id=goal_id,
        user_id=current_user.id,
        amount=payload.amount,
        notes=payload.notes,
    )
    return APIResponse(
        success=True,
        message=f"Successfully deposited ₹{payload.amount:,.2f} into Goal Vault. Money deducted from monthly surplus.",
        data=GoalResponse.model_validate(updated),
    )


@router.delete(
    "/{goal_id}",
    response_model=APIResponse[dict],
    status_code=status.HTTP_200_OK,
    summary="Delete goal",
)
async def delete_goal(
    goal_id: UUID,
    current_user: User = Depends(get_current_user),
    service: GoalService = Depends(get_goal_service),
):
    await service.delete_goal(goal_id, current_user.id)
    return APIResponse(
        success=True,
        message="Savings goal deleted successfully",
        data={"deleted": True, "id": str(goal_id)},
    )
