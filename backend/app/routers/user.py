from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.schemas.user import UserUpdate
from app.schemas.auth import UserResponse
from app.services.user import UserService
from app.api.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/users", tags=["Users"])

@router.put("/me", response_model=UserResponse, summary="Update current user profile")
def update_me(
    update_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Updates configuration variables (name, preferred currency, timezone) for the active profile.
    """
    service = UserService(db)
    return service.update_profile(current_user, update_data)


@router.delete("/me", status_code=status.HTTP_200_OK, summary="Deactivate user profile (soft-delete)")
def deactivate_me(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Deactivates the user profile, setting the active status to false. This acts as a security soft-deletion.
    """
    service = UserService(db)
    service.deactivate_user(current_user)
    return {"message": "Account successfully deactivated."}
