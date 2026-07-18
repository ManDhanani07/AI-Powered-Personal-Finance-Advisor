from fastapi import APIRouter, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.schemas.auth import UserRegister, UserLogin, UserResponse, TokenResponse, TokenRefreshRequest
from app.services.auth import register_user, authenticate_user, create_user_session, refresh_user_session, revoke_user_session
from app.api.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post(
    "/register", 
    response_model=UserResponse, 
    status_code=status.HTTP_201_CREATED, 
    summary="Register a new user account"
)
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    """
    ### Description
    Registers a new user account in the system.

    ### Validation Rules
    - **email**: Must be a valid email string format.
    - **full_name**: Length must be between 2 and 100 characters.
    - **password**: Minimum 8 characters. Must contain at least one uppercase letter, one lowercase letter, one digit, and one special character (`@$!%*?&#`).
    - **preferred_currency**: Must be a 3-letter currency ISO code (e.g. INR, USD).

    ### Professional Request Example
    ```json
    {
      "email": "mandhanani07@gmail.com",
      "full_name": "Man Dhanani",
      "password": "Man@@@17",
      "phone": "+919876543210",
      "occupation": "Student",
      "monthly_income": 50000.0,
      "preferred_currency": "INR",
      "language": "English",
      "timezone": "Asia/Kolkata"
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
      "monthly_income": 50000.0,
      "language": "English",
      "profile_photo": null,
      "last_login": null,
      "created_at": "2026-07-18T14:11:31Z",
      "updated_at": "2026-07-18T14:11:31Z"
    }
    ```

    ### Possible Error Responses
    - **400 Bad Request**: Invalid email pattern, weak password strength, or currency ISO formatting.
    - **409 Conflict**: Email already registered.
    """
    return register_user(db, user_data)


@router.post(
    "/login", 
    response_model=TokenResponse, 
    summary="User login (OAuth2 form-data / Swagger UI compatible)"
)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """
    ### Description
    Authenticate user using standard form-data (OAuth2 format).

    ### Validation Rules
    - **username**: Must be the user's email address.
    - **password**: Standard password string.

    ### Professional Request Example
    - Body parameters passed as form-data:
      - `username`: `mandhanani07@gmail.com`
      - `password`: `Man@@@17`

    ### Professional Response Example
    ```json
    {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJtYW5kaGFuYW5pMDdAZ21haWwuY29tIn0.xxxx",
      "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJtYW5kaGFuYW5pMDdAZ21haWwuY29tIn0.yyyy",
      "token_type": "bearer"
    }
    ```

    ### Possible Error Responses
    - **401 Unauthorized**: Incorrect email or password.
    """
    login_data = UserLogin(email=form_data.username, password=form_data.password)
    user = authenticate_user(db, login_data)
    return create_user_session(db, user)


@router.post(
    "/login/json", 
    response_model=TokenResponse, 
    summary="User login (JSON body compatible)"
)
def login_json(login_data: UserLogin, db: Session = Depends(get_db)):
    """
    ### Description
    Authenticate user using a raw JSON body request.

    ### Validation Rules
    - **email**: Must be a valid email string format.
    - **password**: Standard password string.

    ### Professional Request Example
    ```json
    {
      "email": "mandhanani07@gmail.com",
      "password": "Man@@@17"
    }
    ```

    ### Professional Response Example
    ```json
    {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJtYW5kaGFuYW5pMDdAZ21haWwuY29tIn0.xxxx",
      "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJtYW5kaGFuYW5pMDdAZ21haWwuY29tIn0.yyyy",
      "token_type": "bearer"
    }
    ```

    ### Possible Error Responses
    - **401 Unauthorized**: Incorrect email or password.
    """
    user = authenticate_user(db, login_data)
    return create_user_session(db, user)


@router.post(
    "/refresh", 
    response_model=TokenResponse, 
    summary="Issue a new access token via Refresh Token Rotation"
)
def refresh(refresh_data: TokenRefreshRequest, db: Session = Depends(get_db)):
    """
    ### Description
    Receives a valid refresh token, revokes it, and issues a new access token / refresh token pair.

    ### Validation Rules
    - **refresh_token**: Must be a valid active refresh token.

    ### Professional Request Example
    ```json
    {
      "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJtYW5kaGFuYW5pMDdAZ21haWwuY29tIn0.yyyy"
    }
    ```

    ### Professional Response Example
    ```json
    {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJtYW5kaGFuYW5pMDdAZ21haWwuY29tIn0.zzzz",
      "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJtYW5kaGFuYW5pMDdAZ21haWwuY29tIn0.aaaa",
      "token_type": "bearer"
    }
    ```

    ### Possible Error Responses
    - **401 Unauthorized**: Refresh token is expired, invalid, or has been revoked.
    """
    return refresh_user_session(db, refresh_data.refresh_token)


@router.post(
    "/logout", 
    status_code=status.HTTP_200_OK, 
    summary="Log out and invalidate user session"
)
def logout(refresh_data: TokenRefreshRequest, db: Session = Depends(get_db)):
    """
    ### Description
    Revokes the provided refresh token, invalidating the session in the database.

    ### Validation Rules
    - **refresh_token**: Must be a valid active refresh token.

    ### Professional Request Example
    ```json
    {
      "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJtYW5kaGFuYW5pMDdAZ21haWwuY29tIn0.aaaa"
    }
    ```

    ### Professional Response Example
    ```json
    {
      "message": "Session successfully revoked."
    }
    ```

    ### Possible Error Responses
    - **401 Unauthorized**: Token is invalid or expired.
    """
    revoke_user_session(db, refresh_data.refresh_token)
    return {"message": "Session successfully revoked."}


@router.get(
    "/me", 
    response_model=UserResponse, 
    summary="Retrieve current user profile data"
)
def get_me(current_user: User = Depends(get_current_user)):
    """
    ### Description
    Retrieve authenticated user profile parameters. Requires a valid JWT access token.

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
      "monthly_income": 50000.0,
      "language": "English",
      "profile_photo": "https://example.com/profiles/avatar.png",
      "last_login": "2026-07-18T14:11:31Z",
      "created_at": "2026-07-17T18:07:10Z",
      "updated_at": "2026-07-18T14:11:31Z"
    }
    ```

    ### Possible Error Responses
    - **401 Unauthorized**: Invalid or expired access token.
    """
    return current_user
