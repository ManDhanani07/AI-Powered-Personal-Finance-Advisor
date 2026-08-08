"""transaction_soft_delete

Revision ID: 003_transaction_soft_delete
Revises: 002_user_auth_fields
Create Date: 2026-08-01 00:02:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '003_transaction_soft_delete'
down_revision: Union[str, None] = '002_user_auth_fields'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('transactions', sa.Column(
        'is_deleted',
        sa.Boolean(),
        server_default='false',
        nullable=False,
    ))
    op.add_column('transactions', sa.Column(
        'deleted_at',
        sa.DateTime(timezone=True),
        nullable=True,
    ))
    op.create_index(
        'ix_transactions_is_deleted',
        'transactions',
        ['is_deleted'],
    )


def downgrade() -> None:
    op.drop_index('ix_transactions_is_deleted', table_name='transactions')
    op.drop_column('transactions', 'deleted_at')
    op.drop_column('transactions', 'is_deleted')
