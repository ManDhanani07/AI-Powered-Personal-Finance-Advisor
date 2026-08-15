"""
Email Verification Repository handling OTP storage, lookups, attempt tracking, and invalidation.
"""

from typing import Optional, List
from datetime import datetime, timezone
from uuid import UUID
from sqlalchemy import select, update, and_, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.email_verification import EmailVerification
from app.repositories.base import BaseRepository


class EmailVerificationRepository(BaseRepository[EmailVerification]):
    def __init__(self, db: AsyncSession):
        super().__init__(EmailVerification, db)

    async def create_verification(
        self,
        email: str,
        otp_hash: str,
        purpose: str,
        expires_at: datetime,
        user_id: Optional[UUID] = None,
        max_attempts: int = 5,
    ) -> EmailVerification:
        """Create and persist a new OTP verification record."""
        verification = EmailVerification(
            email=email.strip().lower(),
            otp_hash=otp_hash,
            purpose=purpose,
            expires_at=expires_at,
            user_id=user_id,
            attempts=0,
            max_attempts=max_attempts,
            verified_at=None,
        )
        self.db.add(verification)
        await self.db.commit()
        await self.db.refresh(verification)
        return verification

    async def get_active_verification(
        self,
        email: str,
        purpose: str,
    ) -> Optional[EmailVerification]:
        """Fetch the most recent pending and non-expired verification record for an email and purpose."""
        now = datetime.now(timezone.utc)
        stmt = (
            select(EmailVerification)
            .where(
                and_(
                    EmailVerification.email == email.strip().lower(),
                    EmailVerification.purpose == purpose,
                    EmailVerification.verified_at.is_(None),
                    EmailVerification.expires_at > now,
                )
            )
            .order_by(desc(EmailVerification.created_at))
            .limit(1)
        )
        result = await self.db.execute(stmt)
        return result.scalars().first()

    async def get_latest_verification_any(
        self,
        email: str,
        purpose: str,
    ) -> Optional[EmailVerification]:
        """Fetch the most recent verification record (regardless of expiry) for cooldown tracking."""
        stmt = (
            select(EmailVerification)
            .where(
                and_(
                    EmailVerification.email == email.strip().lower(),
                    EmailVerification.purpose == purpose,
                )
            )
            .order_by(desc(EmailVerification.created_at))
            .limit(1)
        )
        result = await self.db.execute(stmt)
        return result.scalars().first()

    async def invalidate_pending_otps(
        self,
        email: str,
        purpose: str,
    ) -> int:
        """Mark previous unverified OTPs as expired/invalidated."""
        now = datetime.now(timezone.utc)
        stmt = (
            update(EmailVerification)
            .where(
                and_(
                    EmailVerification.email == email.strip().lower(),
                    EmailVerification.purpose == purpose,
                    EmailVerification.verified_at.is_(None),
                )
            )
            .values(expires_at=now)
        )
        result = await self.db.execute(stmt)
        await self.db.commit()
        return result.rowcount

    async def increment_attempts(self, verification_id: UUID) -> int:
        """Increment failed verification attempt count."""
        stmt = (
            update(EmailVerification)
            .where(EmailVerification.id == verification_id)
            .values(attempts=EmailVerification.attempts + 1)
            .returning(EmailVerification.attempts)
        )
        result = await self.db.execute(stmt)
        await self.db.commit()
        return result.scalar_one()

    async def mark_verified(self, verification_id: UUID) -> bool:
        """Mark verification record as successfully verified."""
        now = datetime.now(timezone.utc)
        stmt = (
            update(EmailVerification)
            .where(EmailVerification.id == verification_id)
            .values(verified_at=now)
        )
        await self.db.execute(stmt)
        await self.db.commit()
        return True
