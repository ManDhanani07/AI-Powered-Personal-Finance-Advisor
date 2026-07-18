"""Upgrade budgets table for AI finance

Revision ID: 58037721d30a
Revises: ada15220cdb2
Create Date: 2026-07-18 14:03:57.070549

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '58037721d30a'
down_revision: Union[str, Sequence[str], None] = 'ada15220cdb2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Drop old check constraints first because columns they reference are dropped
    op.drop_constraint('chk_budget_amount_limit', 'budgets', type_='check')
    op.drop_constraint('chk_budget_dates', 'budgets', type_='check')
    op.drop_constraint('chk_budget_period', 'budgets', type_='check')

    op.add_column('budgets', sa.Column('monthly_limit', sa.Numeric(precision=15, scale=4), nullable=False))
    op.add_column('budgets', sa.Column('warning_percentage', sa.Integer(), server_default=sa.text('80'), nullable=False))
    op.add_column('budgets', sa.Column('month', sa.Integer(), nullable=False))
    op.add_column('budgets', sa.Column('year', sa.Integer(), nullable=False))
    op.add_column('budgets', sa.Column('currency', sa.String(length=3), server_default=sa.text("'INR'"), nullable=False))
    op.drop_constraint('uq_budget_category_period', 'budgets', type_='unique')
    op.create_unique_constraint('uq_budget_category_month_year', 'budgets', ['user_id', 'category_id', 'month', 'year'])
    op.drop_column('budgets', 'start_date')
    op.drop_column('budgets', 'period')
    op.drop_column('budgets', 'end_date')
    op.drop_column('budgets', 'amount_limit')
    
    # Create new check constraints
    op.create_check_constraint(
        'chk_budget_monthly_limit',
        'budgets',
        "monthly_limit > 0.0000"
    )
    op.create_check_constraint(
        'chk_budget_warning_percentage',
        'budgets',
        "warning_percentage > 0 AND warning_percentage <= 100"
    )
    op.create_check_constraint(
        'chk_budget_month',
        'budgets',
        "month >= 1 AND month <= 12"
    )
    op.create_check_constraint(
        'chk_budget_year',
        'budgets',
        "year >= 2000 AND year <= 2100"
    )


def downgrade() -> None:
    """Downgrade schema."""
    # Drop new check constraints
    op.drop_constraint('chk_budget_monthly_limit', 'budgets', type_='check')
    op.drop_constraint('chk_budget_warning_percentage', 'budgets', type_='check')
    op.drop_constraint('chk_budget_month', 'budgets', type_='check')
    op.drop_constraint('chk_budget_year', 'budgets', type_='check')

    op.add_column('budgets', sa.Column('amount_limit', sa.NUMERIC(precision=15, scale=4), autoincrement=False, nullable=False))
    op.add_column('budgets', sa.Column('end_date', sa.DATE(), autoincrement=False, nullable=False))
    op.add_column('budgets', sa.Column('period', sa.VARCHAR(length=15), server_default=sa.text("'monthly'::character varying"), autoincrement=False, nullable=False))
    op.add_column('budgets', sa.Column('start_date', sa.DATE(), autoincrement=False, nullable=False))
    op.drop_constraint('uq_budget_category_month_year', 'budgets', type_='unique')
    op.create_unique_constraint('uq_budget_category_period', 'budgets', ['user_id', 'category_id', 'period', 'start_date'])
    op.drop_column('budgets', 'currency')
    op.drop_column('budgets', 'year')
    op.drop_column('budgets', 'month')
    op.drop_column('budgets', 'warning_percentage')
    op.drop_column('budgets', 'monthly_limit')

    # Recreate original constraints
    op.create_check_constraint('chk_budget_amount_limit', 'budgets', "amount_limit > 0.0000")
    op.create_check_constraint('chk_budget_dates', 'budgets', "start_date <= end_date")
    op.create_check_constraint('chk_budget_period', 'budgets', "period IN ('weekly', 'monthly', 'yearly', 'custom')")

