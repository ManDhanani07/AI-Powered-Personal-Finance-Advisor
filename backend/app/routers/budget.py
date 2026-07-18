from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from app.database.database import get_db
from app.schemas.budget import BudgetCreate, BudgetUpdate, BudgetResponse
from app.services.budget import BudgetService
from app.api.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/budgets", tags=["Budgets"])

@router.get("", response_model=List[BudgetResponse], summary="List all budgets")
def list_budgets(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all category budgets created by the user.
    """
    service = BudgetService(db)
    return service.list_budgets(current_user.id)


@router.get("/{id}", response_model=BudgetResponse, summary="Get details for a specific budget")
def get_budget(
    id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve settings for a budget by UUID.
    """
    service = BudgetService(db)
    return service.get_budget(id, current_user.id)


@router.post(
    "", 
    response_model=BudgetResponse, 
    status_code=status.HTTP_201_CREATED, 
    summary="Create a new budget limit"
)
def create_budget(
    data: BudgetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new spending threshold boundary on a transaction category.
    """
    service = BudgetService(db)
    return service.create_budget(current_user.id, data)


@router.put("/{id}", response_model=BudgetResponse, summary="Update budget settings")
def update_budget(
    id: UUID,
    data: BudgetUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update target category, limit sizes, or date bounds.
    """
    service = BudgetService(db)
    return service.update_budget(id, current_user.id, data)


@router.delete("/{id}", status_code=status.HTTP_200_OK, summary="Remove a budget policy")
def delete_budget(
    id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Remove a category budget configuration.
    """
    service = BudgetService(db)
    service.delete_budget(id, current_user.id)
    return {"message": "Budget successfully deleted."}
