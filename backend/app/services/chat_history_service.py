"""
Chat History Service providing business logic for Google Gemini AI conversation history.
"""

from typing import Dict, Any, List
from uuid import UUID
from app.repositories.chat_history_repository import ChatHistoryRepository
from app.repositories.user_repository import UserRepository
from app.services.base import BaseService
from app.exceptions.custom_exceptions import BadRequestException, NotFoundException


class ChatHistoryService(BaseService[ChatHistoryRepository]):
    def __init__(
        self,
        chat_repository: ChatHistoryRepository,
        user_repository: UserRepository,
    ):
        super().__init__(chat_repository)
        self.chat_repository = chat_repository
        self.user_repository = user_repository

    async def save_chat_message(self, chat_data: Dict[str, Any]):
        """Validate and record user question and Gemini AI answer pair."""
        user_id = chat_data.get("user_id")
        if not user_id or not await self.user_repository.exists(id=user_id):
            raise NotFoundException(f"User with ID {user_id} does not exist")

        question = chat_data.get("question")
        answer = chat_data.get("answer")
        if not question or not question.strip():
            raise BadRequestException("Question cannot be empty")
        if not answer or not answer.strip():
            raise BadRequestException("Answer cannot be empty")

        chat_data["question"] = question.strip()
        chat_data["answer"] = answer.strip()
        return await self.chat_repository.create(chat_data)

    async def get_user_chat_history(self, user_id: UUID, limit: int = 50) -> List[Any]:
        """Fetch past AI conversations for user."""
        if not await self.user_repository.exists(id=user_id):
            raise NotFoundException(f"User with ID {user_id} does not exist")
        return await self.chat_repository.get_by_user(user_id, limit)

    async def clear_chat_history(self, user_id: UUID) -> int:
        """Clear all past AI conversations for user."""
        if not await self.user_repository.exists(id=user_id):
            raise NotFoundException(f"User with ID {user_id} does not exist")
        return await self.chat_repository.clear_user_history(user_id)
