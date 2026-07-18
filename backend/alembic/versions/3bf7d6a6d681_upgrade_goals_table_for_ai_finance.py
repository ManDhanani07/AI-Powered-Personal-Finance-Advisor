"""Upgrade goals table for AI finance

Revision ID: 3bf7d6a6d681
Revises: 58037721d30a
Create Date: 2026-07-18 14:05:34.537913

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '3bf7d6a6d681'
down_revision: Union[str, Sequence[str], None] = '58037721d30a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Drop old check constraint first because column status depends on it
    op.drop_constraint('chk_goal_status', 'financial_goals', type_='check')

    op.add_column('financial_goals', sa.Column('title', sa.String(length=100), nullable=False))
    op.add_column('financial_goals', sa.Column('goal_type', sa.String(length=50), nullable=False))
    op.add_column('financial_goals', sa.Column('current_amount', sa.Numeric(precision=15, scale=4), server_default=sa.text('0.0000'), nullable=False))
    op.add_column('financial_goals', sa.Column('priority', sa.String(length=15), nullable=False))
    op.add_column('financial_goals', sa.Column('goal_status', sa.String(length=30), server_default=sa.text("'In Progress'"), nullable=False))
    op.add_column('financial_goals', sa.Column('auto_save', sa.Boolean(), server_default=sa.text('false'), nullable=False))
    op.add_column('financial_goals', sa.Column('monthly_target', sa.Numeric(precision=15, scale=4), server_default=sa.text('0.0000'), nullable=False))
    op.add_column('financial_goals', sa.Column('notes', sa.String(), nullable=True))
    op.drop_column('financial_goals', 'status')
    op.drop_column('financial_goals', 'name')
    
    # Create new check constraints
    op.create_check_constraint(
        'chk_goal_current_amount',
        'financial_goals',
        "current_amount >= 0.0000"
    )
    op.create_check_constraint(
        'chk_goal_priority',
        'financial_goals',
        "priority IN ('High', 'Medium', 'Low')"
    )
    op.create_check_constraint(
        'chk_goal_status',
        'financial_goals',
        "goal_status IN ('In Progress', 'Completed', 'Abandoned')"
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_constraint('chk_goal_current_amount', 'financial_goals', type_='check')
    op.drop_constraint('chk_goal_priority', 'financial_goals', type_='check')
    op.drop_constraint('chk_goal_status', 'financial_goals', type_='check')

    op.add_column('financial_goals', sa.Column('name', sa.VARCHAR(length=100), autoincrement=False, nullable=False))
    op.add_column('financial_goals', sa.Column('status', sa.VARCHAR(length=15), server_default=sa.text("'active'::character varying"), autoincrement=False, nullable=False))
    op.drop_column('financial_goals', 'notes')
    op.drop_column('financial_goals', 'monthly_target')
    op.drop_column('financial_goals', 'auto_save')
    op.drop_column('financial_goals', 'goal_status')
    op.drop_column('financial_goals', 'priority')
    op.drop_column('financial_goals', 'current_amount')
    op.drop_column('financial_goals', 'goal_type')
    op.drop_column('financial_goals', 'title')

    # Recreate original constraints
    op.create_check_constraint('chk_goal_status', 'financial_goals', "status IN ('active', 'completed', 'abandoned')")

