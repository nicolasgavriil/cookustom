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


def test_list_recipes_returns_empty_list_for_new_user(client: TestClient) -> None:
    register_user(client)
    token = login_user(client)

    response = client.get("/recipes", headers=auth_headers(token))

    assert response.status_code == 200
    assert response.json() == []


def test_list_recipes_returns_current_users_recipes(client: TestClient) -> None:
    register_user(client)
    first_token = login_user(client)
    rice = create_ingredient(client, first_token, name="Rice")
    first_recipe = create_recipe(client, first_token, "Rice bowl", rice["id"])

    register_user(client, email="another.user@example.com")
    second_token = login_user(client, email="another.user@example.com")
    pasta = create_ingredient(client, second_token, name="Pasta")
    create_recipe(client, second_token, "Pasta bowl", pasta["id"])

    response = client.get("/recipes", headers=auth_headers(first_token))

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["id"] == first_recipe["id"]
    assert data[0]["title"] == "Rice bowl"


def test_list_recipes_includes_nested_ingredients_and_calories(
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
    egg = create_ingredient(
        client,
        token,
        name="Egg",
        unit="piece",
        calories_per_unit="70",
    )
    create_response = client.post(
        "/recipes",
        headers=auth_headers(token),
        json={
            "title": "Rice bowl",
            "description": None,
            "base_servings": 2,
            "instructions": "Cook rice. Add egg.",
            "ingredients": [
                {"ingredient_id": rice["id"], "quantity": "100"},
                {"ingredient_id": egg["id"], "quantity": "2"},
            ],
        },
    )
    assert create_response.status_code == 201

    response = client.get("/recipes", headers=auth_headers(token))

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    recipe = data[0]
    assert recipe["title"] == "Rice bowl"
    assert recipe["total_calories"] == 270
    assert recipe["calories_per_serving"] == 135

    rice_response = recipe["ingredients"][0]
    assert rice_response["ingredient_id"] == rice["id"]
    assert rice_response["ingredient_name"] == "Rice"
    assert rice_response["unit"] == "g"
    assert_decimal_equal(rice_response["quantity"], "100")
    assert_decimal_equal(rice_response["calories_per_unit"], "1.3")
    assert rice_response["calories"] == 130

    egg_response = recipe["ingredients"][1]
    assert egg_response["ingredient_id"] == egg["id"]
    assert egg_response["ingredient_name"] == "Egg"
    assert egg_response["unit"] == "piece"
    assert_decimal_equal(egg_response["quantity"], "2")
    assert_decimal_equal(egg_response["calories_per_unit"], "70")
    assert egg_response["calories"] == 140


def test_list_recipes_returns_newest_recipe_first(client: TestClient) -> None:
    register_user(client)
    token = login_user(client)
    rice = create_ingredient(client, token, name="Rice")
    first_recipe = create_recipe(client, token, "First recipe", rice["id"])
    second_recipe = create_recipe(client, token, "Second recipe", rice["id"])

    response = client.get("/recipes", headers=auth_headers(token))

    assert response.status_code == 200
    data = response.json()
    assert [recipe["id"] for recipe in data] == [
        second_recipe["id"],
        first_recipe["id"],
    ]


def test_list_recipes_rejects_missing_token(client: TestClient) -> None:
    response = client.get("/recipes")

    assert response.status_code == 401
    assert response.json() == {"detail": "Invalid authentication credentials"}
