"""
FastAPI Router for Enterprise Notification & Alert Engine Endpoints.
"""

from typing import Optional
from uuid import UUID
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.services.notification_service import NotificationService
from app.schemas.notification import NotificationResponse, NotificationUnreadSummary, NotificationPaginatedResponse
from app.schemas.base import APIResponse

router = APIRouter(prefix="/notifications", tags=["Notifications & Alerts"])


@router.get(
    "",
    response_model=APIResponse[NotificationPaginatedResponse],
    status_code=status.HTTP_200_OK,
    summary="Get paginated notifications with filters",
)
async def get_notifications(
    is_read: Optional[bool] = Query(None, description="Filter by read status (true/false)"),
    priority: Optional[str] = Query(None, description="Filter by priority (CRITICAL, HIGH, MEDIUM, LOW)"),
    category: Optional[str] = Query(None, description="Filter by category (BUDGET, GOAL, TRANSACTION, HEALTH, FORECAST, SYSTEM, AI, REPORT, SECURITY, REMINDER)"),
    related_module: Optional[str] = Query(None, description="Filter by related module"),
    search: Optional[str] = Query(None, description="Search keyword in title, message, or type"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """GET /api/v1/notifications - List paginated user notifications."""
    service = NotificationService(db)
    data = await service.get_user_notifications(
        user_id=current_user.id,
        is_read=is_read,
        priority=priority,
        category=category,
        related_module=related_module,
        search=search,
        page=page,
        page_size=page_size,
    )
    return APIResponse(success=True, message="Notifications fetched successfully.", data=data)


@router.get(
    "/unread",
    response_model=APIResponse[NotificationUnreadSummary],
    status_code=status.HTTP_200_OK,
    summary="Get unread notification count and popover preview",
)
async def get_unread_notifications(
    limit: int = Query(5, ge=1, le=20),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """GET /api/v1/notifications/unread - Get unread count and latest unread list."""
    service = NotificationService(db)
    data = await service.get_unread_summary(user_id=current_user.id, limit=limit)
    return APIResponse(success=True, message="Unread notification summary retrieved.", data=data)


@router.put(
    "/{id}/read",
    response_model=APIResponse[NotificationResponse],
    status_code=status.HTTP_200_OK,
    summary="Mark single notification as read",
)
async def mark_notification_read(
    id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """PUT /api/v1/notifications/{id}/read - Mark notification as read."""
    service = NotificationService(db)
    notif = await service.mark_as_read(notification_id=id, user_id=current_user.id)
    return APIResponse(success=True, message="Notification marked as read.", data=notif)


@router.put(
    "/read-all",
    response_model=APIResponse[dict],
    status_code=status.HTTP_200_OK,
    summary="Mark all user notifications as read",
)
async def mark_all_notifications_read(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """PUT /api/v1/notifications/read-all - Mark all notifications as read."""
    service = NotificationService(db)
    count = await service.mark_all_as_read(user_id=current_user.id)
    return APIResponse(success=True, message=f"Marked {count} notifications as read.", data={"updated_count": count})


@router.delete(
    "/{id}",
    response_model=APIResponse[dict],
    status_code=status.HTTP_200_OK,
    summary="Delete single notification",
)
async def delete_notification(
    id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """DELETE /api/v1/notifications/{id} - Delete notification."""
    service = NotificationService(db)
    await service.delete_notification(notification_id=id, user_id=current_user.id)
    return APIResponse(success=True, message="Notification deleted successfully.", data={"deleted_id": str(id)})


@router.post(
    "/generate",
    response_model=APIResponse[dict],
    status_code=status.HTTP_200_OK,
    summary="Manually trigger dynamic rule engine evaluation",
)
async def trigger_notification_generation(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """POST /api/v1/notifications/generate - Manually trigger rule engine evaluation."""
    service = NotificationService(db)
    await service.evaluate_dynamic_rules(user_id=current_user.id)
    count = await service.notif_repo.get_unread_count(current_user.id)
    return APIResponse(success=True, message="Dynamic notification evaluation triggered.", data={"unread_count": count})
