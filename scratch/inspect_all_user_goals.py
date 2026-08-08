import asyncio
import sys
import os

sys.path.insert(0, os.path.abspath('backend'))

from sqlalchemy import select
from app.database.session import AsyncSessionLocal
from app.models.user import User
from app.models.goal import Goal

async def main():
    async with AsyncSessionLocal() as db:
        users = (await db.execute(select(User))).scalars().all()
        print("=== User Goals Inspection ===")
        for u in users:
            goals = (await db.execute(select(Goal).where(Goal.user_id == u.id))).scalars().all()
            print(f"User: {u.email} (ID: {u.id}) -> Goal Count: {len(goals)}")
            for g in goals:
                print(f"  - Goal: {g.goal_name}, Target: {g.target_amount}, Current: {g.current_amount}, Status: {g.status}")

if __name__ == '__main__':
    asyncio.run(main())
