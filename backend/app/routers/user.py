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
    ### Description
    Updates configuration variables (name, preferred currency, timezone, occupation, income) for the active profile.

    ### Validation Rules
    - **full_name**: Optional. Length must be between 2 and 100 characters.
    - **monthly_income**: Optional. Must be greater than or equal to zero.
    - **preferred_currency**: Optional. Must be a 3-letter currency ISO code (e.g. INR, USD).

    ### Professional Request Example
    ```json
    {
      "full_name": "Man Dhanani",
      "phone": "+919876543210",
      "occupation": "Student",
      "monthly_income": 60000.0,
      "preferred_currency": "INR",
      "language": "English",
      "timezone": "Asia/Kolkata",
      "profile_photo": "https://example.com/profiles/avatar.png"
    }
    ```

    ### Professional Response Example
    ```json
    {
      "id": "e4a2d5cf-72b1-4c6e-8e3d-0d62bf3f9829",
      "email": "mandhanani07@gmail.com",
      "full_name": "Man Dhanani",
      "is_active": true,
      "is_verified": false,
      "preferred_currency": "INR",
      "timezone": "Asia/Kolkata",
      "phone": "+919876543210",
      "occupation": "Student",
      "monthly_income": 60000.0,
      "language": "English",
      "profile_photo": "https://example.com/profiles/avatar.png",
      "last_login": "2026-07-18T14:11:31Z",
      "created_at": "2026-07-17T18:07:10Z",
      "updated_at": "2026-07-18T14:11:31Z"
    }
    ```

    ### Possible Error Responses
    - **401 Unauthorized**: Invalid or expired access token.
    - **400 Bad Request**: Invalid currency code or negative income.
    """
    service = UserService(db)
    return service.update_profile(current_user, update_data)


@router.delete("/me", status_code=status.HTTP_200_OK, summary="Deactivate user profile (soft-delete)")
def deactivate_me(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    ### Description
    Deactivates the user profile, setting the active status to false. This acts as a security soft-deletion.

    ### Professional Response Example
    ```json
    {
      "message": "Account successfully deactivated."
    }
    ```

    ### Possible Error Responses
    - **401 Unauthorized**: Invalid or expired access token.
    """
    service = UserService(db)
    service.deactivate_user(current_user)
    return {"message": "Account successfully deactivated."}
