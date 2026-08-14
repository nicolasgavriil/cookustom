"""add demo user expiration

Revision ID: c4d8e2a91f36
Revises: 9c4f2a7b6d1e
Create Date: 2026-08-11 00:00:00.000000
"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "c4d8e2a91f36"
down_revision: str | None = "9c4f2a7b6d1e"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column("demo_expires_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index(
        op.f("ix_users_demo_expires_at"),
        "users",
        ["demo_expires_at"],
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_users_demo_expires_at"), table_name="users")
    op.drop_column("users", "demo_expires_at")
