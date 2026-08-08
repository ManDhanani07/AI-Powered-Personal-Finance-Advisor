"""initial_schema

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-08-01 00:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '001_initial_schema'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Create users table
    op.create_table(
        'users',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column('first_name', sa.String(length=100), nullable=False),
        sa.Column('last_name', sa.String(length=100), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('password_hash', sa.String(length=255), nullable=False),
        sa.Column('phone', sa.String(length=20), nullable=True),
        sa.Column('gender', sa.String(length=20), nullable=True),
        sa.Column('date_of_birth', sa.Date(), nullable=True),
        sa.Column('occupation', sa.String(length=100), nullable=True),
        sa.Column('monthly_income', sa.Numeric(precision=12, scale=2), server_default='0.00', nullable=False),
        sa.Column('currency', sa.String(length=10), server_default='INR', nullable=False),
        sa.Column('city', sa.String(length=100), nullable=True),
        sa.Column('state', sa.String(length=100), nullable=True),
        sa.Column('country', sa.String(length=100), server_default='India', nullable=False),
        sa.Column('profile_picture', sa.String(length=500), nullable=True),
        sa.Column('is_verified', sa.Boolean(), server_default='false', nullable=False),
        sa.Column('is_active', sa.Boolean(), server_default='true', nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    )
    op.create_index('ix_users_id', 'users', ['id'], unique=False)
    op.create_index('ix_users_email', 'users', ['email'], unique=True)

    # 2. Create categories table
    op.create_table(
        'categories',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column('category_name', sa.String(length=100), nullable=False),
        sa.Column('category_type', sa.String(length=50), nullable=False),
        sa.Column('icon', sa.String(length=100), nullable=True),
        sa.Column('color', sa.String(length=50), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('is_default', sa.Boolean(), server_default='false', nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    )
    op.create_index('ix_categories_id', 'categories', ['id'], unique=False)
    op.create_index('ix_categories_category_name', 'categories', ['category_name'], unique=False)
    op.create_index('ix_categories_category_type', 'categories', ['category_type'], unique=False)

    # 3. Create transactions table
    op.create_table(
        'transactions',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column('transaction_number', sa.String(length=50), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('category_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('categories.id', ondelete='SET NULL'), nullable=True),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('merchant', sa.String(length=150), nullable=True),
        sa.Column('transaction_type', sa.String(length=50), nullable=False),
        sa.Column('payment_method', sa.String(length=50), nullable=True),
        sa.Column('account_type', sa.String(length=50), nullable=True),
        sa.Column('amount', sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column('transaction_date', sa.DateTime(timezone=True), nullable=False),
        sa.Column('location', sa.String(length=255), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('is_recurring', sa.Boolean(), server_default='false', nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    )
    op.create_index('ix_transactions_id', 'transactions', ['id'], unique=False)
    op.create_index('ix_transactions_transaction_number', 'transactions', ['transaction_number'], unique=True)
    op.create_index('ix_transactions_user_id', 'transactions', ['user_id'], unique=False)
    op.create_index('ix_transactions_category_id', 'transactions', ['category_id'], unique=False)
    op.create_index('ix_transactions_transaction_type', 'transactions', ['transaction_type'], unique=False)
    op.create_index('ix_transactions_transaction_date', 'transactions', ['transaction_date'], unique=False)
    op.create_index('idx_user_transaction_date', 'transactions', ['user_id', 'transaction_date'], unique=False)

    # 4. Create budgets table
    op.create_table(
        'budgets',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('category_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('categories.id', ondelete='SET NULL'), nullable=True),
        sa.Column('budget_name', sa.String(length=150), nullable=False),
        sa.Column('budget_amount', sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column('spent_amount', sa.Numeric(precision=12, scale=2), server_default='0.00', nullable=False),
        sa.Column('remaining_amount', sa.Numeric(precision=12, scale=2), server_default='0.00', nullable=False),
        sa.Column('start_date', sa.Date(), nullable=False),
        sa.Column('end_date', sa.Date(), nullable=False),
        sa.Column('status', sa.String(length=50), server_default='ACTIVE', nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    )
    op.create_index('ix_budgets_id', 'budgets', ['id'], unique=False)
    op.create_index('ix_budgets_user_id', 'budgets', ['user_id'], unique=False)
    op.create_index('ix_budgets_category_id', 'budgets', ['category_id'], unique=False)
    op.create_index('idx_user_budget_dates', 'budgets', ['user_id', 'start_date', 'end_date'], unique=False)

    # 5. Create goals table
    op.create_table(
        'goals',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('goal_name', sa.String(length=150), nullable=False),
        sa.Column('goal_type', sa.String(length=50), nullable=True),
        sa.Column('target_amount', sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column('current_amount', sa.Numeric(precision=12, scale=2), server_default='0.00', nullable=False),
        sa.Column('target_date', sa.Date(), nullable=False),
        sa.Column('priority', sa.String(length=20), server_default='MEDIUM', nullable=False),
        sa.Column('status', sa.String(length=50), server_default='IN_PROGRESS', nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    )
    op.create_index('ix_goals_id', 'goals', ['id'], unique=False)
    op.create_index('ix_goals_user_id', 'goals', ['user_id'], unique=False)
    op.create_index('idx_user_goal_status', 'goals', ['user_id', 'status'], unique=False)

    # 6. Create forecast_histories table
    op.create_table(
        'forecast_histories',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('forecast_type', sa.String(length=50), nullable=False),
        sa.Column('forecast_period', sa.String(length=50), server_default='MONTHLY', nullable=False),
        sa.Column('prediction_json', postgresql.JSONB(astext_metadata=True), nullable=False),
        sa.Column('generated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    )
    op.create_index('ix_forecast_histories_id', 'forecast_histories', ['id'], unique=False)
    op.create_index('ix_forecast_histories_user_id', 'forecast_histories', ['user_id'], unique=False)
    op.create_index('idx_user_forecast_generated', 'forecast_histories', ['user_id', 'generated_at'], unique=False)

    # 7. Create financial_health_histories table
    op.create_table(
        'financial_health_histories',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('health_score', sa.Numeric(precision=5, scale=2), nullable=False),
        sa.Column('income_score', sa.Numeric(precision=5, scale=2), server_default='0.00', nullable=False),
        sa.Column('saving_score', sa.Numeric(precision=5, scale=2), server_default='0.00', nullable=False),
        sa.Column('budget_score', sa.Numeric(precision=5, scale=2), server_default='0.00', nullable=False),
        sa.Column('expense_score', sa.Numeric(precision=5, scale=2), server_default='0.00', nullable=False),
        sa.Column('calculated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    )
    op.create_index('ix_financial_health_histories_id', 'financial_health_histories', ['id'], unique=False)
    op.create_index('ix_financial_health_histories_user_id', 'financial_health_histories', ['user_id'], unique=False)
    op.create_index('idx_user_health_calculated', 'financial_health_histories', ['user_id', 'calculated_at'], unique=False)

    # 8. Create chat_histories table
    op.create_table(
        'chat_histories',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('question', sa.Text(), nullable=False),
        sa.Column('answer', sa.Text(), nullable=False),
        sa.Column('model_name', sa.String(length=100), server_default='gemini-1.5-pro', nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    )
    op.create_index('ix_chat_histories_id', 'chat_histories', ['id'], unique=False)
    op.create_index('ix_chat_histories_user_id', 'chat_histories', ['user_id'], unique=False)
    op.create_index('idx_user_chat_created', 'chat_histories', ['user_id', 'created_at'], unique=False)


def downgrade() -> None:
    op.drop_table('chat_histories')
    op.drop_table('financial_health_histories')
    op.drop_table('forecast_histories')
    op.drop_table('goals')
    op.drop_table('budgets')
    op.drop_table('transactions')
    op.drop_table('categories')
    op.drop_table('users')
