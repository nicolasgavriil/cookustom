from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.domain.ingredient import IngredientUnit


class RecipeIngredientCreateRequest(BaseModel):
    ingredient_id: int
    quantity: Decimal = Field(gt=0, max_digits=10, decimal_places=4)


class RecipeCreateRequest(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    description: str | None = None
    base_servings: int = Field(ge=1)
    instructions: str = Field(min_length=1)
    ingredients: list[RecipeIngredientCreateRequest] = Field(min_length=1)

    @field_validator("title")
    @classmethod
    def normalize_title(cls, value: str) -> str:
        title = value.strip()
        if not title:
            raise ValueError("Title cannot be empty")
        return title

    @field_validator("description")
    @classmethod
    def normalize_description(cls, value: str | None) -> str | None:
        if value is None:
            return None

        description = value.strip()
        return description or None

    @field_validator("instructions")
    @classmethod
    def normalize_instructions(cls, value: str) -> str:
        instructions = value.strip()
        if not instructions:
            raise ValueError("Instructions cannot be empty")
        return instructions

    @field_validator("ingredients")
    @classmethod
    def reject_duplicate_ingredient_ids(
        cls,
        value: list[RecipeIngredientCreateRequest],
    ) -> list[RecipeIngredientCreateRequest]:
        ingredient_ids = [ingredient.ingredient_id for ingredient in value]
        if len(ingredient_ids) != len(set(ingredient_ids)):
            raise ValueError("Recipe cannot contain duplicate ingredients")
        return value


class RecipeIngredientResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    ingredient_id: int
    ingredient_name: str
    unit: IngredientUnit
    quantity: Decimal
    calories_per_unit: Decimal
    calories: Decimal


class RecipeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    parent_recipe_id: int | None
    title: str
    description: str | None
    base_servings: int
    instructions: str
    created_at: datetime
    ingredients: list[RecipeIngredientResponse] = Field(
        validation_alias="recipe_ingredients"
    )
    total_calories: Decimal
    calories_per_serving: Decimal
