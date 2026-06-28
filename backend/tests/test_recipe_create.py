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


def recipe_payload(ingredient_id: int) -> dict:
    return {
        "title": "Rice bowl",
        "description": "Simple lunch",
        "base_servings": 2,
        "instructions": "Cook rice. Add egg.",
        "ingredients": [{"ingredient_id": ingredient_id, "quantity": "100"}],
    }


def test_create_recipe_creates_recipe_with_calorie_summary(
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

    response = client.post(
        "/recipes",
        headers=auth_headers(token),
        json={
            "title": "  Rice bowl  ",
            "description": "   ",
            "base_servings": 2,
            "instructions": "  Cook rice. Add egg.  ",
            "ingredients": [
                {"ingredient_id": rice["id"], "quantity": "100"},
                {"ingredient_id": egg["id"], "quantity": "2"},
            ],
        },
    )

    assert response.status_code == 201
    data = response.json()
    assert data["id"] > 0
    assert data["parent_recipe_id"] is None
    assert data["title"] == "Rice bowl"
    assert data["description"] is None
    assert data["base_servings"] == 2
    assert data["instructions"] == "Cook rice. Add egg."
    assert "created_at" in data
    assert data["total_calories"] == "270.0000"
    assert data["calories_per_serving"] == "135.0000"
    assert data["ingredients"] == [
        {
            "ingredient_id": rice["id"],
            "ingredient_name": "Rice",
            "unit": "g",
            "quantity": "100",
            "calories_per_unit": "1.3000",
            "calories": "130.0000",
        },
        {
            "ingredient_id": egg["id"],
            "ingredient_name": "Egg",
            "unit": "piece",
            "quantity": "2",
            "calories_per_unit": "70.0000",
            "calories": "140.0000",
        },
    ]


def test_create_recipe_rejects_missing_token(client: TestClient) -> None:
    response = client.post(
        "/recipes",
        json=recipe_payload(ingredient_id=1),
    )

    assert response.status_code == 401
    assert response.json() == {"detail": "Invalid authentication credentials"}


def test_create_recipe_rejects_empty_ingredient_list(client: TestClient) -> None:
    register_user(client)
    token = login_user(client)
    payload = recipe_payload(ingredient_id=1)
    payload["ingredients"] = []

    response = client.post("/recipes", headers=auth_headers(token), json=payload)

    assert response.status_code == 422


def test_create_recipe_rejects_duplicate_ingredient_ids(client: TestClient) -> None:
    register_user(client)
    token = login_user(client)
    rice = create_ingredient(client, token, name="Rice")

    response = client.post(
        "/recipes",
        headers=auth_headers(token),
        json={
            **recipe_payload(ingredient_id=rice["id"]),
            "ingredients": [
                {"ingredient_id": rice["id"], "quantity": "100"},
                {"ingredient_id": rice["id"], "quantity": "50"},
            ],
        },
    )

    assert response.status_code == 422


def test_create_recipe_rejects_unknown_ingredient(client: TestClient) -> None:
    register_user(client)
    token = login_user(client)

    response = client.post(
        "/recipes",
        headers=auth_headers(token),
        json=recipe_payload(ingredient_id=999999),
    )

    assert response.status_code == 404
    assert response.json() == {"detail": "Ingredient not found"}


def test_create_recipe_rejects_other_users_ingredient(client: TestClient) -> None:
    register_user(client)
    first_token = login_user(client)
    rice = create_ingredient(client, first_token, name="Rice")

    register_user(client, email="another.user@example.com")
    second_token = login_user(client, email="another.user@example.com")

    response = client.post(
        "/recipes",
        headers=auth_headers(second_token),
        json=recipe_payload(ingredient_id=rice["id"]),
    )

    assert response.status_code == 404
    assert response.json() == {"detail": "Ingredient not found"}


def test_create_recipe_rejects_invalid_base_servings(client: TestClient) -> None:
    register_user(client)
    token = login_user(client)
    rice = create_ingredient(client, token, name="Rice")
    payload = recipe_payload(ingredient_id=rice["id"])
    payload["base_servings"] = 0

    response = client.post("/recipes", headers=auth_headers(token), json=payload)

    assert response.status_code == 422


def test_create_recipe_rejects_invalid_quantity(client: TestClient) -> None:
    register_user(client)
    token = login_user(client)
    rice = create_ingredient(client, token, name="Rice")
    payload = recipe_payload(ingredient_id=rice["id"])
    payload["ingredients"] = [{"ingredient_id": rice["id"], "quantity": "0"}]

    response = client.post("/recipes", headers=auth_headers(token), json=payload)

    assert response.status_code == 422


def test_create_recipe_rejects_empty_title(client: TestClient) -> None:
    register_user(client)
    token = login_user(client)
    rice = create_ingredient(client, token, name="Rice")
    payload = recipe_payload(ingredient_id=rice["id"])
    payload["title"] = "   "

    response = client.post("/recipes", headers=auth_headers(token), json=payload)

    assert response.status_code == 422


def test_create_recipe_rejects_empty_instructions(client: TestClient) -> None:
    register_user(client)
    token = login_user(client)
    rice = create_ingredient(client, token, name="Rice")
    payload = recipe_payload(ingredient_id=rice["id"])
    payload["instructions"] = "   "

    response = client.post("/recipes", headers=auth_headers(token), json=payload)

    assert response.status_code == 422
