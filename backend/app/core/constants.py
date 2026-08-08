"""
Application Constants, Status Codes, Response Messages, and Environment Definitions.
"""

from enum import Enum


class EnvironmentOption(str, Enum):
    DEVELOPMENT = "development"
    TESTING = "testing"
    PRODUCTION = "production"


class ResponseMessages:
    SUCCESS = "Operation completed successfully"
    HEALTH_OK = "System is healthy and operational"
    CREATED = "Resource created successfully"
    UPDATED = "Resource updated successfully"
    DELETED = "Resource deleted successfully"
    NOT_FOUND = "Resource not found"
    BAD_REQUEST = "Invalid request payload or parameters"
    UNAUTHORIZED = "Authentication required or token invalid"
    FORBIDDEN = "Insufficient permissions"
    VALIDATION_ERROR = "Validation error occurred"
    DATABASE_ERROR = "Database operation failed"
    INTERNAL_SERVER_ERROR = "An unexpected error occurred"


class AppConstants:
    APP_NAME = "AI-Powered Personal Finance Advisor API"
    VERSION = "1.0.0"
    API_V1_PREFIX = "/api/v1"
    DEFAULT_PAGE = 1
    DEFAULT_PAGE_SIZE = 20
    MAX_PAGE_SIZE = 100
    DEFAULT_CURRENCY = "INR"
    DEFAULT_LOCALE = "en_IN"
