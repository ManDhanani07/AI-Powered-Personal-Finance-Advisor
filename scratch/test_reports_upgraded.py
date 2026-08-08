import asyncio
import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath('backend'))

from sqlalchemy import select
from app.database.session import AsyncSessionLocal
from app.models.user import User
from app.services.report_service import ReportService

async def main():
    async with AsyncSessionLocal() as db:
        res = await db.execute(select(User).where(User.email == 'mandhanani536@gmail.com'))
        user = res.scalar_one_or_none()
        if not user:
            print("User mandhanani536@gmail.com not found!")
            return

        print(f"Testing upgraded ReportService for user {user.email} ({user.id})...")
        service = ReportService(db)

        # 1. Executive Summary with Period Comparison
        dash = await service.get_dashboard_summary_report(user.id, filter_type='this_month', compare_previous=True)
        print("\n--- 1. Dashboard Summary ---")
        print("Filter applied:", dash.get('filter_applied'))
        print("Comparison enabled:", dash.get('comparison_enabled'))
        print("Comparison metrics:", dash.get('comparison'))
        print("Executive insight:", dash.get('executive_insight', '').replace('₹', 'INR '))
        print("KPIs:", dash.get('kpis'))

        # 2. Budget Performance with Thresholds
        budgets = await service.get_budget_report(user.id)
        print("\n--- 2. Budget Report ---")
        print("Total budgets:", budgets.get('total_budgets'))
        print("Healthy count:", budgets.get('healthy_categories_count'))
        print("Warning count:", budgets.get('warning_categories_count'))
        print("Near limit count:", budgets.get('near_limit_categories_count'))
        print("Exceeded count:", budgets.get('exceeded_categories_count'))
        print("Exceeded insights:", budgets.get('exceeded_insights'))

        # Goal Report
        goal_rep = await service.get_goal_report(user.id)
        print("\n--- Goal Report ---")
        print("Goal report output:", goal_rep)
        print("\n--- 3. Health Report ---")
        print("Latest score:", health.get('latest_score'))
        print("Grade:", health.get('latest_grade'))
        print("Status:", health.get('status'))
        print("Factors count:", len(health.get('factors', [])))
        print("Explanation:", health.get('explanation'))

        # 4. Forecast Report
        forecast = await service.get_forecast_report(user.id)
        print("\n--- 4. Forecast Report ---")
        print("Reliability:", forecast.get('forecast_reliability'))
        print("Tx count:", forecast.get('historical_transactions_count'))
        print("Current monthly exp:", forecast.get('current_monthly_expense'))
        print("Next month exp:", forecast.get('forecast_next_month_expense'))
        print("Explanation:", forecast.get('explanation'))

        print("\nSUCCESS: All ReportService methods executed successfully!")

if __name__ == '__main__':
    asyncio.run(main())
