"""
User Profile and Account Management API Endpoints.
"""

import os
import uuid
from pathlib import Path
from fastapi import APIRouter, Depends, UploadFile, File, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.dependencies.auth import get_current_user
from app.dependencies.service import get_user_repository
from app.services.user_service import UserService
from app.repositories.user_repository import UserRepository
from app.models.user import User
from app.schemas.base import APIResponse
from app.schemas.auth import UserResponse
from app.schemas.user import UpdateProfileRequest, DeleteAccountRequest
from app.core.security import verify_password
from app.exceptions.custom_exceptions import BadRequestException, UnauthorizedException

router = APIRouter(prefix="/user", tags=["User Profile"])

ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"]
MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024  # 5MB
UPLOAD_DIR = Path(__file__).resolve().parent.parent.parent.parent / "static" / "uploads" / "avatars"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


@router.get(
    "/profile",
    response_model=APIResponse[UserResponse],
    status_code=status.HTTP_200_OK,
    summary="Get user profile details",
)
async def get_user_profile(
    current_user: User = Depends(get_current_user),
):
    user_res = UserResponse.model_validate(current_user)
    return APIResponse(
        success=True,
        message="Profile details retrieved successfully",
        data=user_res,
    )


@router.put(
    "/profile",
    response_model=APIResponse[UserResponse],
    status_code=status.HTTP_200_OK,
    summary="Update user profile information",
)
async def update_user_profile(
    payload: UpdateProfileRequest,
    current_user: User = Depends(get_current_user),
    user_repo: UserRepository = Depends(get_user_repository),
):
    user_service = UserService(user_repo)
    update_dict = payload.model_dump(exclude_unset=True)
    updated_user = await user_service.update_user_profile(current_user.id, update_dict)
    user_res = UserResponse.model_validate(updated_user)
    return APIResponse(
        success=True,
        message="User profile updated successfully",
        data=user_res,
    )


@router.post(
    "/upload-profile-picture",
    response_model=APIResponse[dict],
    status_code=status.HTTP_200_OK,
    summary="Upload profile picture (PNG/JPEG/WEBP <= 5MB)",
)
async def upload_profile_picture(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    user_repo: UserRepository = Depends(get_user_repository),
):
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise BadRequestException("Invalid file format. Only JPEG, PNG, and WEBP images are supported.")

    file_contents = await file.read()
    if len(file_contents) > MAX_IMAGE_SIZE_BYTES:
        raise BadRequestException("File size exceeds maximum limit of 5MB.")

    # Generate unique filename
    ext = file.filename.split(".")[-1].lower() if "." in file.filename else "jpg"
    unique_filename = f"avatar_{current_user.id}_{uuid.uuid4().hex[:8]}.{ext}"
    file_path = UPLOAD_DIR / unique_filename

    # Save image file to filesystem
    with open(file_path, "wb") as f:
        f.write(file_contents)

    # Public image URL
    avatar_url = f"/static/uploads/avatars/{unique_filename}"

    # Update User profile_picture field in DB
    await user_repo.update(current_user.id, {"profile_picture": avatar_url})

    return APIResponse(
        success=True,
        message="Profile picture uploaded successfully",
        data={"profile_picture": avatar_url},
    )


@router.delete(
    "/delete-account",
    response_model=APIResponse[dict],
    status_code=status.HTTP_200_OK,
    summary="Delete user account and all associated data",
)
async def delete_account(
    payload: DeleteAccountRequest,
    current_user: User = Depends(get_current_user),
    user_repo: UserRepository = Depends(get_user_repository),
):
    if payload.confirmation_text.strip() != "DELETE":
        raise BadRequestException("Please type 'DELETE' to confirm account deletion.")

    if not verify_password(payload.password, current_user.password_hash):
        raise UnauthorizedException("Incorrect password provided. Account deletion cancelled.")

    await user_repo.delete(current_user.id, hard=True)
    return APIResponse(
        success=True,
        message="Your account and all associated financial records have been permanently deleted.",
        data={"deleted": True},
    )
