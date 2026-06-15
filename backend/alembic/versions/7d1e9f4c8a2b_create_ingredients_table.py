"""create ingredients table

Revision ID: 7d1e9f4c8a2b
Revises: f124471e24a7
Create Date: 2026-06-15 20:45:00.000000
"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "7d1e9f4c8a2b"
down_revision: str | None = "f124471e24a7"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "ingredients",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("unit", sa.String(length=20), nullable=False),
        sa.Column("calories_per_unit", sa.Numeric(10, 4), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.CheckConstraint("unit in ('g', 'ml', 'piece')", name="ck_ingredients_unit"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", "name", name="uq_ingredients_user_id_name"),
    )
    op.create_index(op.f("ix_ingredients_user_id"), "ingredients", ["user_id"])


def downgrade() -> None:
    op.drop_index(op.f("ix_ingredients_user_id"), table_name="ingredients")
    op.drop_table("ingredients")
