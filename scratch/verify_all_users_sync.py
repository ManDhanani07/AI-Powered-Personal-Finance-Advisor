import asyncio
import sys
import os

sys.path.insert(0, os.path.abspath('backend'))

from sqlalchemy import select
from app.database.session import AsyncSessionLocal
from app.models.user import User
from app.services.report_service import ReportService
from app.services.goal_service import GoalService

from app.repositories.goal_repository import GoalRepository

async def main():
    async with AsyncSessionLocal() as db:
        users = (await db.execute(select(User))).scalars().all()
        report_svc = ReportService(db)
        goal_svc = GoalService(GoalRepository(db))

        print("=== VERIFYING GOALS PAGE vs REPORTS PAGE SYNC ===")
        for u in users:
            print(f"\nUSER: {u.email}")
            # Direct Goals API call (used on /goals page)
            direct_goals_res = await goal_svc.get_user_goals(u.id)
            items = direct_goals_res.items if hasattr(direct_goals_res, 'items') else direct_goals_res
            print(f"  [Goals Page /goals] Total Goals: {len(items)}")
            for g in items:
                name = getattr(g, 'goal_name', getattr(g, 'name', 'N/A'))
                print(f"    - Name: {name}, Target: INR {g.target_amount:,.2f}, Current: INR {g.current_amount:,.2f}, Status: {g.status}")

            # Reports API call (used on /reports -> Goals & Milestones tab)
            report_goals = await report_svc.get_goal_report(u.id)
            print(f"  [Reports Tab /reports] Total Target: INR {report_goals['total_target_amount']:,.2f}, Total Saved: INR {report_goals['total_saved_amount']:,.2f}, Completion: {report_goals['overall_completion_pct']}%")
            print(f"    Report Goals Count: {report_goals['total_goals']}, Completed: {report_goals['completed_goals']}")
            for g in report_goals['goals']:
                print(f"    - Name: {g['goal_name']}, Target: INR {g['target_amount']:,.2f}, Saved: INR {g['current_amount']:,.2f}, Pct: {g['completion_pct']}%, Status: {g['status']}, Done: {g['is_completed']}")

if __name__ == '__main__':
    asyncio.run(main())
