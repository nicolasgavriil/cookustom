from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user
from app.db.database import get_db
from app.models.ingredient import Ingredient
from app.models.user import User
from app.schemas.ingredient import IngredientCreateRequest, IngredientResponse

router = APIRouter(prefix="/ingredients", tags=["ingredients"])


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
