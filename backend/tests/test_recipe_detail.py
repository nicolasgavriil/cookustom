from decimal import Decimal

from fastapi.testclient import TestClient

from tests.conftest import login_user, register_user


def auth_headers(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


def create_ingredient(
    client: TestClient,
    token: str,
    name: str,
    unit: str = "g",
    calories_per_unit: str = "1.3",
) -> dict:
    response = client.post(
        "/ingredients",
        headers=auth_headers(token),
        json={
            "name": name,
            "unit": unit,
            "calories_per_unit": calories_per_unit,
        },
    )
    assert response.status_code == 201
    return response.json()


def create_recipe(
    client: TestClient,
    token: str,
    title: str,
    ingredient_id: int,
    quantity: str = "100",
) -> dict:
    response = client.post(
        "/recipes",
        headers=auth_headers(token),
        json={
            "title": title,
            "description": "Simple meal",
            "base_servings": 2,
            "instructions": "Cook and serve.",
            "ingredients": [
                {
                    "ingredient_id": ingredient_id,
                    "quantity": quantity,
                }
            ],
        },
    )
    assert response.status_code == 201
    return response.json()


def assert_decimal_equal(value: str, expected: str) -> None:
    assert Decimal(value) == Decimal(expected)


def test_get_recipe_returns_recipe_with_nested_ingredients_and_calories(
    client: TestClient,
) -> None:
    register_user(client)
    token = login_user(client)
    rice = create_ingredient(
        client,
        token,
        name="Rice",
        unit="g",
        calories_per_unit="1.3",
    )
    recipe = create_recipe(client, token, "Rice bowl", rice["id"])

    response = client.get(f"/recipes/{recipe['id']}", headers=auth_headers(token))

    assert response.status_code == 200
    data = response.json()
    assert data["id"] == recipe["id"]
    assert data["title"] == "Rice bowl"
    assert data["description"] == "Simple meal"
    assert data["base_servings"] == 2
    assert data["instructions"] == "Cook and serve."
    assert data["total_calories"] == 130
    assert data["calories_per_serving"] == 65

    ingredient = data["ingredients"][0]
    assert ingredient["ingredient_id"] == rice["id"]
    assert ingredient["ingredient_name"] == "Rice"
    assert ingredient["unit"] == "g"
    assert_decimal_equal(ingredient["quantity"], "100")
    assert_decimal_equal(ingredient["calories_per_unit"], "1.3")
    assert ingredient["calories"] == 130


def test_get_recipe_rejects_missing_token(client: TestClient) -> None:
    response = client.get("/recipes/1")

    assert response.status_code == 401
    assert response.json() == {"detail": "Invalid authentication credentials"}


def test_get_recipe_returns_not_found_for_unknown_recipe(
    client: TestClient,
) -> None:
    register_user(client)
    token = login_user(client)

    response = client.get("/recipes/999999", headers=auth_headers(token))

    assert response.status_code == 404
    assert response.json() == {"detail": "Recipe not found"}


def test_get_recipe_returns_not_found_for_other_users_recipe(
    client: TestClient,
) -> None:
    register_user(client)
    first_token = login_user(client)
    rice = create_ingredient(client, first_token, name="Rice")
    recipe = create_recipe(client, first_token, "Rice bowl", rice["id"])

    register_user(client, email="another.user@example.com")
    second_token = login_user(client, email="another.user@example.com")

    response = client.get(
        f"/recipes/{recipe['id']}",
        headers=auth_headers(second_token),
    )

    assert response.status_code == 404
    assert response.json() == {"detail": "Recipe not found"}
