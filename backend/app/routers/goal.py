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
    Retrieve all savings goals created by the current user.
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
    Fetch progress and configurations for a single goal by UUID.
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
    Initialize a new target savings milestone.
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
    Modify goal properties, milestones, target dates, or status configurations.
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
    Delete a savings target milestone, cascading to clear goal contribution records.
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
    Record saving additions (positive values) or drawdowns (negative values) against a goal.
    """
    service = GoalService(db)
    return service.add_goal_contribution(id, current_user.id, data)
