from collections.abc import Sequence
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.dependencies import get_current_user
from app.db.database import get_db
from app.models.ingredient import Ingredient
from app.models.recipe import Recipe, RecipeIngredient
from app.models.user import User
from app.schemas.recipe import (
    RecipeCreateRequest,
    RecipeIngredientCreateRequest,
    RecipeResponse,
    RecipeSummaryResponse,
    RecipeUpdateRequest,
)

router = APIRouter(prefix="/recipes", tags=["recipes"])


@router.get("", response_model=list[RecipeSummaryResponse])
async def list_recipes(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> list[Recipe]:
    result = await db.scalars(
        select(Recipe)
        .options(
            selectinload(Recipe.recipe_ingredients).joinedload(
                RecipeIngredient.ingredient
            )
        )
        .where(Recipe.user_id == current_user.id)
        .order_by(Recipe.created_at.desc(), Recipe.id.desc())
    )

    return list(result)


@router.post(
    "",
    response_model=RecipeResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_recipe(
    recipe_create: RecipeCreateRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> Recipe:
    ingredients_by_id = await get_user_ingredients_by_id(
        db,
        current_user,
        recipe_create.ingredients,
    )

    recipe = Recipe(
        user_id=current_user.id,
        parent_recipe_id=None,
        title=recipe_create.title,
        description=recipe_create.description,
        base_servings=recipe_create.base_servings,
        instructions=recipe_create.instructions,
        recipe_ingredients=build_recipe_ingredients(
            recipe_create.ingredients,
            ingredients_by_id,
        ),
    )
    db.add(recipe)
    await db.commit()

    return recipe


@router.post(
    "/{recipe_id}/variants",
    response_model=RecipeResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_recipe_variant(
    recipe_id: int,
    recipe_create: RecipeCreateRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> Recipe:
    source_recipe = await db.scalar(
        select(Recipe).where(
            Recipe.id == recipe_id,
            Recipe.user_id == current_user.id,
        )
    )
    if source_recipe is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recipe not found",
        )

    ingredients_by_id = await get_user_ingredients_by_id(
        db,
        current_user,
        recipe_create.ingredients,
    )
    recipe = Recipe(
        user_id=current_user.id,
        parent_recipe_id=get_variant_parent_recipe_id(source_recipe),
        title=recipe_create.title,
        description=recipe_create.description,
        base_servings=recipe_create.base_servings,
        instructions=recipe_create.instructions,
        recipe_ingredients=build_recipe_ingredients(
            recipe_create.ingredients,
            ingredients_by_id,
        ),
    )
    db.add(recipe)
    await db.commit()

    return recipe


@router.get("/{recipe_id}", response_model=RecipeResponse)
async def get_recipe(
    recipe_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> Recipe:
    recipe = await db.scalar(
        select(Recipe)
        .options(
            selectinload(Recipe.recipe_ingredients).joinedload(
                RecipeIngredient.ingredient
            )
        )
        .where(
            Recipe.id == recipe_id,
            Recipe.user_id == current_user.id,
        )
    )
    if recipe is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recipe not found",
        )

    return recipe


@router.put("/{recipe_id}", response_model=RecipeResponse)
async def update_recipe(
    recipe_id: int,
    recipe_update: RecipeUpdateRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> Recipe:
    recipe = await db.scalar(
        select(Recipe)
        .options(
            selectinload(Recipe.recipe_ingredients).joinedload(
                RecipeIngredient.ingredient
            )
        )
        .where(
            Recipe.id == recipe_id,
            Recipe.user_id == current_user.id,
        )
    )
    if recipe is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recipe not found",
        )

    ingredients_by_id = await get_user_ingredients_by_id(
        db,
        current_user,
        recipe_update.ingredients,
    )

    recipe.title = recipe_update.title
    recipe.description = recipe_update.description
    recipe.base_servings = recipe_update.base_servings
    recipe.instructions = recipe_update.instructions
    sync_recipe_ingredients(recipe, recipe_update, ingredients_by_id)
    await db.commit()

    return recipe


@router.delete("/{recipe_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_recipe(
    recipe_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> None:
    recipe = await db.scalar(
        select(Recipe).where(
            Recipe.id == recipe_id,
            Recipe.user_id == current_user.id,
        )
    )
    if recipe is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recipe not found",
        )

    await db.delete(recipe)
    await db.commit()


def sync_recipe_ingredients(
    recipe: Recipe,
    recipe_update: RecipeUpdateRequest,
    ingredients_by_id: dict[int, Ingredient],
) -> None:
    existing_by_ingredient_id = {
        recipe_ingredient.ingredient_id: recipe_ingredient
        for recipe_ingredient in recipe.recipe_ingredients
    }
    incoming_ingredient_ids = {
        ingredient_input.ingredient_id for ingredient_input in recipe_update.ingredients
    }

    recipe.recipe_ingredients[:] = [
        recipe_ingredient
        for recipe_ingredient in recipe.recipe_ingredients
        if recipe_ingredient.ingredient_id in incoming_ingredient_ids
    ]

    for ingredient_input in recipe_update.ingredients:
        existing_recipe_ingredient = existing_by_ingredient_id.get(
            ingredient_input.ingredient_id
        )
        if existing_recipe_ingredient is None:
            recipe.recipe_ingredients.append(
                RecipeIngredient(
                    ingredient_id=ingredient_input.ingredient_id,
                    ingredient=ingredients_by_id[ingredient_input.ingredient_id],
                    quantity=ingredient_input.quantity,
                )
            )
            continue

        existing_recipe_ingredient.quantity = ingredient_input.quantity

    recipe.recipe_ingredients.sort(
        key=lambda recipe_ingredient: recipe_ingredient.ingredient_id
    )


async def get_user_ingredients_by_id(
    db: AsyncSession,
    current_user: User,
    ingredient_inputs: Sequence[RecipeIngredientCreateRequest],
) -> dict[int, Ingredient]:
    ingredient_input_ids = [
        ingredient_input.ingredient_id for ingredient_input in ingredient_inputs
    ]
    ingredients = await db.scalars(
        select(Ingredient).where(
            Ingredient.user_id == current_user.id,
            Ingredient.id.in_(ingredient_input_ids),
        )
    )
    ingredients_by_id = {ingredient.id: ingredient for ingredient in ingredients}

    if len(ingredients_by_id) != len(ingredient_input_ids):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ingredient not found",
        )

    return ingredients_by_id


def build_recipe_ingredients(
    ingredient_inputs: Sequence[RecipeIngredientCreateRequest],
    ingredients_by_id: dict[int, Ingredient],
) -> list[RecipeIngredient]:
    return [
        RecipeIngredient(
            ingredient=ingredients_by_id[ingredient_input.ingredient_id],
            quantity=ingredient_input.quantity,
        )
        for ingredient_input in ingredient_inputs
    ]


def get_variant_parent_recipe_id(source_recipe: Recipe) -> int:
    return source_recipe.parent_recipe_id or source_recipe.id
