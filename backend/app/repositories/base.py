"""
Enterprise Generic Base Repository for SQLAlchemy 2.x Async Operations.
Provides CRUD, bulk insertion, filtering, searching, sorting, pagination, soft-delete, and transaction rollback handling.
"""

from typing import Generic, TypeVar, Type, Optional, List, Any, Dict, Union
from uuid import UUID
from datetime import datetime
from sqlalchemy import select, func, update, delete, or_, asc, desc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import SQLAlchemyError

from app.database.session import Base
from app.schemas.base import PaginatedResponse
from app.utils.pagination import build_paginated_response
from app.exceptions.custom_exceptions import DatabaseException, NotFoundException
from app.core.logging import logger

ModelType = TypeVar("ModelType", bound=Base)


class BaseRepository(Generic[ModelType]):
    def __init__(self, model: Type[ModelType], db: AsyncSession):
        self.model = model
        self.db = db

    async def get_by_id(self, id: UUID) -> Optional[ModelType]:
        """Fetch a single record by primary key UUID."""
        try:
            query = select(self.model).where(self.model.id == id)
            if hasattr(self.model, "is_deleted"):
                query = query.where(getattr(self.model, "is_deleted") == False)
            result = await self.db.execute(query)
            return result.scalar_one_or_none()
        except SQLAlchemyError as ex:
            logger.error(f"Error fetching {self.model.__name__} by ID {id}: {ex}")
            raise DatabaseException(f"Failed to retrieve record by ID: {ex}")

    async def exists(self, id: Optional[UUID] = None, filters: Optional[Dict[str, Any]] = None) -> bool:
        """Check if a record matching ID or filters exists in the database."""
        try:
            query = select(func.count()).select_from(self.model)
            if id is not None:
                query = query.where(self.model.id == id)
            if hasattr(self.model, "is_deleted"):
                query = query.where(getattr(self.model, "is_deleted") == False)
            if filters:
                for key, val in filters.items():
                    if hasattr(self.model, key) and val is not None:
                        query = query.where(getattr(self.model, key) == val)
            result = await self.db.execute(query)
            return (result.scalar() or 0) > 0
        except SQLAlchemyError as ex:
            logger.error(f"Error checking existence for {self.model.__name__}: {ex}")
            raise DatabaseException(f"Failed to verify record existence: {ex}")

    async def create(self, obj_in: Union[Dict[str, Any], ModelType]) -> ModelType:
        """Insert a single record into the database."""
        try:
            if isinstance(obj_in, dict):
                db_obj = self.model(**obj_in)
            else:
                db_obj = obj_in

            self.db.add(db_obj)
            await self.db.commit()
            await self.db.refresh(db_obj)
            return db_obj
        except SQLAlchemyError as ex:
            await self.db.rollback()
            logger.error(f"Error creating {self.model.__name__}: {ex}")
            raise DatabaseException(f"Database insertion failed: {ex}")

    async def create_multi(self, objs_in: List[Union[Dict[str, Any], ModelType]]) -> List[ModelType]:
        """Bulk insert multiple records into the database."""
        try:
            db_objs = [
                self.model(**obj) if isinstance(obj, dict) else obj for obj in objs_in
            ]
            self.db.add_all(db_objs)
            await self.db.commit()
            for db_obj in db_objs:
                await self.db.refresh(db_obj)
            return db_objs
        except SQLAlchemyError as ex:
            await self.db.rollback()
            logger.error(f"Bulk creation error for {self.model.__name__}: {ex}")
            raise DatabaseException(f"Bulk database insertion failed: {ex}")

    async def update(self, id: UUID, obj_in: Dict[str, Any]) -> ModelType:
        """Update an existing record by ID."""
        try:
            db_obj = await self.get_by_id(id)
            if not db_obj:
                raise NotFoundException(f"{self.model.__name__} with ID {id} not found")

            for field, value in obj_in.items():
                if hasattr(db_obj, field) and value is not None:
                    setattr(db_obj, field, value)

            if hasattr(db_obj, "updated_at"):
                setattr(db_obj, "updated_at", datetime.utcnow())

            self.db.add(db_obj)
            await self.db.commit()
            await self.db.refresh(db_obj)
            return db_obj
        except SQLAlchemyError as ex:
            await self.db.rollback()
            logger.error(f"Error updating {self.model.__name__} with ID {id}: {ex}")
            raise DatabaseException(f"Database update operation failed: {ex}")

    async def delete(self, id: UUID, hard: bool = False) -> bool:
        """Delete a record by ID. Performs soft-delete by default if model supports it."""
        try:
            db_obj = await self.get_by_id(id)
            if not db_obj:
                raise NotFoundException(f"{self.model.__name__} with ID {id} not found")

            if hasattr(db_obj, "is_deleted") and not hard:
                setattr(db_obj, "is_deleted", True)
                if hasattr(db_obj, "deleted_at"):
                    setattr(db_obj, "deleted_at", datetime.utcnow())
                self.db.add(db_obj)
            else:
                await self.db.delete(db_obj)

            await self.db.commit()
            return True
        except SQLAlchemyError as ex:
            await self.db.rollback()
            logger.error(f"Error deleting {self.model.__name__} with ID {id}: {ex}")
            raise DatabaseException(f"Database deletion failed: {ex}")

    async def soft_delete(self, id: UUID) -> bool:
        """Explicitly soft delete a record."""
        return await self.delete(id, hard=False)

    async def restore(self, id: UUID) -> Optional[ModelType]:
        """Restore a soft-deleted record."""
        try:
            query = select(self.model).where(self.model.id == id)
            result = await self.db.execute(query)
            db_obj = result.scalar_one_or_none()
            if not db_obj:
                raise NotFoundException(f"{self.model.__name__} with ID {id} not found")

            if hasattr(db_obj, "is_deleted"):
                setattr(db_obj, "is_deleted", False)
                if hasattr(db_obj, "deleted_at"):
                    setattr(db_obj, "deleted_at", None)
                self.db.add(db_obj)
                await self.db.commit()
                await self.db.refresh(db_obj)
            return db_obj
        except SQLAlchemyError as ex:
            await self.db.rollback()
            logger.error(f"Error restoring {self.model.__name__} with ID {id}: {ex}")
            raise DatabaseException(f"Failed to restore soft-deleted record: {ex}")

    async def _apply_filters_and_search(
        self,
        query,
        filters: Optional[Dict[str, Any]] = None,
        search: Optional[str] = None,
        search_fields: Optional[List[str]] = None,
    ):
        """Internal helper to apply dynamic filters, soft delete check, and text search."""
        if hasattr(self.model, "is_deleted"):
            query = query.where(getattr(self.model, "is_deleted") == False)

        if filters:
            for key, val in filters.items():
                if hasattr(self.model, key) and val is not None:
                    query = query.where(getattr(self.model, key) == val)

        if search and search_fields:
            search_conditions = []
            for field in search_fields:
                if hasattr(self.model, field):
                    search_conditions.append(getattr(self.model, field).ilike(f"%{search}%"))
            if search_conditions:
                query = query.where(or_(*search_conditions))

        return query

    async def count(
        self,
        filters: Optional[Dict[str, Any]] = None,
        search: Optional[str] = None,
        search_fields: Optional[List[str]] = None,
    ) -> int:
        """Count total records matching filters and search criteria."""
        try:
            query = select(func.count()).select_from(self.model)
            query = await self._apply_filters_and_search(query, filters, search, search_fields)
            result = await self.db.execute(query)
            return result.scalar() or 0
        except SQLAlchemyError as ex:
            logger.error(f"Error counting records for {self.model.__name__}: {ex}")
            raise DatabaseException(f"Count query failed: {ex}")

    async def get_all(
        self,
        page: int = 1,
        page_size: int = 20,
        filters: Optional[Dict[str, Any]] = None,
        search: Optional[str] = None,
        search_fields: Optional[List[str]] = None,
        sort_by: str = "created_at",
        sort_order: str = "desc",
    ) -> PaginatedResponse[ModelType]:
        """Fetch paginated, filtered, searched, and sorted records."""
        try:
            query = select(self.model)
            query = await self._apply_filters_and_search(query, filters, search, search_fields)

            # Apply Sorting
            sort_column = getattr(self.model, sort_by, None)
            if sort_column is not None:
                query = query.order_by(desc(sort_column) if sort_order.lower() == "desc" else asc(sort_column))

            # Apply Pagination
            offset = (page - 1) * page_size
            query = query.offset(offset).limit(page_size)

            result = await self.db.execute(query)
            items = list(result.scalars().all())

            total_count = await self.count(filters=filters, search=search, search_fields=search_fields)
            return build_paginated_response(items=items, total_items=total_count, page=page, page_size=page_size)
        except SQLAlchemyError as ex:
            logger.error(f"Error retrieving paginated records for {self.model.__name__}: {ex}")
            raise DatabaseException(f"Get all operation failed: {ex}")
