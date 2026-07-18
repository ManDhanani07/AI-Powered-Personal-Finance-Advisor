"""Upgrade categories table for AI finance

Revision ID: ff93661fb905
Revises: 200d63a08174
Create Date: 2026-07-18 13:59:27.952088

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'ff93661fb905'
down_revision: Union[str, Sequence[str], None] = '200d63a08174'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Drop old check constraint first because column 'type' depends on it
    op.drop_constraint('chk_category_type', 'categories', type_='check')
    
    op.add_column('categories', sa.Column('category_type', sa.String(length=30), nullable=False))
    op.add_column('categories', sa.Column('is_default', sa.Boolean(), server_default=sa.text('false'), nullable=False))
    op.drop_column('categories', 'type')
    
    # Create new check constraint
    op.create_check_constraint(
        'chk_category_type',
        'categories',
        "category_type IN ('Expense', 'Income', 'Investment', 'Transfer')"
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_constraint('chk_category_type', 'categories', type_='check')
    
    op.add_column('categories', sa.Column('type', sa.VARCHAR(length=15), autoincrement=False, nullable=False))
    op.drop_column('categories', 'is_default')
    op.drop_column('categories', 'category_type')
    
    op.create_check_constraint(
        'chk_category_type',
        'categories',
        "type IN ('income', 'expense', 'transfer')"
    )

