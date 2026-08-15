"""add email_verifications table and user google_id auth_provider

Revision ID: 004_email_verifications
Revises: a1b2c3d4e5f6
Create Date: 2026-08-15 19:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

revision: str = '004_email_verifications'
down_revision: Union[str, None] = 'a1b2c3d4e5f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    insp = sa.inspect(bind)

    # 1. Add google_id and auth_provider to users table if they don't exist
    user_columns = [c['name'] for c in insp.get_columns('users')]
    if 'google_id' not in user_columns:
        op.add_column('users', sa.Column('google_id', sa.String(length=255), nullable=True))
        op.create_index('ix_users_google_id', 'users', ['google_id'])

    if 'auth_provider' not in user_columns:
        op.add_column('users', sa.Column('auth_provider', sa.String(length=50), server_default='email', nullable=False))

    # 2. Create email_verifications table if it doesn't exist
    if not insp.has_table('email_verifications'):
        op.create_table(
            'email_verifications',
            sa.Column('id', UUID(as_uuid=True), primary_key=True),
            sa.Column('user_id', UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=True),
            sa.Column('email', sa.String(length=255), nullable=False),
            sa.Column('otp_hash', sa.String(length=255), nullable=False),
            sa.Column('purpose', sa.String(length=50), server_default='SIGNUP', nullable=False),
            sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
            sa.Column('attempts', sa.Integer(), server_default='0', nullable=False),
            sa.Column('max_attempts', sa.Integer(), server_default='5', nullable=False),
            sa.Column('verified_at', sa.DateTime(timezone=True), nullable=True),
            sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
            sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        )

        op.create_index('ix_email_verifications_email', 'email_verifications', ['email'])
        op.create_index('ix_email_verifications_purpose', 'email_verifications', ['purpose'])
        op.create_index('ix_email_verifications_expires_at', 'email_verifications', ['expires_at'])
        op.create_index('ix_email_verifications_user_id', 'email_verifications', ['user_id'])
        op.create_index('idx_email_verif_active', 'email_verifications', ['email', 'purpose', 'expires_at', 'verified_at'])


def downgrade() -> None:
    bind = op.get_bind()
    insp = sa.inspect(bind)

    if insp.has_table('email_verifications'):
        op.drop_table('email_verifications')

    user_columns = [c['name'] for c in insp.get_columns('users')]
    if 'auth_provider' in user_columns:
        op.drop_column('users', 'auth_provider')
    if 'google_id' in user_columns:
        op.drop_index('ix_users_google_id', table_name='users')
        op.drop_column('users', 'google_id')
