"""
Category Service providing business logic for income, expense, and investment categories.
"""

from typing import Dict, Any, List, Optional
from uuid import UUID
from app.repositories.category_repository import CategoryRepository
from app.services.base import BaseService
from app.exceptions.custom_exceptions import BadRequestException, NotFoundException


def _attach_parent_name(cat: Any) -> Any:
    """Attach a resolved parent_name string to a Category ORM object for Pydantic serialisation."""
    if cat.parent:
        cat.parent_name = cat.parent.category_name
    else:
        cat.parent_name = None
    return cat


class CategoryService(BaseService[CategoryRepository]):
    def __init__(self, category_repository: CategoryRepository):
        super().__init__(category_repository)
        self.category_repository = category_repository

    async def create_category(self, category_data: Dict[str, Any]):
        """Validate duplicate category name, validate parent, and create new category."""
        category_name = category_data.get("category_name")
        if not category_name or not category_name.strip():
            raise BadRequestException("Category name is required")

        category_type = category_data.get("category_type")
        if not category_type or category_type.upper() not in ["INCOME", "EXPENSE", "INVESTMENT", "TRANSFER"]:
            raise BadRequestException("Invalid category type. Must be INCOME, EXPENSE, INVESTMENT, or TRANSFER")

        existing = await self.category_repository.get_by_name(category_name.strip())
        if existing:
            raise BadRequestException(f"Category '{category_name.strip()}' already exists")

        # Validate parent_id if provided
        parent_id = category_data.get("parent_id")
        if parent_id:
            parent = await self.category_repository.get_by_id(parent_id)
            if not parent:
                raise NotFoundException("Parent category not found")
            # Prevent circular reference: parent cannot itself have a parent for now (max 2 levels)
            if parent.parent_id:
                raise BadRequestException("Cannot nest sub-categories more than one level deep")

        category_data["category_name"] = category_name.strip()
        category_data["category_type"] = category_type.upper()
        if "icon" not in category_data or not category_data["icon"]:
            category_data["icon"] = "Tag"
        if "color" not in category_data or not category_data["color"]:
            category_data["color"] = "#6366F1"

        cat = await self.category_repository.create(category_data)
        # Reload with parent eager-loaded
        cat = await self.category_repository.get_by_id(cat.id)
        return _attach_parent_name(cat)

    async def update_category(self, category_id: UUID, update_data: Dict[str, Any]):
        """Update category details."""
        existing = await self.category_repository.get_by_id(category_id)
        if not existing:
            raise NotFoundException(f"Category with ID {category_id} not found")

        if "category_name" in update_data and update_data["category_name"]:
            name = update_data["category_name"].strip()
            duplicate = await self.category_repository.get_by_name(name)
            if duplicate and duplicate.id != category_id:
                raise BadRequestException(f"Category with name '{name}' already exists")
            update_data["category_name"] = name

        if "category_type" in update_data and update_data["category_type"]:
            update_data["category_type"] = update_data["category_type"].upper()

        # Validate parent_id if changing
        parent_id = update_data.get("parent_id")
        if parent_id:
            if str(parent_id) == str(category_id):
                raise BadRequestException("A category cannot be its own parent")
            parent = await self.category_repository.get_by_id(parent_id)
            if not parent:
                raise NotFoundException("Parent category not found")
            if parent.parent_id:
                raise BadRequestException("Cannot nest sub-categories more than one level deep")

        cat = await self.category_repository.update(category_id, update_data)
        cat = await self.category_repository.get_by_id(cat.id)
        return _attach_parent_name(cat)

    async def delete_category(self, category_id: UUID):
        """Delete category if not linked to transactions."""
        existing = await self.category_repository.get_by_id(category_id)
        if not existing:
            raise NotFoundException(f"Category with ID {category_id} not found")

        if hasattr(existing, "transactions") and existing.transactions:
            raise BadRequestException(f"Cannot delete category '{existing.category_name}' because it is linked to active transactions.")

        await self.category_repository.delete(category_id, hard=True)
        return True

    async def duplicate_category(self, category_id: UUID):
        """Duplicate an existing category."""
        original = await self.category_repository.get_by_id(category_id)
        if not original:
            raise NotFoundException(f"Category with ID {category_id} not found")

        duplicate_payload = {
            "category_name": f"{original.category_name} (Copy)",
            "category_type": original.category_type,
            "icon": original.icon,
            "color": original.color,
            "description": original.description,
            "is_default": False,
            "parent_id": original.parent_id,
        }
        return await self.create_category(duplicate_payload)

    async def get_category_by_id(self, category_id: UUID) -> Any:
        """Fetch single category by ID with parent_name attached."""
        cat = await self.category_repository.get_by_id(category_id)
        if not cat:
            return None
        return _attach_parent_name(cat)

    async def get_all_categories(self) -> List[Any]:
        """Fetch all categories with parent names resolved."""
        cats = await self.category_repository.get_all_with_parent()
        return [_attach_parent_name(c) for c in cats]

    async def get_default_categories(self) -> List[Any]:
        """Fetch system default pre-seeded categories."""
        cats = await self.category_repository.get_default_categories()
        return [_attach_parent_name(c) for c in cats]

    async def get_custom_categories(self) -> List[Any]:
        """Fetch custom categories created by users."""
        cats = await self.category_repository.get_all_with_parent(page_size=200)
        return [_attach_parent_name(c) for c in cats if not c.is_default]

    async def get_categories_by_type(self, category_type: str) -> List[Any]:
        """Fetch categories filtered by type."""
        if not category_type:
            raise BadRequestException("Category type is required")
        cats = await self.category_repository.get_by_type(category_type)
        return [_attach_parent_name(c) for c in cats]
