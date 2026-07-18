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
    type: Optional[str] = Query(None, description="Filter by transaction type: Expense, Income, Investment, Transfer"),
    category_id: Optional[UUID] = Query(None, description="Filter by category UUID"),
    account_id: Optional[UUID] = Query(None, description="Filter by account UUID"),
    start_date: Optional[datetime] = Query(None, description="ISO date boundary start"),
    end_date: Optional[datetime] = Query(None, description="ISO date boundary end"),
    min_amount: Optional[float] = Query(None, ge=0.0, description="Minimum transaction amount"),
    max_amount: Optional[float] = Query(None, ge=0.0, description="Maximum transaction amount"),
    search: Optional[str] = Query(None, description="Fuzzy match search on merchant, description or notes"),
    sort_by: str = Query("transaction_date", description="Sort target: transaction_date, amount, description"),
    order: str = Query("desc", description="Sort order: asc or desc"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    ### Description
    Get user transactions. Includes full support for searching, sorting, pagination, and multi-field filters.

    ### Professional Response Example
    ```json
    {
      "total": 1,
      "skip": 0,
      "limit": 50,
      "items": [
        {
          "id": "e4a2d5cf-72b1-4c6e-8e3d-0d62bf3f9829",
          "user_id": "87c3e5df-c49b-4e16-ba62-a548323c21a4",
          "account_id": "87c3e5df-c49b-4e16-ba62-a548323c21a5",
          "category_id": "c1a2d5cf-72b1-4c6e-8e3d-0d62bf3f9830",
          "merchant": "McDonald's",
          "amount": 450.0,
          "transaction_type": "Expense",
          "payment_method": "UPI",
          "transaction_date": "2026-07-18T14:11:31Z",
          "description": "Big Mac Meal",
          "notes": "",
          "location": "Ahmedabad",
          "ai_predicted_category": null,
          "prediction_confidence": null,
          "is_user_corrected": false,
          "receipt_image": "",
          "created_at": "2026-07-18T14:11:31Z",
          "updated_at": "2026-07-18T14:11:31Z"
        }
      ]
    }
    ```

    ### Possible Error Responses
    - **401 Unauthorized**: Invalid or expired access token.
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
    ### Description
    Retrieve specific ledger parameters for a single transaction.

    ### Professional Response Example
    ```json
    {
      "id": "e4a2d5cf-72b1-4c6e-8e3d-0d62bf3f9829",
      "user_id": "87c3e5df-c49b-4e16-ba62-a548323c21a4",
      "account_id": "87c3e5df-c49b-4e16-ba62-a548323c21a5",
      "category_id": "c1a2d5cf-72b1-4c6e-8e3d-0d62bf3f9830",
      "merchant": "McDonald's",
      "amount": 450.0,
      "transaction_type": "Expense",
      "payment_method": "UPI",
      "transaction_date": "2026-07-18T14:11:31Z",
      "description": "Big Mac Meal",
      "notes": "",
      "location": "Ahmedabad",
      "ai_predicted_category": null,
      "prediction_confidence": null,
      "is_user_corrected": false,
      "receipt_image": "",
      "created_at": "2026-07-18T14:11:31Z",
      "updated_at": "2026-07-18T14:11:31Z"
    }
    ```

    ### Possible Error Responses
    - **401 Unauthorized**: Invalid or expired access token.
    - **404 Not Found**: Transaction UUID not found.
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
    ### Description
    Record a new transaction. Automatically updates the related bank/cash account balance atomically.

    ### Validation Rules
    - **account_id**: Required. Must point to a valid account belonging to the user.
    - **amount**: Must be greater than zero.
    - **transaction_type**: Must be one of: `Expense`, `Income`, `Investment`, `Transfer`.

    ### Professional Request Example
    ```json
    {
      "merchant": "McDonald's",
      "amount": 450.0,
      "transaction_type": "Expense",
      "payment_method": "UPI",
      "account_id": "87c3e5df-c49b-4e16-ba62-a548323c21a5",
      "transaction_date": "2026-07-18T14:11:31Z",
      "description": "Big Mac Meal",
      "notes": "",
      "location": "Ahmedabad",
      "category_id": "c1a2d5cf-72b1-4c6e-8e3d-0d62bf3f9830",
      "ai_predicted_category": null,
      "prediction_confidence": null,
      "is_user_corrected": false,
      "receipt_image": ""
    }
    ```

    ### Professional Response Example
    ```json
    {
      "id": "e4a2d5cf-72b1-4c6e-8e3d-0d62bf3f9829",
      "user_id": "87c3e5df-c49b-4e16-ba62-a548323c21a4",
      "account_id": "87c3e5df-c49b-4e16-ba62-a548323c21a5",
      "category_id": "c1a2d5cf-72b1-4c6e-8e3d-0d62bf3f9830",
      "merchant": "McDonald's",
      "amount": 450.0,
      "transaction_type": "Expense",
      "payment_method": "UPI",
      "transaction_date": "2026-07-18T14:11:31Z",
      "description": "Big Mac Meal",
      "notes": "",
      "location": "Ahmedabad",
      "ai_predicted_category": null,
      "prediction_confidence": null,
      "is_user_corrected": false,
      "receipt_image": "",
      "created_at": "2026-07-18T14:11:31Z",
      "updated_at": "2026-07-18T14:11:31Z"
    }
    ```

    ### Possible Error Responses
    - **401 Unauthorized**: Invalid or expired access token.
    - **404 Not Found**: Linked account or category UUID not found.
    - **400 Bad Request**: Invalid parameters.
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
    ### Description
    Update details for a transaction. Reverts historical balance adjustments and applies new adjustments atomically.

    ### Validation Rules
    - **amount**: Optional. Greater than zero.

    ### Professional Request Example
    ```json
    {
      "amount": 480.0,
      "notes": "Price increased"
    }
    ```

    ### Professional Response Example
    ```json
    {
      "id": "e4a2d5cf-72b1-4c6e-8e3d-0d62bf3f9829",
      "user_id": "87c3e5df-c49b-4e16-ba62-a548323c21a4",
      "account_id": "87c3e5df-c49b-4e16-ba62-a548323c21a5",
      "category_id": "c1a2d5cf-72b1-4c6e-8e3d-0d62bf3f9830",
      "merchant": "McDonald's",
      "amount": 480.0,
      "transaction_type": "Expense",
      "payment_method": "UPI",
      "transaction_date": "2026-07-18T14:11:31Z",
      "description": "Big Mac Meal",
      "notes": "Price increased",
      "location": "Ahmedabad",
      "ai_predicted_category": null,
      "prediction_confidence": null,
      "is_user_corrected": false,
      "receipt_image": "",
      "created_at": "2026-07-18T14:11:31Z",
      "updated_at": "2026-07-18T14:11:31Z"
    }
    ```

    ### Possible Error Responses
    - **401 Unauthorized**: Invalid or expired access token.
    - **404 Not Found**: Transaction, account or category not found.
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
    ### Description
    Delete a ledger entry. Reverts all balances affected by this transaction before deleting.

    ### Professional Response Example
    ```json
    {
      "message": "Transaction successfully deleted."
    }
    ```

    ### Possible Error Responses
    - **401 Unauthorized**: Invalid or expired access token.
    - **404 Not Found**: Transaction UUID not found.
    """
    service = TransactionService(db)
    service.delete_transaction(id, current_user.id)
    return {"message": "Transaction successfully deleted."}
