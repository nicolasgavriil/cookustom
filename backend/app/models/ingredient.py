from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    ForeignKey,
    Numeric,
    String,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base
from app.domain.ingredient import IngredientUnit

if TYPE_CHECKING:
    from app.models.recipe import RecipeIngredient


class Ingredient(Base):
    __tablename__ = "ingredients"
    __table_args__ = (
        CheckConstraint(
            "unit in ('g', 'ml', 'piece')",
            name="ck_ingredients_unit",
        ),
        UniqueConstraint("user_id", "name", name="uq_ingredients_user_id_name"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
    )
    name: Mapped[str] = mapped_column(String(255))
    unit: Mapped[IngredientUnit] = mapped_column(String(20))
    calories_per_unit: Mapped[Decimal] = mapped_column(Numeric(10, 4))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )
    recipe_ingredients: Mapped[list[RecipeIngredient]] = relationship(
        back_populates="ingredient",
    )
