from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base
from app.domain.ingredient import IngredientUnit

if TYPE_CHECKING:
    from app.models.ingredient import Ingredient
    from app.models.user import User


class Recipe(Base):
    __tablename__ = "recipes"
    __table_args__ = (
        CheckConstraint("base_servings > 0", name="ck_recipes_base_servings_positive"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
    )
    parent_recipe_id: Mapped[int | None] = mapped_column(
        ForeignKey("recipes.id", ondelete="SET NULL"),
        index=True,
    )
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[str | None] = mapped_column(Text)
    base_servings: Mapped[int] = mapped_column(Integer)
    instructions: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )
    user: Mapped[User] = relationship(back_populates="recipes")
    recipe_ingredients: Mapped[list[RecipeIngredient]] = relationship(
        back_populates="recipe",
        cascade="all, delete-orphan",
        order_by="RecipeIngredient.ingredient_id",
    )

    @property
    def total_calories(self) -> Decimal:
        return sum(
            (
                recipe_ingredient.calories
                for recipe_ingredient in self.recipe_ingredients
            ),
            Decimal("0"),
        )

    @property
    def ingredient_count(self) -> int:
        return len(self.recipe_ingredients)

    @property
    def calories_per_serving(self) -> Decimal:
        return self.total_calories / Decimal(self.base_servings)


class RecipeIngredient(Base):
    __tablename__ = "recipe_ingredients"
    __table_args__ = (
        CheckConstraint("quantity > 0", name="ck_recipe_ingredients_quantity_positive"),
    )

    recipe_id: Mapped[int] = mapped_column(
        ForeignKey("recipes.id", ondelete="CASCADE"),
        primary_key=True,
    )
    ingredient_id: Mapped[int] = mapped_column(
        ForeignKey("ingredients.id"),
        primary_key=True,
        index=True,
    )
    quantity: Mapped[Decimal] = mapped_column(Numeric(10, 4))
    recipe: Mapped[Recipe] = relationship(back_populates="recipe_ingredients")
    ingredient: Mapped[Ingredient] = relationship(back_populates="recipe_ingredients")

    @property
    def ingredient_name(self) -> str:
        return self.ingredient.name

    @property
    def unit(self) -> IngredientUnit:
        return self.ingredient.unit

    @property
    def calories_per_unit(self) -> Decimal:
        return self.ingredient.calories_per_unit

    @property
    def calories(self) -> Decimal:
        return self.quantity * self.ingredient.calories_per_unit
