"""drop forecast_histories table

Revision ID: 005_drop_forecast_histories
Revises: 004_email_verifications
Create Date: 2026-08-18 13:15:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '005_drop_forecast_histories'
down_revision: Union[str, None] = '004_email_verifications'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Drop forecast_histories table and associated indexes
    op.execute("DROP TABLE IF EXISTS forecast_histories CASCADE;")


def downgrade() -> None:
    pass
