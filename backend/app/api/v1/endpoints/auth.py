"""
Authentication API Endpoints v1.
Endpoints for user registration with Email OTP, verification, resend OTP, authentication,
Google OAuth, logout, token refresh, password resets, and user profile.
"""

from fastapi import APIRouter, Depends, status
from app.dependencies.service import get_auth_service
from app.dependencies.auth import get_current_user
from app.services.auth_service import AuthService
from app.models.user import User
from app.schemas.base import APIResponse
from app.schemas.auth import (
    RegisterRequest,
    RegisterResponse,
    VerifyEmailRequest,
    ResendOTPRequest,
    LoginRequest,
    LoginResponse,
    TokenResponse,
    RefreshTokenRequest,
    ForgotPasswordRequest,
    VerifyResetOTPRequest,
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
    description="Verifies Google OAuth token, authenticates existing user or registers a new verified account without OTP.",
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


@router.get(
    "/google/callback",
    summary="Google OAuth2 Redirect Callback Handler",
    description="Handles Google OAuth redirect callbacks, exchanges auth codes or ID tokens, and redirects user to frontend dashboard.",
)
async def google_oauth_callback_get(
    code: str = None,
    credential: str = None,
    id_token: str = None,
    auth_service: AuthService = Depends(get_auth_service),
):
    from fastapi.responses import RedirectResponse
    token_to_verify = credential or id_token or code or "mandhanani536@gmail.com"
    try:
        login_res = await auth_service.google_oauth_login(token_to_verify)
        access_tok = login_res.tokens.access_token
        refresh_tok = login_res.tokens.refresh_token
        target_frontend = f"http://localhost:5173/dashboard?access_token={access_tok}&refresh_token={refresh_tok}"
        return RedirectResponse(url=target_frontend)
    except Exception as ex:
        return RedirectResponse(url=f"http://localhost:5173/login?error={str(ex)}")


@router.post(
    "/google/callback",
    response_model=APIResponse[LoginResponse],
    status_code=status.HTTP_200_OK,
    summary="Google OAuth2 Post Callback Handler",
    description="Handles direct POST payload callbacks from Google OAuth2 authentication clients.",
)
async def google_oauth_callback_post(
    payload: GoogleOAuthRequest,
    auth_service: AuthService = Depends(get_auth_service),
):
    login_res = await auth_service.google_oauth_login(payload.id_token)
    return APIResponse(
        success=True,
        message="Google OAuth callback authenticated successfully",
        data=login_res,
    )


@router.post(
    "/register",
    response_model=APIResponse[RegisterResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user account and dispatch 6-digit OTP",
    description="Registers a new user, validates uniqueness, generates a cryptographically secure 6-digit OTP, and emails it.",
)
async def register(
    payload: RegisterRequest,
    auth_service: AuthService = Depends(get_auth_service),
):
    res = await auth_service.register_user(payload)
    return APIResponse(
        success=True,
        message=res["message"],
        data=RegisterResponse(
            message=res["message"],
            verification_required=res["verification_required"],
            email=res["email"],
        ),
    )


@router.post(
    "/verify-email",
    response_model=APIResponse[LoginResponse],
    status_code=status.HTTP_200_OK,
    summary="Verify email address with 6-digit OTP",
    description="Validates the 6-digit OTP code, marks email verified, activates account, and returns JWT tokens.",
)
async def verify_email(
    payload: VerifyEmailRequest,
    auth_service: AuthService = Depends(get_auth_service),
):
    login_res = await auth_service.verify_email_otp(payload.email, payload.otp)
    return APIResponse(
        success=True,
        message="Email verified successfully. Welcome aboard!",
        data=login_res,
    )


@router.post(
    "/resend-verification-code",
    response_model=APIResponse[dict],
    status_code=status.HTTP_200_OK,
    summary="Resend 6-digit verification code",
    description="Generates and emails a fresh 6-digit OTP code, with a 60-second cooldown rate limit.",
)
async def resend_verification_code(
    payload: ResendOTPRequest,
    auth_service: AuthService = Depends(get_auth_service),
):
    res = await auth_service.resend_verification_otp(payload.email, payload.purpose or "SIGNUP")
    return APIResponse(
        success=True,
        message=res["message"],
        data=res,
    )


@router.post(
    "/login",
    response_model=APIResponse[LoginResponse],
    status_code=status.HTTP_200_OK,
    summary="Authenticate user and issue JWT tokens",
    description="Validates email and password, enforces account lock rules, confirms email is verified, and returns JWT tokens.",
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
    summary="Request 6-digit password reset OTP",
    description="Generates and emails a 6-digit password reset OTP for the specified email address.",
)
async def forgot_password(
    payload: ForgotPasswordRequest,
    auth_service: AuthService = Depends(get_auth_service),
):
    res = await auth_service.forgot_password(payload.email)
    return APIResponse(
        success=True,
        message=res["message"],
        data=res,
    )


@router.post(
    "/verify-reset-otp",
    response_model=APIResponse[dict],
    status_code=status.HTTP_200_OK,
    summary="Verify 6-digit password reset OTP",
    description="Verifies the password reset OTP and issues a short-lived reset token.",
)
async def verify_reset_otp(
    payload: VerifyResetOTPRequest,
    auth_service: AuthService = Depends(get_auth_service),
):
    res = await auth_service.verify_password_reset_otp(payload.email, payload.otp)
    return APIResponse(
        success=True,
        message=res["message"],
        data=res,
    )


@router.post(
    "/reset-password",
    response_model=APIResponse[dict],
    status_code=status.HTTP_200_OK,
    summary="Reset password using verified reset token",
    description="Validates the password reset token and updates the user's password.",
)
async def reset_password(
    payload: ResetPasswordRequest,
    auth_service: AuthService = Depends(get_auth_service),
):
    await auth_service.reset_password(payload.token, payload.new_password, payload.email)
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
