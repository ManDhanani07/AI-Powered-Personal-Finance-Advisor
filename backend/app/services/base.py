"""
Enterprise Generic Base Service for Clean Architecture Business Logic Layer.
"""

from typing import Generic, TypeVar, Optional, List, Dict, Any, Union
from uuid import UUID
from app.repositories.base import BaseRepository
from app.schemas.base import PaginatedResponse
from app.exceptions.custom_exceptions import NotFoundException, BadRequestException

RepoType = TypeVar("RepoType", bound=BaseRepository)


class BaseService(Generic[RepoType]):
    def __init__(self, repository: RepoType):
        self.repository = repository

    async def get_by_id(self, id: UUID):
        """Get record by UUID. Raises NotFoundException if record does not exist."""
        if not id:
            raise BadRequestException("Invalid UUID provided")
        record = await self.repository.get_by_id(id)
        if not record:
            raise NotFoundException(f"Record with ID {id} not found")
        return record

    async def exists(self, id: Optional[UUID] = None, filters: Optional[Dict[str, Any]] = None) -> bool:
        """Check if record exists in the database."""
        return await self.repository.exists(id=id, filters=filters)

    async def get_all(
        self,
        page: int = 1,
        page_size: int = 20,
        filters: Optional[Dict[str, Any]] = None,
        search: Optional[str] = None,
        search_fields: Optional[List[str]] = None,
        sort_by: str = "created_at",
        sort_order: str = "desc",
    ) -> PaginatedResponse:
        """Get paginated, filtered, searched, and sorted records."""
        if page < 1:
            page = 1
        if page_size < 1 or page_size > 100:
            page_size = 20
        return await self.repository.get_all(
            page=page,
            page_size=page_size,
            filters=filters,
            search=search,
            search_fields=search_fields,
            sort_by=sort_by,
            sort_order=sort_order,
        )

    async def count(
        self,
        filters: Optional[Dict[str, Any]] = None,
        search: Optional[str] = None,
        search_fields: Optional[List[str]] = None,
    ) -> int:
        """Count total matching records."""
        return await self.repository.count(filters=filters, search=search, search_fields=search_fields)

    async def create(self, data: Dict[str, Any]):
        """Create single record via repository."""
        if not data:
            raise BadRequestException("Creation payload cannot be empty")
        return await self.repository.create(data)

    async def create_multi(self, datas: List[Dict[str, Any]]):
        """Create multiple records via repository."""
        if not datas:
            raise BadRequestException("Bulk payload cannot be empty")
        return await self.repository.create_multi(datas)

    async def update(self, id: UUID, data: Dict[str, Any]):
        """Update existing record via repository."""
        if not id:
            raise BadRequestException("Invalid UUID provided for update")
        await self.get_by_id(id)  # Validate existence
        return await self.repository.update(id, data)

    async def delete(self, id: UUID, hard: bool = False) -> bool:
        """Delete record by ID via repository."""
        if not id:
            raise BadRequestException("Invalid UUID provided for deletion")
        await self.get_by_id(id)  # Validate existence
        return await self.repository.delete(id, hard=hard)

    async def soft_delete(self, id: UUID) -> bool:
        """Soft delete record by ID."""
        return await self.delete(id, hard=False)

    async def restore(self, id: UUID):
        """Restore soft-deleted record by ID."""
        if not id:
            raise BadRequestException("Invalid UUID provided for restore")
        return await self.repository.restore(id)
