"""
Gemini AI Financial Assistant REST Endpoints.
"""

from typing import List, Dict, Any
from uuid import UUID
from fastapi import APIRouter, Depends, status, Query

from app.schemas.base import APIResponse
from app.schemas.ai import AIChatRequest, AIChatResponse, ChatHistoryItemResponse, ChatHistoryListResponse
from app.services.gemini_service import GeminiService
from app.services.chat_history_service import ChatHistoryService
from app.dependencies.service import get_gemini_service, get_chat_history_service
from app.dependencies.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/ai", tags=["AI Financial Assistant"])


@router.post("/chat", response_model=APIResponse[AIChatResponse], status_code=status.HTTP_200_OK)
async def chat_with_gemini(
    payload: AIChatRequest,
    current_user: User = Depends(get_current_user),
    gemini_service: GeminiService = Depends(get_gemini_service),
):
    """
    Send prompt to Google Gemini AI Assistant.
    Automatically retrieves live PostgreSQL context (Transactions, Budgets, Goals, Health Score, Forecasts)
    and persists message history.
    """
    res = await gemini_service.generate_chat_response(
        user_id=current_user.id,
        message=payload.message,
        conversation_id=payload.conversation_id,
    )
    return APIResponse(
        success=True,
        data=AIChatResponse.model_validate(res),
        message="Gemini AI response generated successfully",
    )


@router.get("/history", response_model=APIResponse[ChatHistoryListResponse], status_code=status.HTTP_200_OK)
async def get_chat_history(
    limit: int = Query(50, ge=1, le=200, description="Max history items"),
    current_user: User = Depends(get_current_user),
    chat_service: ChatHistoryService = Depends(get_chat_history_service),
):
    """Fetch past Gemini AI conversation history from PostgreSQL."""
    items = await chat_service.get_user_chat_history(user_id=current_user.id, limit=limit)
    response_items = [ChatHistoryItemResponse.model_validate(item) for item in items]
    return APIResponse(
        success=True,
        data=ChatHistoryListResponse(items=response_items, total=len(response_items)),
        message="Chat history retrieved successfully",
    )


@router.delete("/history", response_model=APIResponse[Dict[str, int]], status_code=status.HTTP_200_OK)
async def clear_chat_history(
    current_user: User = Depends(get_current_user),
    chat_service: ChatHistoryService = Depends(get_chat_history_service),
):
    """Clear all past Gemini AI conversation history from PostgreSQL."""
    deleted_count = await chat_service.clear_chat_history(user_id=current_user.id)
    return APIResponse(
        success=True,
        data={"deleted_count": deleted_count},
        message=f"Cleared {deleted_count} conversation history records",
    )


@router.delete("/history/session/{conversation_id}", response_model=APIResponse[Dict[str, int]], status_code=status.HTTP_200_OK)
async def delete_conversation_session(
    conversation_id: str,
    current_user: User = Depends(get_current_user),
    chat_service: ChatHistoryService = Depends(get_chat_history_service),
):
    """Delete all messages for a specific conversation session."""
    deleted_count = await chat_service.delete_conversation_session(
        user_id=current_user.id, conversation_id=conversation_id
    )
    return APIResponse(
        success=True,
        data={"deleted_count": deleted_count},
        message=f"Deleted conversation session {conversation_id}",
    )
