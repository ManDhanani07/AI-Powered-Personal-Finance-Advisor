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
    ### Description
    Get all category budgets created by the user.

    ### Professional Response Example
    ```json
    [
      {
        "id": "e4a2d5cf-72b1-4c6e-8e3d-0d62bf3f9829",
        "user_id": "87c3e5df-c49b-4e16-ba62-a548323c21a4",
        "category_id": "c1a2d5cf-72b1-4c6e-8e3d-0d62bf3f9830",
        "monthly_limit": 6000.0,
        "warning_percentage": 80,
        "month": 7,
        "year": 2026,
        "currency": "INR",
        "created_at": "2026-07-18T14:11:31Z",
        "updated_at": "2026-07-18T14:11:31Z"
      }
    ]
    ```

    ### Possible Error Responses
    - **401 Unauthorized**: Invalid or expired access token.
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
    ### Description
    Retrieve settings for a budget by UUID.

    ### Professional Response Example
    ```json
    {
      "id": "e4a2d5cf-72b1-4c6e-8e3d-0d62bf3f9829",
      "user_id": "87c3e5df-c49b-4e16-ba62-a548323c21a4",
      "category_id": "c1a2d5cf-72b1-4c6e-8e3d-0d62bf3f9830",
      "monthly_limit": 6000.0,
      "warning_percentage": 80,
      "month": 7,
      "year": 2026,
      "currency": "INR",
      "created_at": "2026-07-18T14:11:31Z",
      "updated_at": "2026-07-18T14:11:31Z"
    }
    ```

    ### Possible Error Responses
    - **401 Unauthorized**: Invalid or expired access token.
    - **404 Not Found**: Budget UUID not found.
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
    ### Description
    Create a new spending threshold boundary on a transaction category.

    ### Validation Rules
    - **monthly_limit**: Must be greater than zero.
    - **warning_percentage**: Between 1 and 100.
    - **month**: Calendar month integer 1 to 12.
    - **year**: Calendar year integer 2000 to 2100.
    - **currency**: 3-letter currency ISO code.

    ### Professional Request Example
    ```json
    {
      "category_id": "c1a2d5cf-72b1-4c6e-8e3d-0d62bf3f9830",
      "monthly_limit": 6000.0,
      "warning_percentage": 80,
      "month": 7,
      "year": 2026,
      "currency": "INR"
    }
    ```

    ### Professional Response Example
    ```json
    {
      "id": "e4a2d5cf-72b1-4c6e-8e3d-0d62bf3f9829",
      "user_id": "87c3e5df-c49b-4e16-ba62-a548323c21a4",
      "category_id": "c1a2d5cf-72b1-4c6e-8e3d-0d62bf3f9830",
      "monthly_limit": 6000.0,
      "warning_percentage": 80,
      "month": 7,
      "year": 2026,
      "currency": "INR",
      "created_at": "2026-07-18T14:11:31Z",
      "updated_at": "2026-07-18T14:11:31Z"
    }
    ```

    ### Possible Error Responses
    - **401 Unauthorized**: Invalid or expired access token.
    - **404 Not Found**: Category UUID not found.
    - **409 Conflict**: Duplicate budget entry for user/category in a single month and year.
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
    ### Description
    Update target category, limit sizes, or date bounds.

    ### Validation Rules
    - **monthly_limit**: Optional. Greater than zero.
    - **warning_percentage**: Optional. Between 1 and 100.

    ### Professional Request Example
    ```json
    {
      "monthly_limit": 7000.0,
      "warning_percentage": 85
    }
    ```

    ### Professional Response Example
    ```json
    {
      "id": "e4a2d5cf-72b1-4c6e-8e3d-0d62bf3f9829",
      "user_id": "87c3e5df-c49b-4e16-ba62-a548323c21a4",
      "category_id": "c1a2d5cf-72b1-4c6e-8e3d-0d62bf3f9830",
      "monthly_limit": 7000.0,
      "warning_percentage": 85,
      "month": 7,
      "year": 2026,
      "currency": "INR",
      "created_at": "2026-07-18T14:11:31Z",
      "updated_at": "2026-07-18T14:11:31Z"
    }
    ```

    ### Possible Error Responses
    - **401 Unauthorized**: Invalid or expired access token.
    - **404 Not Found**: Budget UUID not found.
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
    ### Description
    Remove a category budget configuration.

    ### Professional Response Example
    ```json
    {
      "message": "Budget successfully deleted."
    }
    ```

    ### Possible Error Responses
    - **401 Unauthorized**: Invalid or expired access token.
    - **404 Not Found**: Budget UUID not found.
    """
    service = BudgetService(db)
    service.delete_budget(id, current_user.id)
    return {"message": "Budget successfully deleted."}
