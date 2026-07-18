from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from app.core.logging import setup_logging, logger
from app.core.exceptions import (
    EntityNotFoundError,
    BusinessRuleError,
    AuthenticationError,
    ForbiddenError,
    DuplicateRecordError
)
from app.routers.auth import router as auth_router
from app.routers.user import router as user_router
from app.routers.account import router as account_router
from app.routers.category import router as category_router
from app.routers.transaction import router as transaction_router
from app.routers.budget import router as budget_router
from app.routers.goal import router as goal_router
from app.routers.dashboard import router as dashboard_router
from app.routers.prediction import router as prediction_router
from app.routers.recommendation import router as recommendation_router
from app.routers.financial_health import router as financial_health_router

# Initialize structured logging configurations
setup_logging()

app = FastAPI(
    title="AI Powered Personal Finance Advisor",
    description="Backend API for Personal Finance Management System",
    version="1.0.0"
)

# Configure CORS for local frontend client communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify the exact domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Custom Domain Exception Handlers (Decouples service layer from framework HTTP layer)
@app.exception_handler(EntityNotFoundError)
def entity_not_found_handler(request: Request, exc: EntityNotFoundError):
    logger.warning(f"EntityNotFoundError caught: {exc.message}")
    return JSONResponse(
        status_code=status.HTTP_404_NOT_FOUND,
        content={"detail": exc.message}
    )

@app.exception_handler(BusinessRuleError)
def business_rule_handler(request: Request, exc: BusinessRuleError):
    logger.warning(f"BusinessRuleError caught: {exc.message}")
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={"detail": exc.message}
    )

@app.exception_handler(AuthenticationError)
def authentication_handler(request: Request, exc: AuthenticationError):
    logger.warning(f"AuthenticationError caught: {exc.message}")
    return JSONResponse(
        status_code=status.HTTP_401_UNAUTHORIZED,
        content={"detail": exc.message},
        headers={"WWW-Authenticate": "Bearer"}
    )

@app.exception_handler(ForbiddenError)
def forbidden_handler(request: Request, exc: ForbiddenError):
    logger.warning(f"ForbiddenError caught: {exc.message}")
    return JSONResponse(
        status_code=status.HTTP_403_FORBIDDEN,
        content={"detail": exc.message}
    )

@app.exception_handler(DuplicateRecordError)
def duplicate_record_handler(request: Request, exc: DuplicateRecordError):
    logger.warning(f"DuplicateRecordError caught: {exc.message}")
    return JSONResponse(
        status_code=status.HTTP_409_CONFLICT,
        content={"detail": exc.message}
    )

# Register routers under /api/v1
app.include_router(auth_router, prefix="/api/v1")
app.include_router(user_router, prefix="/api/v1")
app.include_router(account_router, prefix="/api/v1")
app.include_router(category_router, prefix="/api/v1")
app.include_router(transaction_router, prefix="/api/v1")
app.include_router(budget_router, prefix="/api/v1")
app.include_router(goal_router, prefix="/api/v1")
app.include_router(dashboard_router, prefix="/api/v1")
app.include_router(prediction_router, prefix="/api/v1")
app.include_router(recommendation_router, prefix="/api/v1")
app.include_router(financial_health_router, prefix="/api/v1")

@app.get("/")
def home():
    return {
        "message": "Welcome to AI Powered Personal Finance Advisor API"
    }

@app.get("/health")
def health():
    return {
        "status": "Server Running Successfully"
    }