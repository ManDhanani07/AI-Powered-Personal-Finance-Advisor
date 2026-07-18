from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from app.database.database import get_db
from app.schemas.account import AccountCreate, AccountUpdate, AccountResponse
from app.services.account import AccountService
from app.api.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/accounts", tags=["Accounts"])

@router.get("", response_model=List[AccountResponse], summary="List all active accounts")
def list_accounts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    List all active financial accounts (assets & liabilities) owned by the current user.
    """
    service = AccountService(db)
    return service.list_accounts(current_user.id)


@router.get("/{id}", response_model=AccountResponse, summary="Get details for a specific account")
def get_account(
    id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Fetch structural and balance details for an account by its unique UUID.
    """
    service = AccountService(db)
    return service.get_account(id, current_user.id)


@router.post(
    "", 
    response_model=AccountResponse, 
    status_code=status.HTTP_201_CREATED, 
    summary="Create a new financial account"
)
def create_account(
    data: AccountCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Initialize a new account ledger (e.g., checking, savings, credit cards).
    """
    service = AccountService(db)
    return service.create_account(current_user.id, data)


@router.put("/{id}", response_model=AccountResponse, summary="Update account configurations")
def update_account(
    id: UUID,
    data: AccountUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Modify parameters like friendly name, custom limits, or balance thresholds.
    """
    service = AccountService(db)
    return service.update_account(id, current_user.id, data)


@router.delete("/{id}", status_code=status.HTTP_200_OK, summary="Remove a financial account")
def delete_account(
    id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Remove an account. Will fail with HTTP 400 if the account contains active transaction records.
    """
    service = AccountService(db)
    service.delete_account(id, current_user.id)
    return {"message": "Account successfully deleted."}
