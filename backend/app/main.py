"""
Main FastAPI Application Entry Point (SMTP Active).
"""

from pathlib import Path
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.responses import RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.exceptions import RequestValidationError, HTTPException
from sqlalchemy.exc import SQLAlchemyError

from app.core.config import settings
from app.core.logging import logger
from app.core.constants import AppConstants
from app.api.v1.router import api_router
from app.middleware.timing import RequestTimingMiddleware
from app.middleware.logging import RequestLoggingMiddleware
from app.exceptions.custom_exceptions import AppException
from app.exceptions.handlers import (
    app_exception_handler,
    validation_exception_handler,
    http_exception_handler,
    sqlalchemy_exception_handler,
    unhandled_exception_handler,
)
from app.database.init_health_table import ensure_financial_health_schema
from app.database.init_notification_table import ensure_notification_schema

static_dir = Path(__file__).resolve().parent.parent / "static"
static_dir.mkdir(parents=True, exist_ok=True)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for application startup and shutdown events."""
    logger.info(f"Starting {settings.APP_NAME} in [{settings.APP_ENV.value}] mode...")
    try:
        await ensure_financial_health_schema()
        await ensure_notification_schema()
    except Exception as err:
        logger.error(f"Startup schema migration error: {err}")
    yield
    logger.info(f"Shutting down {settings.APP_NAME}...")


def create_application() -> FastAPI:
    """FastAPI Application Factory."""
    app = FastAPI(
        title=settings.APP_NAME,
        version=AppConstants.VERSION,
        description="Enterprise FinTech SaaS Platform API Foundation",
        openapi_url="/openapi.json",
        docs_url="/docs",
        redoc_url="/redoc",
        lifespan=lifespan,
    )

    # 1. Security & CORS Middlewares
    cors_origins = [str(origin) for origin in settings.CORS_ORIGINS] if settings.CORS_ORIGINS else ["*"]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=cors_origins,
        allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?",
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    if settings.is_production and settings.ALLOWED_HOSTS:
        app.add_middleware(
            TrustedHostMiddleware,
            allowed_hosts=settings.ALLOWED_HOSTS,
        )

    # 2. Performance & Utility Middlewares
    app.add_middleware(GZipMiddleware, minimum_size=1000)
    app.add_middleware(RequestTimingMiddleware)
    app.add_middleware(RequestLoggingMiddleware)

    # 3. Global Exception Handlers
    app.add_exception_handler(AppException, app_exception_handler)
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
    app.add_exception_handler(HTTPException, http_exception_handler)
    app.add_exception_handler(SQLAlchemyError, sqlalchemy_exception_handler)
    app.add_exception_handler(Exception, unhandled_exception_handler)

    # 4. Mount Static Directory
    app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")

    # 5. Root Redirect to /docs
    @app.get("/", include_in_schema=False)
    async def root_redirect():
        return RedirectResponse(url="/docs")

    @app.get(f"{settings.API_V1_STR}/docs", include_in_schema=False)
    async def v1_docs_redirect():
        return RedirectResponse(url="/docs")

    # 6. Include API Routers
    app.include_router(api_router, prefix=settings.API_V1_STR)

    return app


app = create_application()
