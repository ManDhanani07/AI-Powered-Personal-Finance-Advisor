"""
Cloudinary Image Storage Service.
Handles Cloudinary initialization, secure image uploads with facial crop, and image deletion.
Falls back gracefully to local storage if Cloudinary credentials are not configured.
"""

import asyncio
import re
import uuid
from pathlib import Path
from typing import Optional
from app.core.config import settings
from app.core.logging import logger

try:
    import cloudinary
    import cloudinary.uploader
    import cloudinary.api
    CLOUDINARY_AVAILABLE = True
except ImportError:
    CLOUDINARY_AVAILABLE = False


class CloudinaryService:
    def __init__(self):
        # Resolve to backend/app/static/uploads/avatars matching FastAPI static mount
        self.upload_dir = Path(__file__).resolve().parent.parent / "static" / "uploads" / "avatars"
        self.upload_dir.mkdir(parents=True, exist_ok=True)
        # Also ensure legacy backend/static dir is referenced for cleanup if needed
        self.legacy_upload_dir = Path(__file__).resolve().parent.parent.parent / "static" / "uploads" / "avatars"
        self._init_cloudinary()

    def is_configured(self) -> bool:
        """Check if Cloudinary credentials are configured in settings."""
        if not CLOUDINARY_AVAILABLE:
            return False
        if settings.CLOUDINARY_URL and settings.CLOUDINARY_URL.strip():
            return True
        return bool(
            settings.CLOUDINARY_CLOUD_NAME
            and settings.CLOUDINARY_CLOUD_NAME.strip()
            and settings.CLOUDINARY_API_KEY
            and settings.CLOUDINARY_API_KEY.strip()
            and settings.CLOUDINARY_API_SECRET
            and settings.CLOUDINARY_API_SECRET.strip()
        )

    def _init_cloudinary(self):
        """Initialize the Cloudinary SDK with environment credentials."""
        if not self.is_configured():
            return

        try:
            cloud_name = settings.CLOUDINARY_CLOUD_NAME.strip() if settings.CLOUDINARY_CLOUD_NAME else None
            api_key = settings.CLOUDINARY_API_KEY.strip() if settings.CLOUDINARY_API_KEY else None
            api_secret = settings.CLOUDINARY_API_SECRET.strip() if settings.CLOUDINARY_API_SECRET else None

            # If CLOUDINARY_URL is provided without explicit credentials, parse it
            if not (cloud_name and api_key and api_secret) and settings.CLOUDINARY_URL:
                import os
                os.environ["CLOUDINARY_URL"] = settings.CLOUDINARY_URL.strip()
                cloudinary.reset_config()
                logger.info("Cloudinary configured via CLOUDINARY_URL environment variable")
            else:
                cloudinary.config(
                    cloud_name=cloud_name,
                    api_key=api_key,
                    api_secret=api_secret,
                    secure=True,
                )
                logger.info(f"Cloudinary configured successfully for cloud: {cloud_name}")
        except Exception as e:
            logger.error(f"Failed to initialize Cloudinary SDK: {e}")

    async def upload_avatar(
        self,
        file_bytes: bytes,
        user_id: str,
        filename: Optional[str] = None,
        email: Optional[str] = None,
        full_name: Optional[str] = None,
    ) -> str:
        """
        Uploads a user avatar. If Cloudinary is configured, uploads directly to Cloudinary
        CDN with auto-face cropping and optimization. Naming and display_name reflect
        the user's email and username. Otherwise, falls back to local storage.
        """
        def sanitize(text: str) -> str:
            return re.sub(r"[^a-zA-Z0-9_-]", "_", text).strip("_")

        # Build user-friendly Cloudinary public ID & display name
        sanitized_email = sanitize(email) if email else f"user_{user_id[:8]}"
        sanitized_name = sanitize(full_name) if full_name else ""
        if sanitized_name and sanitized_email:
            asset_slug = f"{sanitized_email}_{sanitized_name}"
        else:
            asset_slug = sanitized_email or f"avatar_{user_id}"

        display_name = f"{full_name} ({email})" if (full_name and email) else (email or full_name or f"User {user_id[:8]}")

        if self.is_configured():
            try:
                public_id = asset_slug
                logger.info(f"Uploading avatar to Cloudinary for {display_name} (ID: {user_id})")

                res = await asyncio.to_thread(
                    cloudinary.uploader.upload,
                    file_bytes,
                    folder="fintech_ai/avatars",
                    public_id=public_id,
                    display_name=display_name,
                    tags=["avatar", email or "", full_name or "", user_id],
                    context={
                        "username": full_name or "",
                        "email": email or "",
                        "user_id": user_id,
                    },
                    overwrite=True,
                    resource_type="image",
                    timeout=10,
                )
                secure_url = res.get("secure_url")
                if secure_url:
                    logger.info(f"Cloudinary upload successful for {display_name}: {secure_url}")
                    return secure_url
            except Exception as e:
                logger.error(f"Cloudinary upload failed: {e}. Falling back to local storage.")

        # Fallback to local storage with readable naming
        ext = filename.split(".")[-1].lower() if filename and "." in filename else "webp"
        unique_name = f"{asset_slug}_{uuid.uuid4().hex[:6]}.{ext}"
        local_path = self.upload_dir / unique_name

        with open(local_path, "wb") as f:
            f.write(file_bytes)

        return f"/static/uploads/avatars/{unique_name}"

    async def delete_avatar(
        self,
        user_id: str,
        current_url: Optional[str] = None,
        email: Optional[str] = None,
        full_name: Optional[str] = None,
    ) -> bool:
        """
        Deletes the user avatar from Cloudinary (or local filesystem if stored locally).
        """
        deleted_anything = False

        if self.is_configured():
            public_ids_to_try = [
                f"fintech_ai/avatars/avatar_{user_id}",
            ]
            if email:
                def sanitize(text: str) -> str:
                    return re.sub(r"[^a-zA-Z0-9_-]", "_", text).strip("_")
                sanitized_email = sanitize(email)
                sanitized_name = sanitize(full_name) if full_name else ""
                public_ids_to_try.append(f"fintech_ai/avatars/{sanitized_email}")
                if sanitized_name:
                    public_ids_to_try.append(f"fintech_ai/avatars/{sanitized_email}_{sanitized_name}")

            if current_url and "cloudinary.com" in current_url:
                try:
                    parts = current_url.split("/upload/")
                    if len(parts) > 1:
                        path_after_upload = parts[1]
                        segments = path_after_upload.split("/")
                        filtered = [s for s in segments if not (s.startswith("v") and s[1:].isdigit()) and not ("," in s or "c_" in s or "w_" in s)]
                        extracted_id = "/".join(filtered).rsplit(".", 1)[0]
                        if extracted_id and extracted_id not in public_ids_to_try:
                            public_ids_to_try.append(extracted_id)
                except Exception:
                    pass

            for pid in public_ids_to_try:
                try:
                    res = await asyncio.to_thread(cloudinary.uploader.destroy, pid, invalidate=True)
                    if res.get("result") in ["ok", "not found"]:
                        deleted_anything = True
                        logger.info(f"Avatar removed from Cloudinary: {pid}")
                except Exception as e:
                    logger.warning(f"Could not delete avatar from Cloudinary ({pid}): {e}")

        # If current URL points to a local static file, remove it from static dir
        if current_url and "/static/uploads/avatars/" in current_url:
            filename = current_url.split("/static/uploads/avatars/")[-1]
            for check_dir in [self.upload_dir, self.legacy_upload_dir]:
                file_path = check_dir / filename
                if file_path.exists():
                    try:
                        file_path.unlink()
                        deleted_anything = True
                        logger.info(f"Local avatar file deleted: {file_path}")
                    except Exception as e:
                        logger.warning(f"Could not delete local avatar file: {e}")

        return deleted_anything


cloudinary_service = CloudinaryService()
