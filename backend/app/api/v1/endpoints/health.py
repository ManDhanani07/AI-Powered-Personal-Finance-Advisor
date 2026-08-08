"""
Health Check and System Status Endpoints.
"""

from fastapi import APIRouter, status
from app.core.config import settings
from app.core.constants import AppConstants, ResponseMessages
from app.schemas.base import APIResponse, HealthCheckResponse
from app.database.session import check_database_connection

router = APIRouter(tags=["Health & Status"])


@router.get("/health", response_model=APIResponse[HealthCheckResponse], status_code=status.HTTP_200_OK)
async def health_check():
    """System Health Check Endpoint."""
    db_ok = await check_database_connection()
    health_data = HealthCheckResponse(
        status="healthy" if db_ok else "degraded",
        version=AppConstants.VERSION,
        environment=settings.APP_ENV.value,
        database_connected=db_ok,
    )
    return APIResponse(
        success=True,
        message=ResponseMessages.HEALTH_OK if db_ok else "System running with degraded database connection",
        data=health_data,
    )


@router.get("/status", response_model=APIResponse[dict], status_code=status.HTTP_200_OK)
async def system_status():
    """System Operational Status Endpoint."""
    return APIResponse(
        success=True,
        message="System operational",
        data={
            "app_name": settings.APP_NAME,
            "environment": settings.APP_ENV.value,
            "debug": settings.DEBUG,
            "status": "online",
        },
    )


@router.get("/version", response_model=APIResponse[dict], status_code=status.HTTP_200_OK)
async def system_version():
    """API Version Endpoint."""
    return APIResponse(
        success=True,
        message="API Version Information",
        data={
            "name": settings.APP_NAME,
            "version": AppConstants.VERSION,
            "api_prefix": settings.API_V1_STR,
        },
    )
