import asyncio
import sys
import os

sys.path.insert(0, os.path.abspath('backend'))

from sqlalchemy import select
from app.database.session import AsyncSessionLocal
from app.models.user import User
from app.services.report_service import ReportService

async def main():
    async with AsyncSessionLocal() as db:
        res = await db.execute(select(User).where(User.email == 'mandhanani@gmail.com'))
        user = res.scalar_one_or_none()
        if not user:
            print("User mandhanani@gmail.com not found!")
            return

        report_svc = ReportService(db)
        print("=== VERIFYING REPORTS & ANALYTICS 4 SECTIONS BACKEND PIPELINE ===")

        # 1. Executive Summary
        exec_sum = await report_svc.get_dashboard_summary_report(user.id, filter_type='this_month', compare_previous=True)
        print("\n1. SECTION 1: EXECUTIVE SUMMARY")
        print("   KPIs:", exec_sum.get("kpis"))
        print("   Comparison:", exec_sum.get("comparison"))
        print("   Insight:", str(exec_sum.get("executive_insight")).encode('ascii', 'ignore').decode('ascii'))

        # 2. Spending Analysis
        cat_rep = await report_svc.get_category_report(user.id, filter_type='this_month')
        print("\n2. SECTION 2: SPENDING ANALYSIS")
        print("   Categories count:", len(cat_rep.get("categories", [])))
        print("   Merchants count:", len(cat_rep.get("merchants", [])))

        # 3. Financial Performance
        budget_rep = await report_svc.get_budget_report(user.id)
        goal_rep = await report_svc.get_goal_report(user.id)
        health_rep = await report_svc.get_financial_health_report(user.id)
        forecast_rep = await report_svc.get_forecast_report(user.id)
        print("\n3. SECTION 3: FINANCIAL PERFORMANCE")
        print("   Budget Util:", budget_rep.get("overall_utilization_pct"), "%")
        print("   Goal Completion:", goal_rep.get("overall_completion_pct"), "%")
        print("   Health Score:", health_rep.get("latest_score"))
        print("   Forecast Next Exp:", forecast_rep.get("forecast_next_month_expense"))

        # 4. Excel Multi-Sheet Export Verification
        output, filename, media_type = await report_svc.export_report_file(user.id, export_format="xlsx", filter_type="this_month")
        print("\n4. SECTION 4: INSIGHTS & EXPORT (EXCEL MULTI-SHEET VERIFICATION)")
        print(f"   Generated File: {filename} ({media_type})")
        print(f"   File Byte Size: {len(output.getvalue())} bytes")

        import pandas as pd
        excel_file = pd.ExcelFile(output)
        print("   Excel Sheet Names generated:", excel_file.sheet_names)
        assert set(excel_file.sheet_names) == {"Summary", "Spending Analysis", "Financial Performance", "Insights"}, "Sheet names mismatch!"
        print("   SUCCESS: All 4 Excel Sheets verified successfully!")

if __name__ == '__main__':
    asyncio.run(main())
