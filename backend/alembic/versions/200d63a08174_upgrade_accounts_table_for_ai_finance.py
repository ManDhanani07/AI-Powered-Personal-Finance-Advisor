"""Upgrade accounts table for AI finance

Revision ID: 200d63a08174
Revises: 3881f2c443f9
Create Date: 2026-07-18 13:56:59.988260

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '200d63a08174'
down_revision: Union[str, Sequence[str], None] = '3881f2c443f9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Drop old check constraint first because column 'type' depends on it
    op.drop_constraint('chk_account_type', 'accounts', type_='check')
    
    op.add_column('accounts', sa.Column('institution', sa.String(length=100), nullable=True))
    op.add_column('accounts', sa.Column('account_type', sa.String(length=30), nullable=False))
    op.add_column('accounts', sa.Column('is_default', sa.Boolean(), server_default=sa.text('false'), nullable=False))
    op.drop_column('accounts', 'type')
    op.drop_column('accounts', 'is_active')
    
    # Create new check constraint
    op.create_check_constraint(
        'chk_account_type',
        'accounts',
        "account_type IN ('Savings', 'Current', 'Cash', 'Credit Card', 'Wallet', 'Investment')"
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_constraint('chk_account_type', 'accounts', type_='check')
    
    op.add_column('accounts', sa.Column('is_active', sa.BOOLEAN(), server_default=sa.text('true'), autoincrement=False, nullable=False))
    op.add_column('accounts', sa.Column('type', sa.VARCHAR(length=30), autoincrement=False, nullable=False))
    op.drop_column('accounts', 'is_default')
    op.drop_column('accounts', 'account_type')
    op.drop_column('accounts', 'institution')
    
    op.create_check_constraint(
        'chk_account_type',
        'accounts',
        "type IN ('checking', 'savings', 'credit_card', 'investment', 'cash', 'loan')"
    )

