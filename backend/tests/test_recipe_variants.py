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
            "description": "Original description",
            "base_servings": 2,
            "instructions": "Original instructions.",
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


def variant_payload(ingredient_id: int, title: str = "Chicken bowl") -> dict:
    return {
        "title": title,
        "description": "Higher protein",
        "base_servings": 4,
        "instructions": "Cook chicken.",
        "ingredients": [
            {
                "ingredient_id": ingredient_id,
                "quantity": "200",
            }
        ],
    }


def assert_decimal_equal(value: str, expected: str) -> None:
    assert Decimal(value) == Decimal(expected)


def test_create_variant_creates_recipe_from_full_request(
    client: TestClient,
) -> None:
    register_user(client)
    token = login_user(client)
    rice = create_ingredient(client, token, name="Rice", calories_per_unit="1.3")
    chicken = create_ingredient(
        client,
        token,
        name="Chicken",
        calories_per_unit="2.5",
    )
    source_recipe = create_recipe(client, token, "Rice bowl", rice["id"])

    response = client.post(
        f"/recipes/{source_recipe['id']}/variants",
        headers=auth_headers(token),
        json=variant_payload(chicken["id"]),
    )

    assert response.status_code == 201
    data = response.json()
    assert data["id"] != source_recipe["id"]
    assert data["parent_recipe_id"] == source_recipe["id"]
    assert data["title"] == "Chicken bowl"
    assert data["description"] == "Higher protein"
    assert data["base_servings"] == 4
    assert data["instructions"] == "Cook chicken."
    assert_decimal_equal(data["total_calories"], "500")
    assert_decimal_equal(data["calories_per_serving"], "125")
    assert data["ingredients"][0]["ingredient_id"] == chicken["id"]
    assert_decimal_equal(data["ingredients"][0]["quantity"], "200")

    source_response = client.get(
        f"/recipes/{source_recipe['id']}",
        headers=auth_headers(token),
    )
    assert source_response.status_code == 200
    source_data = source_response.json()
    assert source_data["parent_recipe_id"] is None
    assert source_data["title"] == "Rice bowl"
    assert source_data["ingredients"][0]["ingredient_id"] == rice["id"]
    assert_decimal_equal(source_data["ingredients"][0]["quantity"], "100")


def test_create_variant_from_variant_keeps_root_parent_recipe(
    client: TestClient,
) -> None:
    register_user(client)
    token = login_user(client)
    rice = create_ingredient(client, token, name="Rice")
    original_recipe = create_recipe(client, token, "Original", rice["id"])
    first_variant_response = client.post(
        f"/recipes/{original_recipe['id']}/variants",
        headers=auth_headers(token),
        json=variant_payload(rice["id"], title="First variant"),
    )
    assert first_variant_response.status_code == 201
    first_variant = first_variant_response.json()

    second_variant_response = client.post(
        f"/recipes/{first_variant['id']}/variants",
        headers=auth_headers(token),
        json=variant_payload(rice["id"], title="Second variant"),
    )

    assert second_variant_response.status_code == 201
    second_variant = second_variant_response.json()
    assert first_variant["parent_recipe_id"] == original_recipe["id"]
    assert second_variant["parent_recipe_id"] == original_recipe["id"]
    assert second_variant["title"] == "Second variant"


def test_create_variant_requires_full_recipe_payload(client: TestClient) -> None:
    register_user(client)
    token = login_user(client)
    rice = create_ingredient(client, token, name="Rice")
    source_recipe = create_recipe(client, token, "Rice bowl", rice["id"])

    response = client.post(
        f"/recipes/{source_recipe['id']}/variants",
        headers=auth_headers(token),
        json={},
    )

    assert response.status_code == 422


def test_create_variant_rejects_missing_token(client: TestClient) -> None:
    response = client.post("/recipes/1/variants", json=variant_payload(1))

    assert response.status_code == 401
    assert response.json() == {"detail": "Invalid authentication credentials"}


def test_create_variant_returns_not_found_for_unknown_recipe(
    client: TestClient,
) -> None:
    register_user(client)
    token = login_user(client)
    rice = create_ingredient(client, token, name="Rice")

    response = client.post(
        "/recipes/999999/variants",
        headers=auth_headers(token),
        json=variant_payload(rice["id"]),
    )

    assert response.status_code == 404
    assert response.json() == {"detail": "Recipe not found"}


def test_create_variant_returns_not_found_for_other_users_recipe(
    client: TestClient,
) -> None:
    register_user(client)
    first_token = login_user(client)
    rice = create_ingredient(client, first_token, name="Rice")
    source_recipe = create_recipe(client, first_token, "Rice bowl", rice["id"])

    register_user(client, email="another.user@example.com")
    second_token = login_user(client, email="another.user@example.com")
    pasta = create_ingredient(client, second_token, name="Pasta")

    response = client.post(
        f"/recipes/{source_recipe['id']}/variants",
        headers=auth_headers(second_token),
        json=variant_payload(pasta["id"]),
    )

    assert response.status_code == 404
    assert response.json() == {"detail": "Recipe not found"}


def test_create_variant_rejects_unknown_ingredient(client: TestClient) -> None:
    register_user(client)
    token = login_user(client)
    rice = create_ingredient(client, token, name="Rice")
    source_recipe = create_recipe(client, token, "Rice bowl", rice["id"])

    response = client.post(
        f"/recipes/{source_recipe['id']}/variants",
        headers=auth_headers(token),
        json=variant_payload(999999),
    )

    assert response.status_code == 404
    assert response.json() == {"detail": "Ingredient not found"}


def test_create_variant_rejects_other_users_ingredient(
    client: TestClient,
) -> None:
    register_user(client)
    first_token = login_user(client)
    rice = create_ingredient(client, first_token, name="Rice")
    source_recipe = create_recipe(client, first_token, "Rice bowl", rice["id"])

    register_user(client, email="another.user@example.com")
    second_token = login_user(client, email="another.user@example.com")
    pasta = create_ingredient(client, second_token, name="Pasta")

    response = client.post(
        f"/recipes/{source_recipe['id']}/variants",
        headers=auth_headers(first_token),
        json=variant_payload(pasta["id"]),
    )

    assert response.status_code == 404
    assert response.json() == {"detail": "Ingredient not found"}


def test_create_variant_rejects_duplicate_ingredient_ids(
    client: TestClient,
) -> None:
    register_user(client)
    token = login_user(client)
    rice = create_ingredient(client, token, name="Rice")
    source_recipe = create_recipe(client, token, "Rice bowl", rice["id"])
    payload = variant_payload(rice["id"])
    payload["ingredients"] = [
        {"ingredient_id": rice["id"], "quantity": "100"},
        {"ingredient_id": rice["id"], "quantity": "150"},
    ]

    response = client.post(
        f"/recipes/{source_recipe['id']}/variants",
        headers=auth_headers(token),
        json=payload,
    )

    assert response.status_code == 422
