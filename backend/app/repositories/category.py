from typing import List, Optional, Any
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.repositories.base import BaseRepository
from app.models.category import Category

class CategoryRepository(BaseRepository[Category]):
    def __init__(self, db: Session):
        super().__init__(Category, db)

    def get_visible(self, user_id: Any, category_type: Optional[str] = None) -> List[Category]:
        """Fetch categories visible to the user: global ones (user_id is NULL) and custom ones."""
        query = self.db.query(Category).filter(
            or_(Category.user_id == None, Category.user_id == user_id)
        )
        if category_type:
            query = query.filter(Category.category_type == category_type)
        return query.all()

    def get_by_name(self, name: str, user_id: Any, parent_id: Optional[Any] = None) -> Optional[Category]:
        """Retrieve a specific category for duplicate checks."""
        query = self.db.query(Category).filter(
            Category.name.ilike(name.strip()),
            Category.user_id == user_id
        )
        if parent_id:
            query = query.filter(Category.parent_id == parent_id)
        else:
            query = query.filter(Category.parent_id == None)
        return query.first()
