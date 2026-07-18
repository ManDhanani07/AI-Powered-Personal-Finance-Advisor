from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session
from typing import Optional
from uuid import UUID
from datetime import datetime
from app.database.database import get_db
from app.schemas.transaction import TransactionCreate, TransactionUpdate, TransactionResponse, PaginatedTransactionResponse
from app.services.transaction import TransactionService
from app.api.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/transactions", tags=["Transactions"])

@router.get(
    "", 
    response_model=PaginatedTransactionResponse, 
    summary="List transactions with filters and pagination"
)
def list_transactions(
    skip: int = Query(0, ge=0, description="Pagination skip offset"),
    limit: int = Query(50, ge=1, le=100, description="Pagination limits"),
    type: Optional[str] = Query(None, description="Filter by transaction type: income, expense, or transfer"),
    category_id: Optional[UUID] = Query(None, description="Filter by category UUID"),
    account_id: Optional[UUID] = Query(None, description="Filter by account UUID (source or destination)"),
    start_date: Optional[datetime] = Query(None, description="ISO date boundary start"),
    end_date: Optional[datetime] = Query(None, description="ISO date boundary end"),
    min_amount: Optional[float] = Query(None, ge=0.0, description="Minimum transaction amount"),
    max_amount: Optional[float] = Query(None, ge=0.0, description="Maximum transaction amount"),
    search: Optional[str] = Query(None, description="Fuzzy match search on description or notes"),
    sort_by: str = Query("transaction_date", description="Sort target: transaction_date, amount, description"),
    order: str = Query("desc", description="Sort order: asc or desc"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get user transactions. Includes full support for searching, sorting, pagination, and multi-field filters.
    """
    service = TransactionService(db)
    items, total = service.list_transactions(
        user_id=current_user.id,
        skip=skip,
        limit=limit,
        type=type,
        category_id=category_id,
        account_id=account_id,
        start_date=start_date,
        end_date=end_date,
        min_amount=min_amount,
        max_amount=max_amount,
        search=search,
        sort_by=sort_by,
        order=order
    )
    return PaginatedTransactionResponse(
        total=total,
        skip=skip,
        limit=limit,
        items=items
    )


@router.get("/{id}", response_model=TransactionResponse, summary="Get details for a transaction record")
def get_transaction(
    id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve specific ledger parameters for a single transaction.
    """
    service = TransactionService(db)
    return service.get_transaction(id, current_user.id)


@router.post(
    "", 
    response_model=TransactionResponse, 
    status_code=status.HTTP_201_CREATED, 
    summary="Create a new transaction"
)
def create_transaction(
    data: TransactionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Record a new transaction. Automatically updates related bank/cash account balances atomically.
    """
    service = TransactionService(db)
    return service.create_transaction(current_user.id, data)


@router.put("/{id}", response_model=TransactionResponse, summary="Modify a transaction record")
def update_transaction(
    id: UUID,
    data: TransactionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update details for a transaction. Reverts historical balance adjustments and applies new adjustments atomically.
    """
    service = TransactionService(db)
    return service.update_transaction(id, current_user.id, data)


@router.delete("/{id}", status_code=status.HTTP_200_OK, summary="Remove a transaction record")
def delete_transaction(
    id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a ledger entry. Reverts all balances affected by this transaction before deleting.
    """
    service = TransactionService(db)
    service.delete_transaction(id, current_user.id)
    return {"message": "Transaction successfully deleted."}
