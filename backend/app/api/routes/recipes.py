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
from app.schemas.recipe import RecipeCreateRequest, RecipeResponse

router = APIRouter(prefix="/recipes", tags=["recipes"])


@router.get("", response_model=list[RecipeResponse])
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
    ingredient_ids = [
        ingredient_input.ingredient_id for ingredient_input in recipe_create.ingredients
    ]
    ingredients = await db.scalars(
        select(Ingredient).where(
            Ingredient.user_id == current_user.id,
            Ingredient.id.in_(ingredient_ids),
        )
    )
    ingredients_by_id = {ingredient.id: ingredient for ingredient in ingredients}

    if len(ingredients_by_id) != len(ingredient_ids):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ingredient not found",
        )

    recipe = Recipe(
        user_id=current_user.id,
        parent_recipe_id=None,
        title=recipe_create.title,
        description=recipe_create.description,
        base_servings=recipe_create.base_servings,
        instructions=recipe_create.instructions,
        recipe_ingredients=[
            RecipeIngredient(
                ingredient=ingredients_by_id[ingredient_input.ingredient_id],
                quantity=ingredient_input.quantity,
            )
            for ingredient_input in recipe_create.ingredients
        ],
    )
    db.add(recipe)
    await db.commit()

    return recipe
