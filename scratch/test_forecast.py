import asyncio
import sys
import os
sys.path.insert(0, os.path.abspath('backend'))

from app.database.session import AsyncSessionLocal
from app.models.user import User
from app.services.forecast_service import ForecastService
from app.services.prophet_engine import ProphetEngine
from app.repositories.forecast_repository import ForecastRepository
from app.repositories.transaction_repository import TransactionRepository
from app.repositories.user_repository import UserRepository
from sqlalchemy import select

async def test():
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(User).limit(1))
        user = result.scalars().first()
        if not user:
            print('No users found')
            return
        
        print(f'Testing for user: {user.email}')
        
        tx_repo = TransactionRepository(db)
        paginated = await tx_repo.get_by_user(user_id=user.id, page=1, page_size=1000)
        txs = paginated.items
        print(f'Total transactions: {len(txs)}')
        
        if txs:
            df = ProphetEngine.prepare_daily_dataframe(txs, 'EXPENSE')
            print(f'EXPENSE df rows: {len(df)}')
            ymax = df["y"].max()
            ysum = df["y"].sum()
            print(f'EXPENSE y max: {ymax}, sum: {ysum}')
            
            df2 = ProphetEngine.prepare_daily_dataframe(txs, 'INCOME')
            ymax2 = df2["y"].max()
            ysum2 = df2["y"].sum()
            print(f'INCOME y max: {ymax2}, sum: {ysum2}')

            # Test a single forecast
            print('\n--- Running EXPENSE forecast ---')
            exp_res = ProphetEngine.fit_and_forecast(txs, 'EXPENSE', 90)
            print(f'sufficient_data: {exp_res["sufficient_data"]}')
            print(f'message: {exp_res["message"]}')
            if exp_res.get('insights'):
                ins = exp_res['insights']
                print(f'insights.expected_monthly_expense: {ins.get("expected_monthly_expense")}')
                print(f'insights.expected_monthly_income: {ins.get("expected_monthly_income")}')
            else:
                print('insights: None')
            print(f'forecast_points count: {len(exp_res.get("forecast_points", []))}')

            print('\n--- Running INCOME forecast ---')
            inc_res = ProphetEngine.fit_and_forecast(txs, 'INCOME', 90)
            print(f'sufficient_data: {inc_res["sufficient_data"]}')
            if inc_res.get('insights'):
                ins2 = inc_res['insights']
                print(f'insights.expected_monthly_expense: {ins2.get("expected_monthly_expense")}')

        forecast_repo = ForecastRepository(db)
        user_repo = UserRepository(db)
        service = ForecastService(forecast_repo, tx_repo, user_repo)
        
        print('\n--- Running get_forecast_summary ---')
        summary = await service.get_forecast_summary(user.id, period_days=90)
        print(f'sufficient_data: {summary["sufficient_data"]}')
        print(f'message: {summary["message"]}')
        print(f'insights: {summary.get("insights")}')
        print(f'expense_forecast count: {len(summary.get("expense_forecast", []))}')
        print(f'income_forecast count: {len(summary.get("income_forecast", []))}')

asyncio.run(test())
