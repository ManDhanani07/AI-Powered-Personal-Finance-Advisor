"""user_auth_fields

Revision ID: 002_user_auth_fields
Revises: 001_initial_schema
Create Date: 2026-08-01 00:01:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '002_user_auth_fields'
down_revision: Union[str, None] = '001_initial_schema'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('users', sa.Column('email_verified', sa.Boolean(), server_default='false', nullable=False))
    op.add_column('users', sa.Column('email_verification_token', sa.String(length=255), nullable=True))
    op.add_column('users', sa.Column('password_reset_token', sa.String(length=255), nullable=True))
    op.add_column('users', sa.Column('password_reset_expiry', sa.DateTime(timezone=True), nullable=True))
    op.add_column('users', sa.Column('last_login', sa.DateTime(timezone=True), nullable=True))
    op.add_column('users', sa.Column('failed_login_attempts', sa.Integer(), server_default='0', nullable=False))
    op.add_column('users', sa.Column('account_locked', sa.Boolean(), server_default='false', nullable=False))
    op.add_column('users', sa.Column('lock_until', sa.DateTime(timezone=True), nullable=True))
    op.add_column('users', sa.Column('refresh_token', sa.String(length=500), nullable=True))
    op.add_column('users', sa.Column('refresh_token_expiry', sa.DateTime(timezone=True), nullable=True))


def downgrade() -> None:
    op.drop_column('users', 'refresh_token_expiry')
    op.drop_column('users', 'refresh_token')
    op.drop_column('users', 'lock_until')
    op.drop_column('users', 'account_locked')
    op.drop_column('users', 'failed_login_attempts')
    op.drop_column('users', 'last_login')
    op.drop_column('users', 'password_reset_expiry')
    op.drop_column('users', 'password_reset_token')
    op.drop_column('users', 'email_verification_token')
    op.drop_column('users', 'email_verified')
