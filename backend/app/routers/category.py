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
    category_type: Optional[str] = Query(None, description="Filter categories by type: Expense, Income, Investment, Transfer"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    ### Description
    Fetch all visible categories (combining default global categories and custom ones created by the user).

    ### Professional Response Example
    ```json
    [
      {
        "id": "e4a2d5cf-72b1-4c6e-8e3d-0d62bf3f9829",
        "user_id": null,
        "parent_id": null,
        "name": "Food",
        "category_type": "Expense",
        "icon": "🍔",
        "color": "#FF9800",
        "is_default": true,
        "created_at": "2026-07-18T14:11:31Z",
        "updated_at": "2026-07-18T14:11:31Z"
      }
    ]
    ```

    ### Possible Error Responses
    - **401 Unauthorized**: Invalid or expired access token.
    """
    service = CategoryService(db)
    return service.list_categories(current_user.id, category_type)


@router.get("/{id}", response_model=CategoryResponse, summary="Get details for a specific category")
def get_category(
    id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    ### Description
    Retrieve classification metadata for a specific category UUID, verifying visibility permission.

    ### Professional Response Example
    ```json
    {
      "id": "e4a2d5cf-72b1-4c6e-8e3d-0d62bf3f9829",
      "user_id": null,
      "parent_id": null,
      "name": "Food",
      "category_type": "Expense",
      "icon": "🍔",
      "color": "#FF9800",
      "is_default": true,
      "created_at": "2026-07-18T14:11:31Z",
      "updated_at": "2026-07-18T14:11:31Z"
    }
    ```

    ### Possible Error Responses
    - **401 Unauthorized**: Invalid or expired access token.
    - **404 Not Found**: Category not found or user lacks permission to access it.
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
    ### Description
    Configure a custom category. Duplicate names under the same nesting level are rejected.

    ### Validation Rules
    - **name**: Must be between 1 and 50 characters.
    - **category_type**: Must be one of: `Expense`, `Income`, `Investment`, `Transfer`.
    - **color**: Must be a valid hex color code (e.g. `#FF9800`).

    ### Professional Request Example
    ```json
    {
      "name": "Food",
      "icon": "🍔",
      "color": "#FF9800",
      "category_type": "Expense",
      "is_default": false
    }
    ```

    ### Professional Response Example
    ```json
    {
      "id": "c1a2d5cf-72b1-4c6e-8e3d-0d62bf3f9830",
      "user_id": "87c3e5df-c49b-4e16-ba62-a548323c21a4",
      "parent_id": null,
      "name": "Food",
      "category_type": "Expense",
      "icon": "🍔",
      "color": "#FF9800",
      "is_default": false,
      "created_at": "2026-07-18T14:11:31Z",
      "updated_at": "2026-07-18T14:11:31Z"
    }
    ```

    ### Possible Error Responses
    - **401 Unauthorized**: Invalid or expired access token.
    - **400 Bad Request**: Invalid parameters or hex color code.
    - **409 Conflict**: A category with the same name already exists.
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
    ### Description
    Modify category settings (e.g. name, color hex). System-wide default categories are read-only.

    ### Validation Rules
    - **name**: Optional. Length 1 to 50.
    - **category_type**: Optional. One of: `Expense`, `Income`, `Investment`, `Transfer`.

    ### Professional Request Example
    ```json
    {
      "name": "Organic Food",
      "color": "#4CAF50"
    }
    ```

    ### Professional Response Example
    ```json
    {
      "id": "c1a2d5cf-72b1-4c6e-8e3d-0d62bf3f9830",
      "user_id": "87c3e5df-c49b-4e16-ba62-a548323c21a4",
      "parent_id": null,
      "name": "Organic Food",
      "category_type": "Expense",
      "icon": "🍔",
      "color": "#4CAF50",
      "is_default": false,
      "created_at": "2026-07-18T14:11:31Z",
      "updated_at": "2026-07-18T14:11:31Z"
    }
    ```

    ### Possible Error Responses
    - **401 Unauthorized**: Invalid or expired access token.
    - **404 Not Found**: Category not found.
    - **400 Bad Request**: Read-only standard categories cannot be updated.
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
    ### Description
    Delete a user custom category. Fails if standard system-wide categories are targeted, or if transaction records rely on it.

    ### Professional Response Example
    ```json
    {
      "message": "Category successfully deleted."
    }
    ```

    ### Possible Error Responses
    - **401 Unauthorized**: Invalid or expired access token.
    - **404 Not Found**: Category not found.
    - **400 Bad Request**: Standard categories cannot be deleted, or active transactions depend on it.
    """
    service = CategoryService(db)
    service.delete_category(id, current_user.id)
    return {"message": "Category successfully deleted."}
