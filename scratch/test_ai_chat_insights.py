import asyncio
import sys
import os
import time

sys.path.insert(0, os.path.abspath('backend'))

from sqlalchemy import select
from app.database.session import AsyncSessionLocal
from app.models.user import User
from app.services.gemini_service import GeminiService
from app.repositories.chat_history_repository import ChatHistoryRepository
from app.repositories.user_repository import UserRepository
from app.repositories.transaction_repository import TransactionRepository
from app.repositories.budget_repository import BudgetRepository
from app.repositories.goal_repository import GoalRepository
from app.repositories.dashboard_repository import DashboardRepository
from app.repositories.financial_health_repository import FinancialHealthRepository
from app.repositories.forecast_repository import ForecastRepository
from app.services.forecast_service import ForecastService
from app.services.financial_health_service import FinancialHealthService

async def main():
    async with AsyncSessionLocal() as db:
        res = await db.execute(select(User).where(User.email == 'mandhanani@gmail.com'))
        user = res.scalar_one_or_none()
        if not user:
            print("User not found")
            return

        chat_repo = ChatHistoryRepository(db)
        user_repo = UserRepository(db)
        tx_repo = TransactionRepository(db)
        b_repo = BudgetRepository(db)
        g_repo = GoalRepository(db)
        d_repo = DashboardRepository(db)
        fh_repo = FinancialHealthRepository(db)
        forecast_repo = ForecastRepository(db)
        forecast_svc = ForecastService(forecast_repo, tx_repo, user_repo)
        health_svc = FinancialHealthService(fh_repo)

        svc = GeminiService(chat_repo, user_repo, tx_repo, b_repo, g_repo, d_repo, fh_repo, forecast_svc, health_svc)

        t0 = time.time()
        print("Testing 'Give me every Insights.' query...")
        resp = await svc.generate_chat_response(user.id, "Give me every Insights.")
        t1 = time.time()

        print(f"\nResponse received in {t1 - t0:.2f} seconds!")
        print("Model Used:", resp.get("model_name"))
        print("\nAnswer Output:")
        print(resp.get("answer").encode('ascii', errors='replace').decode('ascii'))

if __name__ == '__main__':
    asyncio.run(main())
