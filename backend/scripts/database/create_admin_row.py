import sys
import asyncio
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from sqlalchemy import select
from app.database.session import AsyncSessionLocal
from app.models.user import User
from app.core.security import hash_password

async def main():
    async with AsyncSessionLocal() as session:
        res = await session.execute(select(User).where(User.email == "mandhanani536@gmail.com"))
        user = res.scalar_one_or_none()
        hashed = hash_password("AdminPass@123")
        
        if not user:
            user = User(
                first_name="System",
                last_name="Admin",
                email="mandhanani536@gmail.com",
                password_hash=hashed,
                role="ADMIN",
                is_active=True,
                is_verified=True,
                email_verified=True,
                currency="INR",
                country="India"
            )
            session.add(user)
            print("INSERTED NEW ADMIN ROW: mandhanani536@gmail.com")
        else:
            user.role = "ADMIN"
            user.password_hash = hashed
            user.is_active = True
            print("UPDATED EXISTING USER ROLE TO ADMIN: mandhanani536@gmail.com")

        await session.commit()
        print("SUCCESSFULLY COMMITTED TO POSTGRESQL!")

if __name__ == "__main__":
    asyncio.run(main())
