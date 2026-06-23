"""create recipes tables

Revision ID: 2b8a1c6f4d9e
Revises: 7d1e9f4c8a2b
Create Date: 2026-06-20 00:00:00.000000
"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "2b8a1c6f4d9e"
down_revision: str | None = "7d1e9f4c8a2b"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "recipes",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("parent_recipe_id", sa.Integer(), nullable=True),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("base_servings", sa.Numeric(10, 4), nullable=False),
        sa.Column("instructions", sa.Text(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.CheckConstraint(
            "base_servings > 0",
            name="ck_recipes_base_servings_positive",
        ),
        sa.ForeignKeyConstraint(
            ["parent_recipe_id"],
            ["recipes.id"],
            ondelete="SET NULL",
        ),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_recipes_parent_recipe_id"),
        "recipes",
        ["parent_recipe_id"],
    )
    op.create_index(op.f("ix_recipes_user_id"), "recipes", ["user_id"])

    op.create_table(
        "recipe_ingredients",
        sa.Column("recipe_id", sa.Integer(), nullable=False),
        sa.Column("ingredient_id", sa.Integer(), nullable=False),
        sa.Column("quantity", sa.Numeric(10, 4), nullable=False),
        sa.CheckConstraint(
            "quantity > 0",
            name="ck_recipe_ingredients_quantity_positive",
        ),
        sa.ForeignKeyConstraint(["ingredient_id"], ["ingredients.id"]),
        sa.ForeignKeyConstraint(["recipe_id"], ["recipes.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("recipe_id", "ingredient_id"),
    )
    op.create_index(
        op.f("ix_recipe_ingredients_ingredient_id"),
        "recipe_ingredients",
        ["ingredient_id"],
    )


def downgrade() -> None:
    op.drop_index(
        op.f("ix_recipe_ingredients_ingredient_id"),
        table_name="recipe_ingredients",
    )
    op.drop_table("recipe_ingredients")
    op.drop_index(op.f("ix_recipes_user_id"), table_name="recipes")
    op.drop_index(op.f("ix_recipes_parent_recipe_id"), table_name="recipes")
    op.drop_table("recipes")
