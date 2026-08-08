"""
Pagination calculation helpers.
"""

import math
from typing import List, TypeVar, Dict, Any
from app.schemas.base import PaginatedMeta, PaginatedResponse

T = TypeVar("T")


def build_paginated_response(
    items: List[T],
    total_items: int,
    page: int,
    page_size: int,
) -> PaginatedResponse[T]:
    """Constructs a PaginatedResponse envelope."""
    total_pages = math.ceil(total_items / page_size) if page_size > 0 else 0
    meta = PaginatedMeta(
        page=page,
        page_size=page_size,
        total_items=total_items,
        total_pages=total_pages,
        has_next=page < total_pages,
        has_prev=page > 1,
    )
    return PaginatedResponse(items=items, pagination=meta)
