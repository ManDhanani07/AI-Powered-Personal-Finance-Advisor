"""Upgrade transactions table for AI finance

Revision ID: ada15220cdb2
Revises: ff93661fb905
Create Date: 2026-07-18 14:02:06.085420

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'ada15220cdb2'
down_revision: Union[str, Sequence[str], None] = 'ff93661fb905'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Drop old check constraints first because columns they reference are dropped
    op.drop_constraint('chk_transaction_accounts', 'transactions', type_='check')
    op.drop_constraint('chk_transaction_type', 'transactions', type_='check')
    op.drop_constraint('chk_transaction_status', 'transactions', type_='check')

    op.add_column('transactions', sa.Column('account_id', sa.Uuid(), nullable=False))
    op.add_column('transactions', sa.Column('merchant', sa.String(length=100), nullable=True))
    op.add_column('transactions', sa.Column('transaction_type', sa.String(length=30), nullable=False))
    op.add_column('transactions', sa.Column('payment_method', sa.String(length=50), nullable=True))
    op.add_column('transactions', sa.Column('location', sa.String(length=100), nullable=True))
    op.add_column('transactions', sa.Column('ai_predicted_category', sa.String(length=100), nullable=True))
    op.add_column('transactions', sa.Column('prediction_confidence', sa.Numeric(precision=5, scale=4), nullable=True))
    op.add_column('transactions', sa.Column('is_user_corrected', sa.Boolean(), server_default=sa.text('false'), nullable=False))
    op.add_column('transactions', sa.Column('receipt_image', sa.String(length=512), nullable=True))
    op.alter_column('transactions', 'transaction_date',
               existing_type=postgresql.TIMESTAMP(),
               type_=sa.DateTime(timezone=True),
               existing_nullable=False,
               existing_server_default=sa.text('now()'))
    op.drop_index(op.f('ix_transactions_dest_account_id'), table_name='transactions')
    op.drop_index(op.f('ix_transactions_src_account_id'), table_name='transactions')
    op.create_index(op.f('ix_transactions_account_id'), 'transactions', ['account_id'], unique=False)
    op.drop_constraint(op.f('transactions_dest_account_id_fkey'), 'transactions', type_='foreignkey')
    op.drop_constraint(op.f('transactions_src_account_id_fkey'), 'transactions', type_='foreignkey')
    op.create_foreign_key(None, 'transactions', 'accounts', ['account_id'], ['id'], ondelete='CASCADE')
    op.drop_column('transactions', 'type')
    op.drop_column('transactions', 'src_account_id')
    op.drop_column('transactions', 'status')
    op.drop_column('transactions', 'dest_account_id')
    
    # Create new check constraint
    op.create_check_constraint(
        'chk_transaction_type',
        'transactions',
        "transaction_type IN ('Expense', 'Income', 'Investment', 'Transfer')"
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_constraint('chk_transaction_type', 'transactions', type_='check')

    op.add_column('transactions', sa.Column('dest_account_id', sa.UUID(), autoincrement=False, nullable=True))
    op.add_column('transactions', sa.Column('status', sa.VARCHAR(length=15), server_default=sa.text("'completed'::character varying"), autoincrement=False, nullable=False))
    op.add_column('transactions', sa.Column('src_account_id', sa.UUID(), autoincrement=False, nullable=True))
    op.add_column('transactions', sa.Column('type', sa.VARCHAR(length=15), autoincrement=False, nullable=False))
    op.drop_constraint(None, 'transactions', type_='foreignkey')
    op.create_foreign_key(op.f('transactions_src_account_id_fkey'), 'transactions', 'accounts', ['src_account_id'], ['id'], ondelete='RESTRICT')
    op.create_foreign_key(op.f('transactions_dest_account_id_fkey'), 'transactions', 'accounts', ['dest_account_id'], ['id'], ondelete='RESTRICT')
    op.drop_index(op.f('ix_transactions_account_id'), table_name='transactions')
    op.create_index(op.f('ix_transactions_src_account_id'), 'transactions', ['src_account_id'], unique=False)
    op.create_index(op.f('ix_transactions_dest_account_id'), 'transactions', ['dest_account_id'], unique=False)
    op.alter_column('transactions', 'transaction_date',
               existing_type=sa.DateTime(timezone=True),
               type_=postgresql.TIMESTAMP(),
               existing_nullable=False,
               existing_server_default=sa.text('now()'))
    op.drop_column('transactions', 'receipt_image')
    op.drop_column('transactions', 'is_user_corrected')
    op.drop_column('transactions', 'prediction_confidence')
    op.drop_column('transactions', 'ai_predicted_category')
    op.drop_column('transactions', 'location')
    op.drop_column('transactions', 'payment_method')
    op.drop_column('transactions', 'transaction_type')
    op.drop_column('transactions', 'merchant')
    op.drop_column('transactions', 'account_id')

    # Recreate original constraints
    op.create_check_constraint('chk_transaction_type', 'transactions', "type IN ('income', 'expense', 'transfer')")
    op.create_check_constraint('chk_transaction_status', 'transactions', "status IN ('pending', 'completed', 'failed')")
    op.create_check_constraint(
        'chk_transaction_accounts',
        'transactions',
        "(type = 'expense' AND src_account_id IS NOT NULL AND dest_account_id IS NULL) OR "
        "(type = 'income' AND dest_account_id IS NOT NULL AND src_account_id IS NULL) OR "
        "(type = 'transfer' AND src_account_id IS NOT NULL AND dest_account_id IS NOT NULL AND src_account_id <> dest_account_id)"
    )

