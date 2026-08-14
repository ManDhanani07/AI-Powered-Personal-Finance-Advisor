import sys
import asyncio
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.database.session import AsyncSessionLocal
from app.models.user import User
from app.api.v1.endpoints.admin import get_admin_users

async def test():
    async with AsyncSessionLocal() as session:
        admin_u = User(email="mandhanani536@gmail.com", role="ADMIN")
        try:
            res = await get_admin_users(search=None, status_filter=None, page=1, page_size=15, db=session, admin=admin_u)
            print("SUCCESS:", res)
        except Exception as e:
            print("ERROR:", type(e), e)
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test())
