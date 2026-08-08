import asyncio
import sys
import os

sys.path.insert(0, os.path.abspath('backend'))

from sqlalchemy import select
from app.database.session import AsyncSessionLocal
from app.models.user import User
from app.dependencies.service import get_gemini_service

async def main():
    async with AsyncSessionLocal() as db:
        res = await db.execute(select(User).where(User.email == 'mandhanani@gmail.com'))
        user = res.scalar_one_or_none()
        if not user:
            print("User mandhanani@gmail.com not found")
            return

        gemini_svc = get_gemini_service(db)
        prompt = "Analyze my complete financial standing for this month: Income = ₹3,25,000, Expenses = ₹3,04,769.76. Give me a 2-sentence summary."
        
        try:
            print("Calling generate_chat_response...")
            res_dict = await gemini_svc.generate_chat_response(user.id, prompt)
            print("SUCCESS! Output:")
            print("Question:", res_dict.get('question'))
            print("Answer:", res_dict.get('answer'))
        except Exception as e:
            print("ERROR occurred during Gemini generate_chat_response:")
            import traceback
            traceback.print_exc()

if __name__ == '__main__':
    asyncio.run(main())
