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
    ingredients: list[dict],
) -> dict:
    response = client.post(
        "/recipes",
        headers=auth_headers(token),
        json={
            "title": title,
            "description": "Original description",
            "base_servings": 2,
            "instructions": "Original instructions.",
            "ingredients": ingredients,
        },
    )
    assert response.status_code == 201
    return response.json()


def recipe_update_payload(ingredient_id: int) -> dict:
    return {
        "title": "Updated recipe",
        "description": "Updated description",
        "base_servings": 4,
        "instructions": "Updated instructions.",
        "ingredients": [{"ingredient_id": ingredient_id, "quantity": "150"}],
    }


def assert_decimal_equal(value: str, expected: str) -> None:
    assert Decimal(value) == Decimal(expected)


def test_update_recipe_updates_fields_and_ingredients(client: TestClient) -> None:
    register_user(client)
    token = login_user(client)
    chicken = create_ingredient(
        client,
        token,
        name="Chicken",
        unit="g",
        calories_per_unit="2.5",
    )
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
    recipe = create_recipe(
        client,
        token,
        "Original recipe",
        [
            {"ingredient_id": rice["id"], "quantity": "100"},
            {"ingredient_id": egg["id"], "quantity": "2"},
        ],
    )

    response = client.put(
        f"/recipes/{recipe['id']}",
        headers=auth_headers(token),
        json={
            "title": "  Updated rice bowl  ",
            "description": "  Updated description  ",
            "base_servings": 4,
            "instructions": "  Updated instructions.  ",
            "ingredients": [
                {"ingredient_id": rice["id"], "quantity": "150"},
                {"ingredient_id": chicken["id"], "quantity": "200"},
            ],
        },
    )

    assert response.status_code == 200
    data = response.json()
    assert data["id"] == recipe["id"]
    assert data["title"] == "Updated rice bowl"
    assert data["description"] == "Updated description"
    assert data["base_servings"] == 4
    assert data["instructions"] == "Updated instructions."
    assert_decimal_equal(data["total_calories"], "695")
    assert_decimal_equal(data["calories_per_serving"], "173.75")

    ingredient_ids = {ingredient["ingredient_id"] for ingredient in data["ingredients"]}
    assert ingredient_ids == {rice["id"], chicken["id"]}
    assert [
        ingredient["ingredient_id"] for ingredient in data["ingredients"]
    ] == sorted(ingredient_ids)

    rice_response = next(
        ingredient
        for ingredient in data["ingredients"]
        if ingredient["ingredient_id"] == rice["id"]
    )
    assert rice_response["ingredient_name"] == "Rice"
    assert rice_response["unit"] == "g"
    assert_decimal_equal(rice_response["quantity"], "150")
    assert_decimal_equal(rice_response["calories_per_unit"], "1.3")
    assert_decimal_equal(rice_response["calories"], "195")

    chicken_response = next(
        ingredient
        for ingredient in data["ingredients"]
        if ingredient["ingredient_id"] == chicken["id"]
    )
    assert chicken_response["ingredient_name"] == "Chicken"
    assert chicken_response["unit"] == "g"
    assert_decimal_equal(chicken_response["quantity"], "200")
    assert_decimal_equal(chicken_response["calories_per_unit"], "2.5")
    assert_decimal_equal(chicken_response["calories"], "500")


def test_update_recipe_rejects_missing_token(client: TestClient) -> None:
    response = client.put(
        "/recipes/1",
        json=recipe_update_payload(ingredient_id=1),
    )

    assert response.status_code == 401
    assert response.json() == {"detail": "Invalid authentication credentials"}


def test_update_recipe_returns_not_found_for_unknown_recipe(
    client: TestClient,
) -> None:
    register_user(client)
    token = login_user(client)
    rice = create_ingredient(client, token, name="Rice")

    response = client.put(
        "/recipes/999999",
        headers=auth_headers(token),
        json=recipe_update_payload(ingredient_id=rice["id"]),
    )

    assert response.status_code == 404
    assert response.json() == {"detail": "Recipe not found"}


def test_update_recipe_returns_not_found_for_other_users_recipe(
    client: TestClient,
) -> None:
    register_user(client)
    first_token = login_user(client)
    rice = create_ingredient(client, first_token, name="Rice")
    recipe = create_recipe(
        client,
        first_token,
        "Rice bowl",
        [{"ingredient_id": rice["id"], "quantity": "100"}],
    )

    register_user(client, email="another.user@example.com")
    second_token = login_user(client, email="another.user@example.com")
    pasta = create_ingredient(client, second_token, name="Pasta")

    response = client.put(
        f"/recipes/{recipe['id']}",
        headers=auth_headers(second_token),
        json=recipe_update_payload(ingredient_id=pasta["id"]),
    )

    assert response.status_code == 404
    assert response.json() == {"detail": "Recipe not found"}


def test_update_recipe_rejects_unknown_ingredient(client: TestClient) -> None:
    register_user(client)
    token = login_user(client)
    rice = create_ingredient(client, token, name="Rice")
    recipe = create_recipe(
        client,
        token,
        "Rice bowl",
        [{"ingredient_id": rice["id"], "quantity": "100"}],
    )

    response = client.put(
        f"/recipes/{recipe['id']}",
        headers=auth_headers(token),
        json=recipe_update_payload(ingredient_id=999999),
    )

    assert response.status_code == 404
    assert response.json() == {"detail": "Ingredient not found"}


def test_update_recipe_rejects_other_users_ingredient(client: TestClient) -> None:
    register_user(client)
    first_token = login_user(client)
    rice = create_ingredient(client, first_token, name="Rice")
    recipe = create_recipe(
        client,
        first_token,
        "Rice bowl",
        [{"ingredient_id": rice["id"], "quantity": "100"}],
    )

    register_user(client, email="another.user@example.com")
    second_token = login_user(client, email="another.user@example.com")
    pasta = create_ingredient(client, second_token, name="Pasta")

    response = client.put(
        f"/recipes/{recipe['id']}",
        headers=auth_headers(first_token),
        json=recipe_update_payload(ingredient_id=pasta["id"]),
    )

    assert response.status_code == 404
    assert response.json() == {"detail": "Ingredient not found"}


def test_update_recipe_rejects_duplicate_ingredient_ids(
    client: TestClient,
) -> None:
    register_user(client)
    token = login_user(client)
    rice = create_ingredient(client, token, name="Rice")
    recipe = create_recipe(
        client,
        token,
        "Rice bowl",
        [{"ingredient_id": rice["id"], "quantity": "100"}],
    )
    payload = recipe_update_payload(ingredient_id=rice["id"])
    payload["ingredients"] = [
        {"ingredient_id": rice["id"], "quantity": "100"},
        {"ingredient_id": rice["id"], "quantity": "150"},
    ]

    response = client.put(
        f"/recipes/{recipe['id']}",
        headers=auth_headers(token),
        json=payload,
    )

    assert response.status_code == 422
