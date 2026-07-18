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
    ### Description
    List all active financial accounts (assets & liabilities) owned by the current user.

    ### Professional Response Example
    ```json
    [
      {
        "id": "e4a2d5cf-72b1-4c6e-8e3d-0d62bf3f9829",
        "user_id": "87c3e5df-c49b-4e16-ba62-a548323c21a4",
        "name": "HDFC Savings",
        "institution": "HDFC Bank",
        "account_type": "Savings",
        "balance": 50000.0,
        "currency": "INR",
        "is_default": true,
        "created_at": "2026-07-18T14:11:31Z",
        "updated_at": "2026-07-18T14:11:31Z"
      }
    ]
    ```

    ### Possible Error Responses
    - **401 Unauthorized**: Invalid or expired access token.
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
    ### Description
    Fetch structural and balance details for an account by its unique UUID.

    ### Professional Response Example
    ```json
    {
      "id": "e4a2d5cf-72b1-4c6e-8e3d-0d62bf3f9829",
      "user_id": "87c3e5df-c49b-4e16-ba62-a548323c21a4",
      "name": "HDFC Savings",
      "institution": "HDFC Bank",
      "account_type": "Savings",
      "balance": 50000.0,
      "currency": "INR",
      "is_default": true,
      "created_at": "2026-07-18T14:11:31Z",
      "updated_at": "2026-07-18T14:11:31Z"
    }
    ```

    ### Possible Error Responses
    - **401 Unauthorized**: Invalid or expired access token.
    - **404 Not Found**: Account UUID not found or does not belong to the user.
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
    ### Description
    Initialize a new account ledger (checking, savings, cash, credit cards, wallet, investment).

    ### Validation Rules
    - **name**: Must be between 1 and 100 characters.
    - **account_type**: Must be one of: `Savings`, `Current`, `Cash`, `Credit Card`, `Wallet`, `Investment`.
    - **currency**: Must be a 3-letter currency ISO code.

    ### Professional Request Example
    ```json
    {
      "name": "HDFC Savings",
      "institution": "HDFC Bank",
      "account_type": "Savings",
      "balance": 50000.0,
      "currency": "INR",
      "is_default": true
    }
    ```

    ### Professional Response Example
    ```json
    {
      "id": "e4a2d5cf-72b1-4c6e-8e3d-0d62bf3f9829",
      "user_id": "87c3e5df-c49b-4e16-ba62-a548323c21a4",
      "name": "HDFC Savings",
      "institution": "HDFC Bank",
      "account_type": "Savings",
      "balance": 50000.0,
      "currency": "INR",
      "is_default": true,
      "created_at": "2026-07-18T14:11:31Z",
      "updated_at": "2026-07-18T14:11:31Z"
    }
    ```

    ### Possible Error Responses
    - **401 Unauthorized**: Invalid or expired access token.
    - **400 Bad Request**: Invalid parameters or invalid type.
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
    ### Description
    Modify parameters like friendly name, custom limits, or balance thresholds.

    ### Validation Rules
    - **name**: Optional. Length 1 to 100.
    - **account_type**: Optional. One of: `Savings`, `Current`, `Cash`, `Credit Card`, `Wallet`, `Investment`.

    ### Professional Request Example
    ```json
    {
      "name": "HDFC Savings Revised",
      "balance": 55000.0
    }
    ```

    ### Professional Response Example
    ```json
    {
      "id": "e4a2d5cf-72b1-4c6e-8e3d-0d62bf3f9829",
      "user_id": "87c3e5df-c49b-4e16-ba62-a548323c21a4",
      "name": "HDFC Savings Revised",
      "institution": "HDFC Bank",
      "account_type": "Savings",
      "balance": 55000.0,
      "currency": "INR",
      "is_default": true,
      "created_at": "2026-07-18T14:11:31Z",
      "updated_at": "2026-07-18T14:11:31Z"
    }
    ```

    ### Possible Error Responses
    - **401 Unauthorized**: Invalid or expired access token.
    - **404 Not Found**: Account UUID not found.
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
    ### Description
    Remove an account. Will fail with HTTP 400 if the account contains active transaction records.

    ### Professional Response Example
    ```json
    {
      "message": "Account successfully deleted."
    }
    ```

    ### Possible Error Responses
    - **401 Unauthorized**: Invalid or expired access token.
    - **404 Not Found**: Account UUID not found.
    - **400 Bad Request**: Account cannot be deleted because transaction records rely on it.
    """
    service = AccountService(db)
    service.delete_account(id, current_user.id)
    return {"message": "Account successfully deleted."}
