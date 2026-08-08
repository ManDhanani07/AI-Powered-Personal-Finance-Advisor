"""
Authentication API Endpoints v1.
Endpoints for user registration, authentication, logout, token refresh, password resets, and user profile.
"""

from fastapi import APIRouter, Depends, status
from app.dependencies.service import get_auth_service
from app.dependencies.auth import get_current_user
from app.services.auth_service import AuthService
from app.models.user import User
from app.schemas.base import APIResponse
from app.schemas.auth import (
    RegisterRequest,
    LoginRequest,
    LoginResponse,
    TokenResponse,
    RefreshTokenRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    ChangePasswordRequest,
    GoogleOAuthRequest,
    UserResponse,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/google",
    response_model=APIResponse[LoginResponse],
    status_code=status.HTTP_200_OK,
    summary="Authenticate via Google OAuth",
    description="Verifies Google OAuth token, authenticates existing user or registers a new verified account.",
)
async def google_oauth_login(
    payload: GoogleOAuthRequest,
    auth_service: AuthService = Depends(get_auth_service),
):
    login_res = await auth_service.google_oauth_login(payload.id_token)
    return APIResponse(
        success=True,
        message="Google OAuth login successful",
        data=login_res,
    )


@router.post(
    "/register",
    response_model=APIResponse[LoginResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user account",
    description="Registers a new user, validates email uniqueness and password strength, hashes password, and issues JWT tokens.",
)
async def register(
    payload: RegisterRequest,
    auth_service: AuthService = Depends(get_auth_service),
):
    # Register user
    user_res = await auth_service.register_user(payload)
    
    # Auto-login newly registered user
    login_req = LoginRequest(email=payload.email, password=payload.password, remember_me=False)
    login_res = await auth_service.authenticate_user(login_req)

    return APIResponse(
        success=True,
        message="User registered successfully",
        data=login_res,
    )


@router.post(
    "/login",
    response_model=APIResponse[LoginResponse],
    status_code=status.HTTP_200_OK,
    summary="Authenticate user and issue JWT tokens",
    description="Validates email and password, enforces 15-minute account locking after 5 failed attempts, updates last login, and returns Access and Refresh tokens.",
)
async def login(
    payload: LoginRequest,
    auth_service: AuthService = Depends(get_auth_service),
):
    login_res = await auth_service.authenticate_user(payload)
    return APIResponse(
        success=True,
        message="Login successful",
        data=login_res,
    )


@router.post(
    "/logout",
    response_model=APIResponse[dict],
    status_code=status.HTTP_200_OK,
    summary="Logout user and revoke refresh token",
    description="Revokes stored user refresh token and invalidates active session.",
)
async def logout(
    current_user: User = Depends(get_current_user),
    auth_service: AuthService = Depends(get_auth_service),
):
    await auth_service.logout_user(current_user.id)
    return APIResponse(
        success=True,
        message="Logged out successfully",
        data={"user_id": str(current_user.id)},
    )


@router.post(
    "/refresh",
    response_model=APIResponse[TokenResponse],
    status_code=status.HTTP_200_OK,
    summary="Refresh access token",
    description="Accepts a valid refresh token and issues a new access and refresh token pair.",
)
async def refresh_token(
    payload: RefreshTokenRequest,
    auth_service: AuthService = Depends(get_auth_service),
):
    tokens = await auth_service.refresh_tokens(payload.refresh_token)
    return APIResponse(
        success=True,
        message="Tokens refreshed successfully",
        data=tokens,
    )


@router.post(
    "/forgot-password",
    response_model=APIResponse[dict],
    status_code=status.HTTP_200_OK,
    summary="Request password reset token",
    description="Generates a password reset token for the specified email address.",
)
async def forgot_password(
    payload: ForgotPasswordRequest,
    auth_service: AuthService = Depends(get_auth_service),
):
    reset_token = await auth_service.forgot_password(payload.email)
    return APIResponse(
        success=True,
        message="If an account with that email exists, a password reset token has been generated.",
        data={"reset_token": reset_token},
    )


@router.post(
    "/reset-password",
    response_model=APIResponse[dict],
    status_code=status.HTTP_200_OK,
    summary="Reset password using token",
    description="Validates the password reset token and updates the user's password.",
)
async def reset_password(
    payload: ResetPasswordRequest,
    auth_service: AuthService = Depends(get_auth_service),
):
    await auth_service.reset_password(payload.token, payload.new_password)
    return APIResponse(
        success=True,
        message="Password reset successfully. You can now log in with your new password.",
        data={"reset": True},
    )


@router.post(
    "/change-password",
    response_model=APIResponse[dict],
    status_code=status.HTTP_200_OK,
    summary="Change user password (Authenticated)",
    description="Verifies the user's current password and updates it to a new password.",
)
async def change_password(
    payload: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    auth_service: AuthService = Depends(get_auth_service),
):
    await auth_service.change_password(current_user.id, payload.old_password, payload.new_password)
    return APIResponse(
        success=True,
        message="Password changed successfully.",
        data={"updated": True},
    )


@router.get(
    "/me",
    response_model=APIResponse[UserResponse],
    status_code=status.HTTP_200_OK,
    summary="Get current user profile",
    description="Returns the authenticated user's profile details.",
)
async def get_me(
    current_user: User = Depends(get_current_user),
):
    user_res = UserResponse.model_validate(current_user)
    return APIResponse(
        success=True,
        message="User profile retrieved successfully",
        data=user_res,
    )
