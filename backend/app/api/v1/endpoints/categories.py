"""
Category Management REST API Endpoints.
"""

from typing import Optional, List
from uuid import UUID
from fastapi import APIRouter, Depends, Query, status

from app.dependencies.auth import get_current_user
from app.dependencies.service import get_category_service
from app.services.category_service import CategoryService
from app.models.user import User
from app.schemas.base import APIResponse
from app.schemas.category import (
    CategoryCreateRequest,
    CategoryUpdateRequest,
    CategoryResponse,
)

router = APIRouter(prefix="/categories", tags=["Categories"])


@router.get(
    "",
    response_model=APIResponse[List[CategoryResponse]],
    status_code=status.HTTP_200_OK,
    summary="Get categories list with optional category_type filter",
)
async def get_categories(
    category_type: Optional[str] = Query(None, description="INCOME, EXPENSE, INVESTMENT, TRANSFER"),
    current_user: User = Depends(get_current_user),
    service: CategoryService = Depends(get_category_service),
):
    if category_type:
        categories = await service.get_categories_by_type(category_type)
    else:
        categories = await service.get_all_categories()

    response_data = [CategoryResponse.model_validate(cat) for cat in categories]
    return APIResponse(
        success=True,
        message="Categories retrieved successfully",
        data=response_data,
    )


@router.get(
    "/default",
    response_model=APIResponse[List[CategoryResponse]],
    status_code=status.HTTP_200_OK,
    summary="Get system default pre-seeded categories",
)
async def get_default_categories(
    current_user: User = Depends(get_current_user),
    service: CategoryService = Depends(get_category_service),
):
    categories = await service.get_default_categories()
    response_data = [CategoryResponse.model_validate(cat) for cat in categories]
    return APIResponse(
        success=True,
        message="Default categories retrieved successfully",
        data=response_data,
    )


@router.get(
    "/custom",
    response_model=APIResponse[List[CategoryResponse]],
    status_code=status.HTTP_200_OK,
    summary="Get user custom created categories",
)
async def get_custom_categories(
    current_user: User = Depends(get_current_user),
    service: CategoryService = Depends(get_category_service),
):
    categories = await service.get_custom_categories()
    response_data = [CategoryResponse.model_validate(cat) for cat in categories]
    return APIResponse(
        success=True,
        message="Custom categories retrieved successfully",
        data=response_data,
    )


@router.get(
    "/{category_id}",
    response_model=APIResponse[CategoryResponse],
    status_code=status.HTTP_200_OK,
    summary="Get single category details by ID",
)
async def get_category_by_id(
    category_id: UUID,
    current_user: User = Depends(get_current_user),
    service: CategoryService = Depends(get_category_service),
):
    cat = await service.get_category_by_id(category_id)
    if not cat:
        return APIResponse(success=False, message="Category not found", data=None)

    return APIResponse(
        success=True,
        message="Category details retrieved successfully",
        data=CategoryResponse.model_validate(cat),
    )


@router.post(
    "",
    response_model=APIResponse[CategoryResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Create a new category",
)
async def create_category(
    payload: CategoryCreateRequest,
    current_user: User = Depends(get_current_user),
    service: CategoryService = Depends(get_category_service),
):
    data = payload.model_dump()
    created = await service.create_category(data)
    return APIResponse(
        success=True,
        message="Category created successfully",
        data=CategoryResponse.model_validate(created),
    )


@router.put(
    "/{category_id}",
    response_model=APIResponse[CategoryResponse],
    status_code=status.HTTP_200_OK,
    summary="Update category details",
)
async def update_category(
    category_id: UUID,
    payload: CategoryUpdateRequest,
    current_user: User = Depends(get_current_user),
    service: CategoryService = Depends(get_category_service),
):
    update_data = payload.model_dump(exclude_unset=True)
    updated = await service.update_category(category_id, update_data)
    return APIResponse(
        success=True,
        message="Category updated successfully",
        data=CategoryResponse.model_validate(updated),
    )


@router.post(
    "/{category_id}/duplicate",
    response_model=APIResponse[CategoryResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Duplicate an existing category",
)
async def duplicate_category(
    category_id: UUID,
    current_user: User = Depends(get_current_user),
    service: CategoryService = Depends(get_category_service),
):
    duplicated = await service.duplicate_category(category_id)
    return APIResponse(
        success=True,
        message="Category duplicated successfully",
        data=CategoryResponse.model_validate(duplicated),
    )


@router.delete(
    "/{category_id}",
    response_model=APIResponse[dict],
    status_code=status.HTTP_200_OK,
    summary="Delete category",
)
async def delete_category(
    category_id: UUID,
    current_user: User = Depends(get_current_user),
    service: CategoryService = Depends(get_category_service),
):
    await service.delete_category(category_id)
    return APIResponse(
        success=True,
        message="Category deleted successfully",
        data={"deleted": True, "id": str(category_id)},
    )
