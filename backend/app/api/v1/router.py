"""
API Router v1 Aggregator.
"""

from fastapi import APIRouter
from app.api.v1.endpoints import (
    health,
    auth,
    user,
    transactions,
    categories,
    budgets,
    goals,
    dashboard,
    financial_health,
    ai,
    reports,
    notifications,
    admin,
    expense_prediction,
)

api_router = APIRouter()
api_router.include_router(health.router)
api_router.include_router(auth.router)
api_router.include_router(user.router)
api_router.include_router(transactions.router)
api_router.include_router(categories.router)
api_router.include_router(budgets.router)
api_router.include_router(goals.router)
api_router.include_router(dashboard.router)
api_router.include_router(financial_health.router)
api_router.include_router(ai.router)
api_router.include_router(reports.router)
api_router.include_router(notifications.router)
api_router.include_router(admin.router)
api_router.include_router(expense_prediction.router)
