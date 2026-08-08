import asyncio
import sys
import os

sys.path.insert(0, os.path.abspath('backend'))

from sqlalchemy import select
from app.database.session import AsyncSessionLocal
from app.models.user import User
from app.services.gemini_service import GeminiService
from app.services.chat_history_service import ChatHistoryService

from app.dependencies.service import get_gemini_service

async def main():
    async with AsyncSessionLocal() as db:
        res = await db.execute(select(User).where(User.email == 'mandhanani@gmail.com'))
        user = res.scalar_one_or_none()
        if not user:
            print("User mandhanani@gmail.com not found")
            return

        gemini_svc = get_gemini_service(db)
        prompt = "Analyze my current financial standing: Income = 80000, Expenses = 52000, Net Savings = 28000, Savings Rate = 35%, Top Category = Food & Dining. Give me a concise 2-sentence actionable FinTech advice on how to improve my wealth score and keep my budget on track."
        
        print("Sending prompt to GeminiService...")
        result = await gemini_svc.generate_chat_response(user_id=user.id, message=prompt)
        print("\n--- Gemini AI Response ---")
        print("Question:", result['question'])
        print("Answer:", result['answer'])
        print("Model used:", result['model_name'])

if __name__ == '__main__':
    asyncio.run(main())
