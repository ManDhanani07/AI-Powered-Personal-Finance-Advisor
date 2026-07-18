from sqlalchemy.orm import Session
from typing import List, Optional, Any
from app.repositories.category import CategoryRepository
from app.schemas.category import CategoryCreate, CategoryUpdate
from app.models.category import Category
from app.core.exceptions import EntityNotFoundError, BusinessRuleError, ForbiddenError
from app.core.logging import logger

class CategoryService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = CategoryRepository(db)

    def list_categories(self, user_id: Any, category_type: Optional[str] = None) -> List[Category]:
        """Fetch custom and global system categories visible to the user."""
        return self.repo.get_visible(user_id, category_type)

    def get_category(self, category_id: Any, user_id: Any) -> Category:
        """Fetch a specific category, raising EntityNotFoundError if missing or unauthorized."""
        category = self.repo.get(category_id)
        if not category or (category.user_id is not None and category.user_id != user_id):
            logger.warning(f"Unauthorized category access attempt: ID {category_id} for user ID {user_id}")
            raise EntityNotFoundError("Category not found.")
        return category

    def create_category(self, user_id: Any, data: CategoryCreate) -> Category:
        """Create a custom category under user scope and commit transaction safely."""
        existing = self.repo.get_by_name(data.name, user_id, data.parent_id)
        if existing:
            logger.warning(f"Blocked duplicate category creation: {data.name} for user ID {user_id}")
            raise BusinessRuleError("Category name already exists under the parent scope.")
        
        if data.parent_id:
            self.get_category(data.parent_id, user_id)

        try:
            category = Category(
                user_id=user_id,
                parent_id=data.parent_id,
                name=data.name.strip(),
                category_type=data.category_type,
                icon=data.icon,
                color=data.color,
                is_default=data.is_default
            )
            created = self.repo.create(category)
            self.db.commit()
            logger.info(f"Created category ID {created.id} ({created.name}) for user ID {user_id}")
            return created
        except Exception as e:
            self.db.rollback()
            logger.error(f"Category creation failed for user ID {user_id}: {str(e)}")
            raise BusinessRuleError("Failed to create category.")

    def update_category(self, category_id: Any, user_id: Any, data: CategoryUpdate) -> Category:
        """Modify category settings and commit transaction safely."""
        category = self.get_category(category_id, user_id)
        if category.user_id is None:
            raise ForbiddenError("System categories are read-only.")
            
        update_dict = data.model_dump(exclude_unset=True)
        
        # Verify duplicate names under parent scope
        if "name" in update_dict:
            existing = self.repo.get_by_name(update_dict["name"], user_id, data.parent_id or category.parent_id)
            if existing and existing.id != category.id:
                raise BusinessRuleError("Category name already exists under the target parent scope.")

        # Verify loop structures
        if "parent_id" in update_dict and update_dict["parent_id"]:
            if update_dict["parent_id"] == category.id:
                raise BusinessRuleError("A category cannot be configured as its own parent.")
            self.get_category(update_dict["parent_id"], user_id)

        try:
            for key, value in update_dict.items():
                setattr(category, key, value)
            updated = self.repo.update(category)
            self.db.commit()
            logger.info(f"Updated category ID {category_id} for user ID {user_id}")
            return updated
        except Exception as e:
            self.db.rollback()
            logger.error(f"Category update failed for ID {category_id}: {str(e)}")
            raise BusinessRuleError("Failed to update category.")

    def delete_category(self, category_id: Any, user_id: Any) -> None:
        """Delete custom categories and commit transaction safely."""
        category = self.get_category(category_id, user_id)
        if category.user_id is None:
            raise ForbiddenError("System categories cannot be deleted.")
        try:
            self.repo.remove(category.id)
            self.db.commit()
            logger.info(f"Deleted category ID {category_id} for user ID {user_id}")
        except Exception as e:
            self.db.rollback()
            logger.error(f"Category deletion blocked for ID {category_id}: {str(e)}")
            raise BusinessRuleError("Cannot delete category. Ensure no transaction histories or subcategories refer to it.")
