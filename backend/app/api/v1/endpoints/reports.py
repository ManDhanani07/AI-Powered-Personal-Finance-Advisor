"""
FastAPI Router for Enterprise Reports & Analytics Endpoints.
"""

from typing import Optional
from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.services.report_service import ReportService
from app.schemas.base import APIResponse

router = APIRouter(prefix="/reports", tags=["Reports & Analytics"])


@router.get("/dashboard-summary")
async def get_reports_dashboard_summary(
    filter_type: str = Query("this_month", alias="filter"),
    custom_start: Optional[str] = Query(None),
    custom_end: Optional[str] = Query(None),
    compare_previous: bool = Query(False),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """GET /api/v1/reports/dashboard-summary - Executive dashboard KPIs and overview analytics."""
    service = ReportService(db)
    data = await service.get_dashboard_summary_report(
        user_id=current_user.id,
        filter_type=filter_type,
        custom_start=custom_start,
        custom_end=custom_end,
        compare_previous=compare_previous,
    )
    return APIResponse(success=True, message="Reports dashboard summary retrieved successfully.", data=data)


@router.get("/monthly")
async def get_monthly_report(
    year: Optional[int] = Query(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """GET /api/v1/reports/monthly - Monthly income, expense, and savings breakdown."""
    service = ReportService(db)
    data = await service.get_monthly_report(user_id=current_user.id, year=year)
    return APIResponse(success=True, message="Monthly report retrieved successfully.", data=data)


@router.get("/yearly")
async def get_yearly_report(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """GET /api/v1/reports/yearly - Yearly historical performance report."""
    service = ReportService(db)
    data = await service.get_yearly_report(user_id=current_user.id)
    return APIResponse(success=True, message="Yearly report retrieved successfully.", data=data)


@router.get("/category-analysis")
async def get_category_analysis_report(
    filter_type: str = Query("this_month", alias="filter"),
    custom_start: Optional[str] = Query(None),
    custom_end: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """GET /api/v1/reports/category-analysis - Category and merchant spending analysis."""
    service = ReportService(db)
    data = await service.get_category_report(
        user_id=current_user.id,
        filter_type=filter_type,
        custom_start=custom_start,
        custom_end=custom_end,
    )
    return APIResponse(success=True, message="Category spending analysis report retrieved successfully.", data=data)


@router.get("/income-expense")
async def get_income_expense_report(
    filter_type: str = Query("this_month", alias="filter"),
    custom_start: Optional[str] = Query(None),
    custom_end: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """GET /api/v1/reports/income-expense - Income vs Expense comparison report."""
    service = ReportService(db)
    data = await service.get_income_expense_report(
        user_id=current_user.id,
        filter_type=filter_type,
        custom_start=custom_start,
        custom_end=custom_end,
    )
    return APIResponse(success=True, message="Income vs Expense report retrieved successfully.", data=data)


@router.get("/savings-analysis")
async def get_savings_analysis_report(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """GET /api/v1/reports/savings-analysis - Savings accumulation and trend report."""
    service = ReportService(db)
    data = await service.get_savings_report(user_id=current_user.id)
    return APIResponse(success=True, message="Savings analysis report retrieved successfully.", data=data)


@router.get("/budget-analysis")
async def get_budget_analysis_report(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """GET /api/v1/reports/budget-analysis - Budget utilization and variance report."""
    service = ReportService(db)
    data = await service.get_budget_report(user_id=current_user.id)
    return APIResponse(success=True, message="Budget performance report retrieved successfully.", data=data)


@router.get("/goal-analysis")
async def get_goal_analysis_report(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """GET /api/v1/reports/goal-analysis - Goals completion and target tracking report."""
    service = ReportService(db)
    data = await service.get_goal_report(user_id=current_user.id)
    return APIResponse(success=True, message="Goal completion report retrieved successfully.", data=data)


@router.get("/financial-health")
async def get_financial_health_report(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """GET /api/v1/reports/financial-health - Financial health score history report."""
    service = ReportService(db)
    data = await service.get_financial_health_report(user_id=current_user.id)
    return APIResponse(success=True, message="Financial health report retrieved successfully.", data=data)


@router.get("/export")
async def export_report_file(
    export_format: str = Query("csv", alias="format"),
    report_type: str = Query("executive", alias="type"),
    filter_type: str = Query("this_month", alias="filter"),
    custom_start: Optional[str] = Query(None),
    custom_end: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """GET /api/v1/reports/export - Download PDF, Excel (.xlsx), or CSV formatted report file."""
    service = ReportService(db)
    file_stream, filename, media_type = await service.export_report_file(
        user_id=current_user.id,
        export_format=export_format.lower(),
        report_type=report_type,
        filter_type=filter_type,
        custom_start=custom_start,
        custom_end=custom_end,
    )
    headers = {"Content-Disposition": f'attachment; filename="{filename}"'}
    return StreamingResponse(file_stream, media_type=media_type, headers=headers)


@router.get("/ai-summary")
@router.post("/ai-summary")
async def get_reports_ai_summary(
    filter_type: str = Query("this_month", alias="filter"),
    custom_start: Optional[str] = Query(None),
    custom_end: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """POST/GET /api/v1/reports/ai-summary - Real data-driven structured AI financial analysis summary."""
    service = ReportService(db)
    data = await service.generate_ai_financial_summary(
        user_id=current_user.id,
        filter_type=filter_type,
        custom_start=custom_start,
        custom_end=custom_end,
    )
    return APIResponse(success=True, message="AI financial summary generated successfully.", data=data)

