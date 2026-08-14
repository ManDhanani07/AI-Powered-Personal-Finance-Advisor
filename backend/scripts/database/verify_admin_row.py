import sys
import asyncio
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from sqlalchemy import select
from app.database.session import AsyncSessionLocal
from app.models.user import User

async def main():
    async with AsyncSessionLocal() as session:
        res = await session.execute(select(User).where(User.role == "ADMIN"))
        admins = res.scalars().all()
        print(f"TOTAL ADMIN ROWS IN POSTGRESQL: {len(admins)}")
        for a in admins:
            print(f"- ID: {a.id} | Email: {a.email} | Role: {a.role} | Created: {a.created_at}")

if __name__ == "__main__":
    asyncio.run(main())
