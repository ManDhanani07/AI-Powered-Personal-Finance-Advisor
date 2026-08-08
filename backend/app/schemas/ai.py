"""
Pydantic Schemas for Google Gemini AI Financial Assistant.
"""

from typing import List, Optional
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, Field


class AIChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000, description="User question or prompt for Gemini AI")
    conversation_id: Optional[str] = Field(None, description="Optional conversation session ID")


class AIChatResponse(BaseModel):
    id: str
    question: str
    answer: str
    model_name: str = Field(default="gemini-1.5-flash", description="Gemini model name used")
    created_at: datetime
    context_used: bool = Field(default=True, description="Whether live PostgreSQL context was included")


class ChatHistoryItemResponse(BaseModel):
    id: UUID
    question: str
    answer: str
    model_name: str
    created_at: datetime

    class Config:
        from_attributes = True


class ChatHistoryListResponse(BaseModel):
    items: List[ChatHistoryItemResponse]
    total: int
