"""
HTTP Request / Response Loguru Logging Middleware.
"""

from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request
from app.core.logging import logger


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        logger.info(f"Incoming Request: {request.method} {request.url.path}")
        try:
            response = await call_next(request)
            logger.info(f"Completed Request: {request.method} {request.url.path} -> Status {response.status_code}")
            return response
        except Exception as ex:
            logger.error(f"Failed Request: {request.method} {request.url.path} -> Exception: {ex}")
            raise
