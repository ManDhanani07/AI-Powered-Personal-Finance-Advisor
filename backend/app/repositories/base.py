from typing import Generic, TypeVar, Type, Optional, List, Any
from sqlalchemy.orm import Session
from app.database.database import Base

ModelType = TypeVar("ModelType", bound=Base)

class BaseRepository(Generic[ModelType]):
    def __init__(self, model: Type[ModelType], db: Session):
        self.model = model
        self.db = db

    def get(self, id: Any) -> Optional[ModelType]:
        """Retrieve a record by primary key id."""
        return self.db.query(self.model).filter(self.model.id == id).first()

    def get_multi(self, skip: int = 0, limit: int = 100) -> List[ModelType]:
        """Retrieve multiple records with basic pagination."""
        return self.db.query(self.model).offset(skip).limit(limit).all()

    def create(self, obj: ModelType, flush: bool = True) -> ModelType:
        """Create a new record in the session context, flushing changes without committing."""
        self.db.add(obj)
        if flush:
            self.db.flush()
            self.db.refresh(obj)
        return obj

    def update(self, db_obj: ModelType, flush: bool = True) -> ModelType:
        """Add updated record to the session context, flushing changes without committing."""
        self.db.add(db_obj)
        if flush:
            self.db.flush()
            self.db.refresh(db_obj)
        return db_obj

    def remove(self, id: Any, flush: bool = True) -> Optional[ModelType]:
        """Mark a record for deletion in the session context, flushing changes without committing."""
        obj = self.get(id)
        if obj:
            self.db.delete(obj)
            if flush:
                self.db.flush()
        return obj
