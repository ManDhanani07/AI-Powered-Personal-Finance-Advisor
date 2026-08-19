"""
FastAPI Service & Repository Dependency Injections.
"""

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.session import get_db
from app.repositories.user_repository import UserRepository
from app.repositories.category_repository import CategoryRepository
from app.repositories.transaction_repository import TransactionRepository
from app.repositories.budget_repository import BudgetRepository
from app.repositories.goal_repository import GoalRepository
from app.repositories.dashboard_repository import DashboardRepository
from app.repositories.financial_health_repository import FinancialHealthRepository
from app.repositories.notification_repository import NotificationRepository
from app.repositories.email_verification_repository import EmailVerificationRepository
from app.repositories.chat_history_repository import ChatHistoryRepository

from app.services.auth_service import AuthService
from app.services.transaction_service import TransactionService
from app.services.category_service import CategoryService
from app.services.budget_service import BudgetService
from app.services.goal_service import GoalService
from app.services.dashboard_service import DashboardService
from app.services.financial_health_service import FinancialHealthService
from app.services.chat_history_service import ChatHistoryService
from app.services.gemini_service import GeminiService
from app.services.csv_import_service import CsvImportService
from app.services.expense_prediction_service import ExpensePredictionService


def get_user_repository(db: AsyncSession = Depends(get_db)) -> UserRepository:
    return UserRepository(db)


def get_category_repository(db: AsyncSession = Depends(get_db)) -> CategoryRepository:
    return CategoryRepository(db)


def get_transaction_repository(db: AsyncSession = Depends(get_db)) -> TransactionRepository:
    return TransactionRepository(db)


def get_budget_repository(db: AsyncSession = Depends(get_db)) -> BudgetRepository:
    return BudgetRepository(db)


def get_goal_repository(db: AsyncSession = Depends(get_db)) -> GoalRepository:
    return GoalRepository(db)


def get_email_verification_repository(db: AsyncSession = Depends(get_db)) -> EmailVerificationRepository:
    return EmailVerificationRepository(db)


def get_auth_service(db: AsyncSession = Depends(get_db)) -> AuthService:
    user_repo = UserRepository(db)
    email_verif_repo = EmailVerificationRepository(db)
    return AuthService(user_repo, email_verif_repo)


def get_category_service(db: AsyncSession = Depends(get_db)) -> CategoryService:
    cat_repo = CategoryRepository(db)
    return CategoryService(cat_repo)


def get_budget_service(db: AsyncSession = Depends(get_db)) -> BudgetService:
    budget_repo = BudgetRepository(db)
    cat_repo = CategoryRepository(db)
    tx_repo = TransactionRepository(db)
    goal_repo = GoalRepository(db)
    health_repo = FinancialHealthRepository(db)
    notif_repo = NotificationRepository(db)

    health_svc = FinancialHealthService(health_repo)

    return BudgetService(
        budget_repository=budget_repo,
        category_repository=cat_repo,
        transaction_repository=tx_repo,
        goal_repository=goal_repo,
        financial_health_repository=health_repo,
        notification_repository=notif_repo,
        financial_health_service=health_svc,
    )


def get_goal_service(db: AsyncSession = Depends(get_db)) -> GoalService:
    goal_repo = GoalRepository(db)
    tx_repo = TransactionRepository(db)
    cat_repo = CategoryRepository(db)
    notif_repo = NotificationRepository(db)
    return GoalService(
        goal_repository=goal_repo,
        transaction_repository=tx_repo,
        category_repository=cat_repo,
        notification_repository=notif_repo,
    )


def get_transaction_service(db: AsyncSession = Depends(get_db)) -> TransactionService:
    tx_repo = TransactionRepository(db)
    user_repo = UserRepository(db)
    cat_repo = CategoryRepository(db)
    budget_repo = BudgetRepository(db)
    return TransactionService(tx_repo, user_repo, cat_repo, budget_repo)


def get_dashboard_service(db: AsyncSession = Depends(get_db)) -> DashboardService:
    return DashboardService(
        dashboard_repo=DashboardRepository(db),
        transaction_repo=TransactionRepository(db),
        budget_repo=BudgetRepository(db),
        goal_repo=GoalRepository(db),
        user_repo=UserRepository(db),
    )


def get_financial_health_service(db: AsyncSession = Depends(get_db)) -> FinancialHealthService:
    repo = FinancialHealthRepository(db)
    return FinancialHealthService(repo)


def get_chat_history_service(db: AsyncSession = Depends(get_db)) -> ChatHistoryService:
    chat_repo = ChatHistoryRepository(db)
    user_repo = UserRepository(db)
    return ChatHistoryService(chat_repo, user_repo)


def get_gemini_service(db: AsyncSession = Depends(get_db)) -> GeminiService:
    chat_repo = ChatHistoryRepository(db)
    user_repo = UserRepository(db)
    tx_repo = TransactionRepository(db)
    budget_repo = BudgetRepository(db)
    goal_repo = GoalRepository(db)
    dash_repo = DashboardRepository(db)
    health_repo = FinancialHealthRepository(db)

    health_svc = FinancialHealthService(health_repo)

    return GeminiService(
        chat_repository=chat_repo,
        user_repository=user_repo,
        transaction_repository=tx_repo,
        budget_repository=budget_repo,
        goal_repository=goal_repo,
        dashboard_repository=dash_repo,
        financial_health_repository=health_repo,
        health_service=health_svc,
    )


def get_csv_import_service(db: AsyncSession = Depends(get_db)) -> CsvImportService:
    return CsvImportService(db)


def get_expense_prediction_service(db: AsyncSession = Depends(get_db)) -> ExpensePredictionService:
    tx_repo = TransactionRepository(db)
    cat_repo = CategoryRepository(db)
    return ExpensePredictionService(transaction_repository=tx_repo, category_repository=cat_repo)
