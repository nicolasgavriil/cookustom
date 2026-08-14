from dataclasses import dataclass
from datetime import UTC, datetime
from decimal import Decimal
from secrets import token_urlsafe
from uuid import uuid4

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import hash_password
from app.domain.ingredient import IngredientUnit
from app.models.ingredient import Ingredient
from app.models.recipe import Recipe, RecipeIngredient
from app.models.user import User


@dataclass(frozen=True)
class DemoIngredientSeed:
    key: str
    name: str
    unit: IngredientUnit
    calories_per_unit: Decimal


@dataclass(frozen=True)
class DemoRecipeIngredientSeed:
    ingredient_key: str
    quantity: Decimal


@dataclass(frozen=True)
class DemoRecipeSeed:
    key: str
    title: str
    description: str
    base_servings: int
    instructions: str
    ingredients: tuple[DemoRecipeIngredientSeed, ...]
    parent_key: str | None = None


DEMO_INGREDIENTS = (
    DemoIngredientSeed("rice", "Cooked brown rice", "g", Decimal("1.30")),
    DemoIngredientSeed("chicken", "Chicken breast", "g", Decimal("1.65")),
    DemoIngredientSeed("beans", "Black beans", "g", Decimal("1.32")),
    DemoIngredientSeed("pepper", "Bell pepper", "g", Decimal("0.31")),
    DemoIngredientSeed("avocado", "Avocado", "g", Decimal("1.60")),
    DemoIngredientSeed("oil", "Olive oil", "ml", Decimal("8.10")),
    DemoIngredientSeed("egg", "Egg", "piece", Decimal("72")),
    DemoIngredientSeed("toast", "Whole grain toast", "piece", Decimal("95")),
)

DEMO_RECIPES = (
    DemoRecipeSeed(
        key="rice-bowl",
        title="Chicken rice bowl",
        description="A balanced weeknight bowl with chicken and roasted pepper.",
        base_servings=2,
        instructions=(
            "Warm the cooked rice.\n"
            "Cook the chicken until golden and fully cooked.\n"
            "Saute the pepper in olive oil, then divide everything between bowls."
        ),
        ingredients=(
            DemoRecipeIngredientSeed("rice", Decimal("300")),
            DemoRecipeIngredientSeed("chicken", Decimal("300")),
            DemoRecipeIngredientSeed("pepper", Decimal("150")),
            DemoRecipeIngredientSeed("oil", Decimal("15")),
        ),
    ),
    DemoRecipeSeed(
        key="breakfast-toast",
        title="Avocado egg toast",
        description="A quick breakfast with avocado, eggs, and whole grain toast.",
        base_servings=2,
        instructions=(
            "Toast the bread.\n"
            "Mash the avocado and spread it over each slice.\n"
            "Cook the eggs to your preference and serve them on top."
        ),
        ingredients=(
            DemoRecipeIngredientSeed("avocado", Decimal("150")),
            DemoRecipeIngredientSeed("egg", Decimal("2")),
            DemoRecipeIngredientSeed("toast", Decimal("2")),
            DemoRecipeIngredientSeed("oil", Decimal("5")),
        ),
    ),
    DemoRecipeSeed(
        key="higher-protein-bowl",
        parent_key="rice-bowl",
        title="Higher-protein rice bowl",
        description="More chicken and less rice while keeping the original intact.",
        base_servings=2,
        instructions=(
            "Warm the cooked rice.\n"
            "Cook the chicken until golden and fully cooked.\n"
            "Saute the pepper in olive oil, then divide everything between bowls."
        ),
        ingredients=(
            DemoRecipeIngredientSeed("rice", Decimal("200")),
            DemoRecipeIngredientSeed("chicken", Decimal("450")),
            DemoRecipeIngredientSeed("pepper", Decimal("150")),
            DemoRecipeIngredientSeed("oil", Decimal("15")),
        ),
    ),
    DemoRecipeSeed(
        key="vegetarian-bowl",
        parent_key="rice-bowl",
        title="Vegetarian rice bowl",
        description="Black beans and avocado replace the chicken.",
        base_servings=2,
        instructions=(
            "Warm the cooked rice and black beans.\n"
            "Saute the pepper until tender.\n"
            "Divide between bowls and finish with sliced avocado."
        ),
        ingredients=(
            DemoRecipeIngredientSeed("rice", Decimal("300")),
            DemoRecipeIngredientSeed("beans", Decimal("300")),
            DemoRecipeIngredientSeed("pepper", Decimal("150")),
            DemoRecipeIngredientSeed("avocado", Decimal("200")),
        ),
    ),
)


async def provision_demo_user(
    db: AsyncSession,
    expires_at: datetime,
) -> User:
    expired_demo_user_ids = select(User.id).where(
        User.demo_expires_at <= datetime.now(UTC)
    )
    await db.execute(delete(Recipe).where(Recipe.user_id.in_(expired_demo_user_ids)))
    await db.execute(delete(User).where(User.id.in_(expired_demo_user_ids)))

    user = User(
        email=f"demo-{uuid4().hex}@demo.cookustom.com",
        password_hash=hash_password(token_urlsafe(32)),
        demo_expires_at=expires_at,
    )
    db.add(user)
    await db.flush()

    ingredients_by_key = {
        seed.key: Ingredient(
            user_id=user.id,
            name=seed.name,
            unit=seed.unit,
            calories_per_unit=seed.calories_per_unit,
        )
        for seed in DEMO_INGREDIENTS
    }
    db.add_all(ingredients_by_key.values())
    await db.flush()

    recipes_by_key: dict[str, Recipe] = {}
    for seed in DEMO_RECIPES:
        if seed.parent_key is not None:
            continue

        recipe = build_demo_recipe(seed, user.id, ingredients_by_key)
        recipes_by_key[seed.key] = recipe
        db.add(recipe)

    await db.flush()

    for seed in DEMO_RECIPES:
        if seed.parent_key is None:
            continue

        recipe = build_demo_recipe(
            seed,
            user.id,
            ingredients_by_key,
            parent_recipe_id=recipes_by_key[seed.parent_key].id,
        )
        recipes_by_key[seed.key] = recipe
        db.add(recipe)

    await db.flush()
    return user


def build_demo_recipe(
    seed: DemoRecipeSeed,
    user_id: int,
    ingredients_by_key: dict[str, Ingredient],
    parent_recipe_id: int | None = None,
) -> Recipe:
    return Recipe(
        user_id=user_id,
        parent_recipe_id=parent_recipe_id,
        title=seed.title,
        description=seed.description,
        base_servings=seed.base_servings,
        instructions=seed.instructions,
        recipe_ingredients=[
            RecipeIngredient(
                ingredient=ingredients_by_key[ingredient_seed.ingredient_key],
                quantity=ingredient_seed.quantity,
            )
            for ingredient_seed in seed.ingredients
        ],
    )
