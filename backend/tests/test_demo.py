import asyncio
from datetime import UTC, datetime, timedelta
from decimal import Decimal

from fastapi.testclient import TestClient
from sqlalchemy import select

from app.core.security import create_access_token
from app.models.ingredient import Ingredient
from app.models.recipe import Recipe, RecipeIngredient
from app.models.user import User
from tests.conftest import TestAsyncSessionLocal


def auth_headers(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


def create_demo(client: TestClient) -> str:
    response = client.post("/demo")
    assert response.status_code == 201
    return response.json()["access_token"]


def assert_decimal_equal(value: str, expected: str) -> None:
    assert Decimal(value) == Decimal(expected)


async def create_expired_demo_user() -> int:
    async with TestAsyncSessionLocal() as session:
        user = User(
            email="expired-demo@demo.cookustom.com",
            password_hash="unused",
            demo_expires_at=datetime.now(UTC) - timedelta(minutes=1),
        )
        session.add(user)
        await session.flush()

        ingredient = Ingredient(
            user_id=user.id,
            name="Expired ingredient",
            unit="g",
            calories_per_unit=Decimal("1"),
        )
        recipe = Recipe(
            user_id=user.id,
            parent_recipe_id=None,
            title="Expired recipe",
            description=None,
            base_servings=1,
            instructions="Expired.",
            recipe_ingredients=[
                RecipeIngredient(
                    ingredient=ingredient,
                    quantity=Decimal("1"),
                )
            ],
        )
        session.add(recipe)
        await session.commit()

        return user.id


async def get_user(user_id: int) -> User | None:
    async with TestAsyncSessionLocal() as session:
        return await session.get(User, user_id)


async def get_user_owned_record_counts(user_id: int) -> tuple[int, int]:
    async with TestAsyncSessionLocal() as session:
        ingredient_ids = await session.scalars(
            select(Ingredient.id).where(Ingredient.user_id == user_id)
        )
        recipe_ids = await session.scalars(
            select(Recipe.id).where(Recipe.user_id == user_id)
        )
        return len(list(ingredient_ids)), len(list(recipe_ids))


def test_create_demo_returns_authenticated_seeded_session(
    client: TestClient,
) -> None:
    token = create_demo(client)
    headers = auth_headers(token)

    current_user_response = client.get("/auth/me", headers=headers)
    ingredients_response = client.get("/ingredients", headers=headers)
    recipes_response = client.get("/recipes", headers=headers)

    assert current_user_response.status_code == 200
    current_user = current_user_response.json()
    assert current_user["email"].startswith("demo-")
    assert current_user["is_demo"] is True

    assert ingredients_response.status_code == 200
    ingredients = ingredients_response.json()
    assert len(ingredients) == 8
    assert {ingredient["name"] for ingredient in ingredients} == {
        "Avocado",
        "Bell pepper",
        "Black beans",
        "Chicken breast",
        "Cooked brown rice",
        "Egg",
        "Olive oil",
        "Whole grain toast",
    }
    assert {ingredient["unit"] for ingredient in ingredients} == {
        "g",
        "ml",
        "piece",
    }

    assert recipes_response.status_code == 200
    recipes = recipes_response.json()
    assert len(recipes) == 4
    recipes_by_title = {recipe["title"]: recipe for recipe in recipes}
    original = recipes_by_title["Chicken rice bowl"]
    breakfast = recipes_by_title["Avocado egg toast"]
    higher_protein = recipes_by_title["Higher-protein rice bowl"]
    vegetarian = recipes_by_title["Vegetarian rice bowl"]

    assert original["parent_recipe_id"] is None
    assert breakfast["parent_recipe_id"] is None
    assert higher_protein["parent_recipe_id"] == original["id"]
    assert vegetarian["parent_recipe_id"] == original["id"]
    assert_decimal_equal(original["total_calories"], "1053")
    assert_decimal_equal(original["calories_per_serving"], "526.5")


def test_create_demo_sessions_are_isolated(client: TestClient) -> None:
    first_token = create_demo(client)
    second_token = create_demo(client)

    first_user = client.get(
        "/auth/me",
        headers=auth_headers(first_token),
    ).json()
    second_user = client.get(
        "/auth/me",
        headers=auth_headers(second_token),
    ).json()
    first_recipes = client.get(
        "/recipes",
        headers=auth_headers(first_token),
    ).json()
    second_recipes = client.get(
        "/recipes",
        headers=auth_headers(second_token),
    ).json()

    assert first_user["id"] != second_user["id"]
    assert {recipe["id"] for recipe in first_recipes}.isdisjoint(
        {recipe["id"] for recipe in second_recipes}
    )


def test_create_demo_removes_expired_demo_data(client: TestClient) -> None:
    expired_user_id = asyncio.run(create_expired_demo_user())

    create_demo(client)

    assert asyncio.run(get_user(expired_user_id)) is None
    assert asyncio.run(get_user_owned_record_counts(expired_user_id)) == (0, 0)


def test_expired_demo_user_is_rejected_with_valid_token(
    client: TestClient,
) -> None:
    expired_user_id = asyncio.run(create_expired_demo_user())
    token = create_access_token(
        subject=str(expired_user_id),
        expires_at=datetime.now(UTC) + timedelta(minutes=5),
    )

    response = client.get("/auth/me", headers=auth_headers(token))

    assert response.status_code == 401
    assert response.json() == {"detail": "Invalid authentication credentials"}
