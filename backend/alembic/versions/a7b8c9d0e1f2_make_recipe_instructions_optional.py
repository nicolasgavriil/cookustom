"""make recipe instructions optional

Revision ID: a7b8c9d0e1f2
Revises: e6f9a2b3c4d5
Create Date: 2026-09-23 00:00:00.000000
"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "a7b8c9d0e1f2"
down_revision: str | None = "e6f9a2b3c4d5"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.alter_column("recipes", "instructions", existing_type=sa.Text(), nullable=True)


def downgrade() -> None:
    op.alter_column("recipes", "instructions", existing_type=sa.Text(), nullable=False)
