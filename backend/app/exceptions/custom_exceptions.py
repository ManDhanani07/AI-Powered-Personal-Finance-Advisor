"""
Custom Application Exceptions.
"""

from typing import Optional, Dict, Any
from fastapi import status


class AppException(Exception):
    def __init__(
        self,
        message: str = "An application error occurred",
        status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
        details: Optional[Dict[str, Any]] = None,
    ):
        self.message = message
        self.status_code = status_code
        self.details = details
        super().__init__(self.message)


class NotFoundException(AppException):
    def __init__(self, message: str = "Resource not found", details: Optional[Dict[str, Any]] = None):
        super().__init__(message=message, status_code=status.HTTP_404_NOT_FOUND, details=details)


class BadRequestException(AppException):
    def __init__(self, message: str = "Invalid request payload", details: Optional[Dict[str, Any]] = None):
        super().__init__(message=message, status_code=status.HTTP_400_BAD_REQUEST, details=details)


class UnauthorizedException(AppException):
    def __init__(self, message: str = "Authentication required", details: Optional[Dict[str, Any]] = None):
        super().__init__(message=message, status_code=status.HTTP_401_UNAUTHORIZED, details=details)


class ForbiddenException(AppException):
    def __init__(self, message: str = "Permission denied", details: Optional[Dict[str, Any]] = None):
        super().__init__(message=message, status_code=status.HTTP_403_FORBIDDEN, details=details)


class DatabaseException(AppException):
    def __init__(self, message: str = "Database transaction error", details: Optional[Dict[str, Any]] = None):
        super().__init__(message=message, status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, details=details)
