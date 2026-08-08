"""
Global Exception Handlers for FastAPI converting errors into standardized JSON responses.
"""

from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError, HTTPException
from sqlalchemy.exc import SQLAlchemyError
from app.exceptions.custom_exceptions import AppException
from app.core.logging import logger


async def app_exception_handler(request: Request, exc: AppException) -> JSONResponse:
    logger.warning("AppException on {path}: {msg}", path=request.url.path, msg=exc.message)
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "message": exc.message,
            "data": exc.details,
            "meta": {"path": str(request.url.path)},
        },
    )


async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    logger.warning("Validation error on {path}: {errors}", path=request.url.path, errors=exc.errors())
    formatted_errors = []
    for err in exc.errors():
        field = " -> ".join([str(loc) for loc in err["loc"]])
        formatted_errors.append({"field": field, "message": err["msg"]})

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "success": False,
            "message": "Request validation failed",
            "data": {"errors": formatted_errors},
            "meta": {"path": str(request.url.path)},
        },
    )


async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    logger.warning("HTTPException [{status}] on {path}: {detail}", status=exc.status_code, path=request.url.path, detail=exc.detail)
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "message": str(exc.detail),
            "data": None,
            "meta": {"path": str(request.url.path)},
        },
    )


async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError) -> JSONResponse:
    logger.error("SQLAlchemyError on {path}: {err}", path=request.url.path, err=str(exc))
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "message": "Database processing error occurred",
            "data": None,
            "meta": {"path": str(request.url.path)},
        },
    )


async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.critical("Unhandled Exception on {path}: {err}", path=request.url.path, err=str(exc))
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "message": "An unexpected internal server error occurred",
            "data": None,
            "meta": {"path": str(request.url.path)},
        },
    )
