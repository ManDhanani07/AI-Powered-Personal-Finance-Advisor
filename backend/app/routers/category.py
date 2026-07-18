from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
from app.database.database import get_db
from app.schemas.category import CategoryCreate, CategoryUpdate, CategoryResponse
from app.services.category import CategoryService
from app.api.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/categories", tags=["Categories"])

@router.get("", response_model=List[CategoryResponse], summary="List all visible categories")
def list_categories(
    type: Optional[str] = Query(None, description="Filter categories by type: income, expense, or transfer"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Fetch all visible categories (combining default global categories and custom ones created by the user).
    """
    service = CategoryService(db)
    return service.list_categories(current_user.id, type)


@router.get("/{id}", response_model=CategoryResponse, summary="Get details for a specific category")
def get_category(
    id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve classification metadata for a specific category UUID, verifying visibility permission.
    """
    service = CategoryService(db)
    return service.get_category(id, current_user.id)


@router.post(
    "", 
    response_model=CategoryResponse, 
    status_code=status.HTTP_201_CREATED, 
    summary="Create a custom category"
)
def create_category(
    data: CategoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Configure a custom category. Duplicate names under the same nesting level are rejected.
    """
    service = CategoryService(db)
    return service.create_category(current_user.id, data)


@router.put("/{id}", response_model=CategoryResponse, summary="Update a custom category")
def update_category(
    id: UUID,
    data: CategoryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Modify category settings (e.g. name, color hex). System-wide default categories are read-only.
    """
    service = CategoryService(db)
    return service.update_category(id, current_user.id, data)


@router.delete("/{id}", status_code=status.HTTP_200_OK, summary="Remove a custom category")
def delete_category(
    id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a user custom category. Fails if standard system-wide categories are targeted, or if transaction records rely on it.
    """
    service = CategoryService(db)
    service.delete_category(id, current_user.id)
    return {"message": "Category successfully deleted."}
