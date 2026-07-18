from datetime import datetime, timezone, timedelta
from typing import Optional
from sqlalchemy.orm import Session
from app.models.user import User, RefreshToken
from app.schemas.auth import UserRegister, UserLogin, TokenResponse
from app.core.security import hash_password, verify_password, create_access_token, create_refresh_token, decode_token
from app.core.config import settings
from app.core.exceptions import AuthenticationError, ForbiddenError, BusinessRuleError
from app.core.logging import logger

def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """Retrieve a user by their email address."""
    return db.query(User).filter(User.email == email.strip().lower()).first()

def register_user(db: Session, user_data: UserRegister) -> User:
    """Register a new user, asserting uniqueness and hashing password, handling commits safely."""
    existing_user = get_user_by_email(db, user_data.email)
    if existing_user:
        logger.warning(f"Registration blocked: Duplicate email {user_data.email}")
        raise BusinessRuleError("A user with this email address already exists.")
    
    try:
        hashed_pwd = hash_password(user_data.password)
        new_user = User(
            email=user_data.email.strip().lower(),
            hashed_password=hashed_pwd,
            full_name=user_data.full_name.strip(),
            phone=user_data.phone,
            occupation=user_data.occupation,
            monthly_income=user_data.monthly_income,
            preferred_currency=user_data.preferred_currency,
            language=user_data.language,
            timezone=user_data.timezone
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        logger.info(f"Registered user: {new_user.email} (ID: {new_user.id})")
        return new_user
    except Exception as e:
        db.rollback()
        logger.error(f"Failed registering user {user_data.email}: {str(e)}")
        raise BusinessRuleError("An error occurred during registration. Please try again.")

def authenticate_user(db: Session, login_data: UserLogin) -> User:
    """Verify credentials and return active user profile."""
    user = get_user_by_email(db, login_data.email)
    if not user or not verify_password(login_data.password, user.hashed_password):
        logger.warning(f"Unauthorized login attempt for: {login_data.email}")
        raise AuthenticationError("Incorrect email or password.")
    
    if not user.is_active:
        logger.warning(f"Blocked inactive user login: {login_data.email}")
        raise ForbiddenError("This account has been deactivated.")
        
    try:
        user.last_login = datetime.now(timezone.utc)
        db.add(user)
        db.commit()
        logger.info(f"Updated last_login timestamp for user: {user.email}")
    except Exception as e:
        db.rollback()
        logger.error(f"Failed updating last_login for user ID {user.id}: {str(e)}")
        
    return user

def create_user_session(db: Session, user: User, device_info: Optional[str] = None) -> TokenResponse:
    """Generate session keys and log the refresh token, committing safely."""
    try:
        access_token = create_access_token(subject=user.id)
        refresh_token_str = create_refresh_token(subject=user.id)
        
        expire_time = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        db_refresh_token = RefreshToken(
            user_id=user.id,
            token=refresh_token_str,
            device_info=device_info,
            expires_at=expire_time
        )
        db.add(db_refresh_token)
        db.commit()
        
        logger.info(f"Created session tokens for user: {user.email}")
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token_str
        )
    except Exception as e:
        db.rollback()
        logger.error(f"Session generation failed for user ID {user.id}: {str(e)}")
        raise BusinessRuleError("Session establishment failed.")

def refresh_user_session(db: Session, refresh_token_str: str) -> TokenResponse:
    """Execute Refresh Token Rotation, revoking old sessions and creating new ones."""
    payload = decode_token(refresh_token_str)
    if not payload or payload.get("type") != "refresh":
        raise AuthenticationError("Invalid refresh token.")
        
    user_id = payload.get("sub")
    if not user_id:
        raise AuthenticationError("Invalid refresh token payload.")
        
    db_token = db.query(RefreshToken).filter(RefreshToken.token == refresh_token_str).first()
    if not db_token or db_token.is_revoked or db_token.expires_at.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        raise AuthenticationError("Refresh token is expired or revoked.")
        
    user = db.query(User).filter(User.id == db_token.user_id).first()
    if not user or not user.is_active:
        raise ForbiddenError("User account is inactive or not found.")

    try:
        # RTR: Revoke old token
        db_token.is_revoked = True
        db_token.revoked_at = datetime.now(timezone.utc)
        
        # Generate new tokens
        new_access_token = create_access_token(subject=user.id)
        new_refresh_token_str = create_refresh_token(subject=user.id)
        
        expire_time = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        new_db_token = RefreshToken(
            user_id=user.id,
            token=new_refresh_token_str,
            device_info=db_token.device_info,
            expires_at=expire_time
        )
        
        db.add(new_db_token)
        db.commit()
        
        logger.info(f"Rotated tokens for user ID {user.id}")
        return TokenResponse(
            access_token=new_access_token,
            refresh_token=new_refresh_token_str
        )
    except Exception as e:
        db.rollback()
        logger.error(f"Token rotation failed for user ID {user.id}: {str(e)}")
        raise BusinessRuleError("Session rotation failed.")

def revoke_user_session(db: Session, refresh_token_str: str) -> None:
    """Invalidate session on logout."""
    db_token = db.query(RefreshToken).filter(RefreshToken.token == refresh_token_str).first()
    if db_token:
        try:
            db_token.is_revoked = True
            db_token.revoked_at = datetime.now(timezone.utc)
            db.commit()
            logger.info(f"Revoked token session for user ID {db_token.user_id}")
        except Exception as e:
            db.rollback()
            logger.error(f"Logout failed for session: {str(e)}")
            raise BusinessRuleError("Logout execution failed.")
