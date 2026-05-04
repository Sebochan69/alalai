"""add ai processed complaint

Revision ID: 6f8a9d1b3c2e
Revises: 4e8c83877202
Create Date: 2026-05-04 23:05:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "6f8a9d1b3c2e"
down_revision: Union[str, Sequence[str], None] = "4e8c83877202"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("reports", sa.Column("ai_processed_complaint", sa.Text(), nullable=True))
    op.execute("UPDATE reports SET status = 'in progress' WHERE status = 'ongoing'")
    op.execute("UPDATE reports SET status = 'resolved' WHERE status = 'closed'")


def downgrade() -> None:
    op.execute("UPDATE reports SET status = 'ongoing' WHERE status = 'in progress'")
    op.execute("UPDATE reports SET status = 'closed' WHERE status = 'resolved'")
    op.drop_column("reports", "ai_processed_complaint")
