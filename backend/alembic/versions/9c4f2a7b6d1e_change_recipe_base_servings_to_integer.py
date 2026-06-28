"""change recipe base servings to integer

Revision ID: 9c4f2a7b6d1e
Revises: 2b8a1c6f4d9e
Create Date: 2026-06-24 00:00:00.000000
"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "9c4f2a7b6d1e"
down_revision: str | None = "2b8a1c6f4d9e"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.alter_column(
        "recipes",
        "base_servings",
        existing_type=sa.Numeric(10, 4),
        type_=sa.Integer(),
        existing_nullable=False,
        postgresql_using="base_servings::integer",
    )


def downgrade() -> None:
    op.alter_column(
        "recipes",
        "base_servings",
        existing_type=sa.Integer(),
        type_=sa.Numeric(10, 4),
        existing_nullable=False,
    )
