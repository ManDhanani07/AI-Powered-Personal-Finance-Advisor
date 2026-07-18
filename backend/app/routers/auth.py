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
    Registers a new user account in the system.
    
    Validates email format and password strength policies.
    """
    return register_user(db, user_data)


@router.post(
    "/login", 
    response_model=TokenResponse, 
    summary="User login (OAuth2 form-data / Swagger UI compatible)"
)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """
    Authenticate user using standard form-data (OAuth2 format).
    
    * **username**: The user's email address
    * **password**: The user's password
    
    Required for authorization features inside the `/docs` Swagger UI.
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
    Authenticate user using a raw JSON body request.
    
    Preferred format for API integration with frontend clients (React/Vite).
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
    Receives a valid refresh token, revokes it, and issues a new access token / refresh token pair.
    """
    return refresh_user_session(db, refresh_data.refresh_token)


@router.post(
    "/logout", 
    status_code=status.HTTP_200_OK, 
    summary="Log out and invalidate user session"
)
def logout(refresh_data: TokenRefreshRequest, db: Session = Depends(get_db)):
    """
    Revokes the provided refresh token, invalidating the session in the database.
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
    Retrieve authenticated user profile parameters. Requires a valid JWT access token.
    """
    return current_user
