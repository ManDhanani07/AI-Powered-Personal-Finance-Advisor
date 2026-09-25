"""
Category Management REST API Endpoints.
"""

from typing import Optional, List
from uuid import UUID
from fastapi import APIRouter, Depends, Query, status

from datetime import datetime, date, timedelta, timezone
from sqlalchemy import select, func, and_, or_, desc, text
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.session import get_db
from app.dependencies.auth import get_current_user
from app.dependencies.service import get_category_service
from app.services.category_service import CategoryService
from app.models.user import User
from app.models.transaction import Transaction
from app.models.category import Category
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
    "/breakdown-analytics",
    status_code=status.HTTP_200_OK,
    summary="Get monthly expense category breakdown with historical averages, variance, and anomaly flags",
)
async def get_category_breakdown_analytics(
    month: Optional[int] = Query(None, ge=1, le=12),
    year: Optional[int] = Query(None, ge=2020, le=2050),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    now = datetime.now(timezone.utc)
    target_month = month or now.month
    target_year = year or now.year

    start_date = date(target_year, target_month, 1)
    if target_month == 12:
        end_date = date(target_year + 1, 1, 1) - timedelta(days=1)
    else:
        end_date = date(target_year, target_month + 1, 1) - timedelta(days=1)

    history_start = (datetime(target_year, target_month, 1) - timedelta(days=180)).date()
    history_end = start_date - timedelta(days=1)

    cur_stmt = (
        select(
            Category.id,
            Category.category_name,
            Category.color,
            Category.icon,
            func.sum(Transaction.amount).label("current_amount"),
            func.count(Transaction.id).label("tx_count"),
        )
        .join(Transaction, Transaction.category_id == Category.id)
        .where(
            Transaction.user_id == current_user.id,
            Transaction.transaction_type == "EXPENSE",
            Transaction.transaction_date >= start_date,
            Transaction.transaction_date <= end_date,
            Transaction.is_deleted == False,
        )
        .group_by(Category.id, Category.category_name, Category.color, Category.icon)
        .order_by(desc("current_amount"))
    )
    cur_res = (await db.execute(cur_stmt)).all()

    hist_stmt = (
        select(
            Category.id,
            func.sum(Transaction.amount).label("hist_total"),
            func.count(func.distinct(func.date_trunc('month', Transaction.transaction_date))).label("months_count"),
        )
        .join(Transaction, Transaction.category_id == Category.id)
        .where(
            Transaction.user_id == current_user.id,
            Transaction.transaction_type == "EXPENSE",
            Transaction.transaction_date >= history_start,
            Transaction.transaction_date <= history_end,
            Transaction.is_deleted == False,
        )
        .group_by(Category.id)
    )
    hist_res = (await db.execute(hist_stmt)).all()
    hist_map = {}
    for cat_id, h_tot, m_cnt in hist_res:
        effective_months = max(1, m_cnt or 6)
        hist_map[str(cat_id)] = float(h_tot or 0) / effective_months

    total_current_expense = sum(float(r[4] or 0) for r in cur_res)

    items = []
    for cat_id, name, color, icon, cur_amt, count in cur_res:
        amount = float(cur_amt or 0)
        pct = round((amount / max(1.0, total_current_expense)) * 100.0, 1)
        hist_avg = hist_map.get(str(cat_id), round(amount * 0.85, 2))
        variance_val = round(amount - hist_avg, 2)
        variance_pct = round(((amount - hist_avg) / max(1.0, hist_avg)) * 100.0, 1) if hist_avg > 0 else 0.0

        if variance_pct >= 40.0:
            status_flag = "SPIKE"
        elif variance_pct > 15.0:
            status_flag = "ELEVATED"
        elif variance_pct < -15.0:
            status_flag = "DECREASED"
        else:
            status_flag = "NORMAL"

        items.append({
            "category_id": str(cat_id),
            "category_name": name,
            "color": color or "#6366F1",
            "icon": icon or "Tag",
            "current_amount": amount,
            "historical_monthly_avg": round(hist_avg, 2),
            "variance_amount": variance_val,
            "variance_percentage": variance_pct,
            "status": status_flag,
            "percentage_of_total": pct,
            "transaction_count": count,
        })

    months_stmt = (
        select(
            func.distinct(func.date_trunc('month', Transaction.transaction_date)).label("month_dt")
        )
        .where(
            Transaction.user_id == current_user.id,
            Transaction.is_deleted == False,
        )
        .order_by(desc("month_dt"))
        .limit(12)
    )
    m_rows = (await db.execute(months_stmt)).scalars().all()
    available_months = []
    for m_dt in m_rows:
        if m_dt:
            available_months.append({
                "month": m_dt.month,
                "year": m_dt.year,
                "label": m_dt.strftime("%B %Y"),
            })

    if not available_months:
        available_months.append({
            "month": target_month,
            "year": target_year,
            "label": datetime(target_year, target_month, 1).strftime("%B %Y"),
        })

    return {
        "success": True,
        "message": "Category breakdown analytics retrieved successfully",
        "data": {
            "selected_month": target_month,
            "selected_year": target_year,
            "selected_label": datetime(target_year, target_month, 1).strftime("%B %Y"),
            "total_expense": total_current_expense,
            "categories_count": len(items),
            "items": items,
            "available_months": available_months,
        }
    }


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
    "/rules",
    response_model=APIResponse[List[dict]],
    status_code=status.HTTP_200_OK,
    summary="Get active merchant categorization rules for real-time form detection",
)
async def get_active_categorization_rules(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        res = await db.execute(
            text(
                "SELECT merchant_pattern, category, match_type "
                "FROM merchant_categorization_rules "
                "WHERE is_active = TRUE "
                "ORDER BY LENGTH(merchant_pattern) DESC;"
            )
        )
        rules = [
            {
                "merchant_pattern": row[0],
                "category": row[1],
                "match_type": row[2] or "Pattern",
            }
            for row in res.fetchall()
        ]
    except Exception:
        rules = []

    return APIResponse(
        success=True,
        message="Active categorization rules retrieved successfully",
        data=rules,
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
