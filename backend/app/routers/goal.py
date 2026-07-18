from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from app.database.database import get_db
from app.schemas.goal import GoalCreate, GoalUpdate, GoalResponse, GoalContributionCreate, GoalContributionResponse
from app.services.goal import GoalService
from app.api.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/goals", tags=["Goals"])

@router.get("", response_model=List[GoalResponse], summary="List all financial goals")
def list_goals(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    ### Description
    Retrieve all savings goals created by the current user.

    ### Professional Response Example
    ```json
    [
      {
        "id": "e4a2d5cf-72b1-4c6e-8e3d-0d62bf3f9829",
        "user_id": "87c3e5df-c49b-4e16-ba62-a548323c21a4",
        "title": "Buy Laptop",
        "goal_type": "Purchase",
        "target_amount": 120000.0,
        "current_amount": 30000.0,
        "target_date": "2027-03-01",
        "priority": "High",
        "goal_status": "In Progress",
        "auto_save": true,
        "monthly_target": 5000.0,
        "notes": "MacBook Pro",
        "created_at": "2026-07-18T14:11:31Z",
        "updated_at": "2026-07-18T14:11:31Z",
        "contributions": []
      }
    ]
    ```

    ### Possible Error Responses
    - **401 Unauthorized**: Invalid or expired access token.
    """
    service = GoalService(db)
    return service.list_goals(current_user.id)


@router.get("/{id}", response_model=GoalResponse, summary="Get details for a financial goal")
def get_goal(
    id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    ### Description
    Fetch progress and configurations for a single goal by UUID.

    ### Professional Response Example
    ```json
    {
      "id": "e4a2d5cf-72b1-4c6e-8e3d-0d62bf3f9829",
      "user_id": "87c3e5df-c49b-4e16-ba62-a548323c21a4",
      "title": "Buy Laptop",
      "goal_type": "Purchase",
      "target_amount": 120000.0,
      "current_amount": 30000.0,
      "target_date": "2027-03-01",
      "priority": "High",
      "goal_status": "In Progress",
      "auto_save": true,
      "monthly_target": 5000.0,
      "notes": "MacBook Pro",
      "created_at": "2026-07-18T14:11:31Z",
      "updated_at": "2026-07-18T14:11:31Z",
      "contributions": [
        {
          "id": "f5b3d6df-83c2-5d7f-9f4e-1e73cf4f0930",
          "goal_id": "e4a2d5cf-72b1-4c6e-8e3d-0d62bf3f9829",
          "transaction_id": null,
          "amount": 30000.0,
          "contribution_date": "2026-07-18T14:11:31Z",
          "created_at": "2026-07-18T14:11:31Z"
        }
      ]
    }
    ```

    ### Possible Error Responses
    - **401 Unauthorized**: Invalid or expired access token.
    - **404 Not Found**: Goal UUID not found.
    """
    service = GoalService(db)
    return service.get_goal(id, current_user.id)


@router.post(
    "", 
    response_model=GoalResponse, 
    status_code=status.HTTP_201_CREATED, 
    summary="Create a new financial goal"
)
def create_goal(
    data: GoalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    ### Description
    Initialize a new target savings milestone.

    ### Validation Rules
    - **title**: Length between 1 and 100.
    - **target_amount**: Greater than zero.
    - **current_amount**: Greater than or equal to zero.
    - **priority**: One of: `High`, `Medium`, `Low`.
    - **goal_status**: One of: `In Progress`, `Completed`, `Abandoned`.

    ### Professional Request Example
    ```json
    {
      "title": "Buy Laptop",
      "goal_type": "Purchase",
      "target_amount": 120000.0,
      "current_amount": 30000.0,
      "target_date": "2027-03-01",
      "priority": "High",
      "goal_status": "In Progress",
      "auto_save": true,
      "monthly_target": 5000.0,
      "notes": "MacBook Pro"
    }
    ```

    ### Professional Response Example
    ```json
    {
      "id": "e4a2d5cf-72b1-4c6e-8e3d-0d62bf3f9829",
      "user_id": "87c3e5df-c49b-4e16-ba62-a548323c21a4",
      "title": "Buy Laptop",
      "goal_type": "Purchase",
      "target_amount": 120000.0,
      "current_amount": 30000.0,
      "target_date": "2027-03-01",
      "priority": "High",
      "goal_status": "In Progress",
      "auto_save": true,
      "monthly_target": 5000.0,
      "notes": "MacBook Pro",
      "created_at": "2026-07-18T14:11:31Z",
      "updated_at": "2026-07-18T14:11:31Z",
      "contributions": []
    }
    ```

    ### Possible Error Responses
    - **401 Unauthorized**: Invalid or expired access token.
    - **400 Bad Request**: Invalid parameters.
    """
    service = GoalService(db)
    return service.create_goal(current_user.id, data)


@router.put("/{id}", response_model=GoalResponse, summary="Update financial goal details")
def update_goal(
    id: UUID,
    data: GoalUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    ### Description
    Modify goal properties, milestones, target dates, or status configurations.

    ### Validation Rules
    - **target_amount**: Optional. Greater than zero.
    - **priority**: Optional. One of: `High`, `Medium`, `Low`.

    ### Professional Request Example
    ```json
    {
      "current_amount": 35000.0,
      "priority": "Medium"
    }
    ```

    ### Professional Response Example
    ```json
    {
      "id": "e4a2d5cf-72b1-4c6e-8e3d-0d62bf3f9829",
      "user_id": "87c3e5df-c49b-4e16-ba62-a548323c21a4",
      "title": "Buy Laptop",
      "goal_type": "Purchase",
      "target_amount": 120000.0,
      "current_amount": 35000.0,
      "target_date": "2027-03-01",
      "priority": "Medium",
      "goal_status": "In Progress",
      "auto_save": true,
      "monthly_target": 5000.0,
      "notes": "MacBook Pro",
      "created_at": "2026-07-18T14:11:31Z",
      "updated_at": "2026-07-18T14:11:31Z",
      "contributions": []
    }
    ```

    ### Possible Error Responses
    - **401 Unauthorized**: Invalid or expired access token.
    - **404 Not Found**: Goal UUID not found.
    """
    service = GoalService(db)
    return service.update_goal(id, current_user.id, data)


@router.delete("/{id}", status_code=status.HTTP_200_OK, summary="Remove a financial goal")
def delete_goal(
    id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    ### Description
    Delete a savings target milestone, cascading to clear goal contribution records.

    ### Professional Response Example
    ```json
    {
      "message": "Goal successfully deleted."
    }
    ```

    ### Possible Error Responses
    - **401 Unauthorized**: Invalid or expired access token.
    - **404 Not Found**: Goal UUID not found.
    """
    service = GoalService(db)
    service.delete_goal(id, current_user.id)
    return {"message": "Goal successfully deleted."}


@router.post(
    "/{id}/contributions", 
    response_model=GoalContributionResponse, 
    status_code=status.HTTP_201_CREATED, 
    summary="Add a savings contribution to a goal"
)
def add_contribution(
    id: UUID,
    data: GoalContributionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    ### Description
    Record saving additions (positive values) or drawdowns (negative values) against a goal.

    ### Validation Rules
    - **amount**: Cannot be zero.

    ### Professional Request Example
    ```json
    {
      "amount": 5000.0
    }
    ```

    ### Professional Response Example
    ```json
    {
      "id": "f5b3d6df-83c2-5d7f-9f4e-1e73cf4f0930",
      "goal_id": "e4a2d5cf-72b1-4c6e-8e3d-0d62bf3f9829",
      "transaction_id": null,
      "amount": 5000.0,
      "contribution_date": "2026-07-18T14:11:31Z",
      "created_at": "2026-07-18T14:11:31Z"
    }
    ```

    ### Possible Error Responses
    - **401 Unauthorized**: Invalid or expired access token.
    - **404 Not Found**: Goal UUID not found.
    """
    service = GoalService(db)
    return service.add_goal_contribution(id, current_user.id, data)
