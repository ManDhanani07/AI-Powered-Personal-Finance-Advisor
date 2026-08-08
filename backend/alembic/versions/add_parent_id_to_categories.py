"""add parent_id to categories

Revision ID: a1b2c3d4e5f6
Revises: 
Create Date: 2026-08-04

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

revision = 'a1b2c3d4e5f6'
down_revision = '003_transaction_soft_delete'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add parent_id column as a nullable self-referential FK
    op.add_column(
        'categories',
        sa.Column('parent_id', UUID(as_uuid=True), sa.ForeignKey('categories.id', ondelete='SET NULL'), nullable=True, index=True)
    )


def downgrade() -> None:
    op.drop_column('categories', 'parent_id')
