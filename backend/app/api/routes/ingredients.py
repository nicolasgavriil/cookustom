from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user
from app.db.database import get_db
from app.models.ingredient import Ingredient
from app.models.recipe import RecipeIngredient
from app.models.user import User
from app.schemas.ingredient import (
    IngredientCreateRequest,
    IngredientResponse,
    IngredientUpdateRequest,
)

router = APIRouter(prefix="/ingredients", tags=["ingredients"])


@router.get("", response_model=list[IngredientResponse])
async def list_ingredients(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> list[Ingredient]:
    result = await db.scalars(
        select(Ingredient)
        .where(Ingredient.user_id == current_user.id)
        .order_by(Ingredient.name)
    )

    return list(result)


@router.post(
    "",
    response_model=IngredientResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_ingredient(
    ingredient_create: IngredientCreateRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> Ingredient:
    existing_ingredient = await db.scalar(
        select(Ingredient).where(
            Ingredient.user_id == current_user.id,
            Ingredient.name == ingredient_create.name,
        )
    )
    if existing_ingredient is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ingredient already exists",
        )

    ingredient = Ingredient(
        user_id=current_user.id,
        name=ingredient_create.name,
        unit=ingredient_create.unit,
        calories_per_unit=ingredient_create.calories_per_unit,
    )
    db.add(ingredient)
    await db.commit()
    await db.refresh(ingredient)

    return ingredient


@router.put("/{ingredient_id}", response_model=IngredientResponse)
async def update_ingredient(
    ingredient_id: int,
    ingredient_update: IngredientUpdateRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> Ingredient:
    ingredient = await db.scalar(
        select(Ingredient).where(
            Ingredient.id == ingredient_id,
            Ingredient.user_id == current_user.id,
        )
    )
    if ingredient is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ingredient not found",
        )

    duplicate_ingredient = await db.scalar(
        select(Ingredient).where(
            Ingredient.user_id == current_user.id,
            Ingredient.name == ingredient_update.name,
            Ingredient.id != ingredient.id,
        )
    )
    if duplicate_ingredient is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ingredient already exists",
        )

    ingredient.name = ingredient_update.name
    ingredient.unit = ingredient_update.unit
    ingredient.calories_per_unit = ingredient_update.calories_per_unit
    await db.commit()
    await db.refresh(ingredient)

    return ingredient


@router.delete("/{ingredient_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_ingredient(
    ingredient_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> None:
    ingredient = await db.scalar(
        select(Ingredient).where(
            Ingredient.id == ingredient_id,
            Ingredient.user_id == current_user.id,
        )
    )
    if ingredient is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ingredient not found",
        )

    used_ingredient_id = await db.scalar(
        select(RecipeIngredient.ingredient_id)
        .where(RecipeIngredient.ingredient_id == ingredient.id)
        .limit(1)
    )
    if used_ingredient_id is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ingredient is used by a recipe",
        )

    await db.delete(ingredient)
    await db.commit()
