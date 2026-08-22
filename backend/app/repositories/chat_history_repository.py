"""
Chat History Repository handling Database operations for Google Gemini AI interactions.
"""

from typing import List, Optional
from uuid import UUID
from sqlalchemy import select, delete, desc
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.chat_history import ChatHistory
from app.repositories.base import BaseRepository


class ChatHistoryRepository(BaseRepository[ChatHistory]):
    def __init__(self, db: AsyncSession):
        super().__init__(ChatHistory, db)

    async def get_by_user(self, user_id: UUID, limit: int = 50) -> List[ChatHistory]:
        """Fetch AI conversation history for a specific user."""
        query = (
            select(ChatHistory)
            .where(ChatHistory.user_id == user_id)
            .order_by(desc(ChatHistory.created_at))
            .limit(limit)
        )
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_by_conversation(self, user_id: UUID, conversation_id: str, limit: int = 100) -> List[ChatHistory]:
        """Fetch all messages within a specific conversation session."""
        query = (
            select(ChatHistory)
            .where(ChatHistory.user_id == user_id, ChatHistory.conversation_id == conversation_id)
            .order_by(desc(ChatHistory.created_at))
            .limit(limit)
        )
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def delete_by_conversation(self, user_id: UUID, conversation_id: str) -> int:
        """Delete all messages in a specific conversation session."""
        query = delete(ChatHistory).where(
            ChatHistory.user_id == user_id, ChatHistory.conversation_id == conversation_id
        )
        result = await self.db.execute(query)
        await self.db.commit()
        return result.rowcount

    async def get_latest_by_user(self, user_id: UUID) -> Optional[ChatHistory]:
        """Fetch the single most recent AI chat history record for a user."""
        query = (
            select(ChatHistory)
            .where(ChatHistory.user_id == user_id)
            .order_by(desc(ChatHistory.created_at))
            .limit(1)
        )
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def clear_user_history(self, user_id: UUID) -> int:
        """Clear all past AI chat history for a user."""
        query = delete(ChatHistory).where(ChatHistory.user_id == user_id)
        result = await self.db.execute(query)
        await self.db.commit()
        return result.rowcount
