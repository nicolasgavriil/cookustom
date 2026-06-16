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


def test_update_ingredient_updates_owned_ingredient(client: TestClient) -> None:
    register_user(client)
    token = login_user(client)
    ingredient = create_ingredient(client, token, name="Rice")

    response = client.put(
        f"/ingredients/{ingredient['id']}",
        headers=auth_headers(token),
        json={"name": "Brown rice", "unit": "g", "calories_per_unit": "1.45"},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["id"] == ingredient["id"]
    assert data["user_id"] == ingredient["user_id"]
    assert data["name"] == "Brown rice"
    assert data["unit"] == "g"
    assert data["calories_per_unit"] == "1.4500"
    assert "created_at" in data


def test_update_ingredient_rejects_missing_token(client: TestClient) -> None:
    response = client.put(
        "/ingredients/1",
        json={"name": "Brown rice", "unit": "g", "calories_per_unit": "1.45"},
    )

    assert response.status_code == 401
    assert response.json() == {"detail": "Invalid authentication credentials"}


def test_update_ingredient_returns_not_found_for_unknown_ingredient(
    client: TestClient,
) -> None:
    register_user(client)
    token = login_user(client)

    response = client.put(
        "/ingredients/999999",
        headers=auth_headers(token),
        json={"name": "Brown rice", "unit": "g", "calories_per_unit": "1.45"},
    )

    assert response.status_code == 404
    assert response.json() == {"detail": "Ingredient not found"}


def test_update_ingredient_returns_not_found_for_other_users_ingredient(
    client: TestClient,
) -> None:
    register_user(client)
    first_token = login_user(client)
    ingredient = create_ingredient(client, first_token, name="Rice")

    register_user(client, email="another.user@example.com")
    second_token = login_user(client, email="another.user@example.com")

    response = client.put(
        f"/ingredients/{ingredient['id']}",
        headers=auth_headers(second_token),
        json={"name": "Brown rice", "unit": "g", "calories_per_unit": "1.45"},
    )

    assert response.status_code == 404
    assert response.json() == {"detail": "Ingredient not found"}


def test_update_ingredient_rejects_duplicate_name_for_same_user(
    client: TestClient,
) -> None:
    register_user(client)
    token = login_user(client)
    create_ingredient(client, token, name="Rice")
    milk = create_ingredient(client, token, name="Milk", unit="ml")

    response = client.put(
        f"/ingredients/{milk['id']}",
        headers=auth_headers(token),
        json={"name": "Rice", "unit": "ml", "calories_per_unit": "0.6"},
    )

    assert response.status_code == 409
    assert response.json() == {"detail": "Ingredient already exists"}


def test_update_ingredient_allows_same_name_for_different_users(
    client: TestClient,
) -> None:
    register_user(client)
    first_token = login_user(client)
    create_ingredient(client, first_token, name="Rice")

    register_user(client, email="another.user@example.com")
    second_token = login_user(client, email="another.user@example.com")
    ingredient = create_ingredient(client, second_token, name="Milk", unit="ml")

    response = client.put(
        f"/ingredients/{ingredient['id']}",
        headers=auth_headers(second_token),
        json={"name": "Rice", "unit": "ml", "calories_per_unit": "0.6"},
    )

    assert response.status_code == 200
    assert response.json()["name"] == "Rice"


def test_update_ingredient_rejects_invalid_unit(client: TestClient) -> None:
    register_user(client)
    token = login_user(client)
    ingredient = create_ingredient(client, token, name="Rice")

    response = client.put(
        f"/ingredients/{ingredient['id']}",
        headers=auth_headers(token),
        json={"name": "Rice", "unit": "oz", "calories_per_unit": "1.3"},
    )

    assert response.status_code == 422


def test_update_ingredient_trims_name(client: TestClient) -> None:
    register_user(client)
    token = login_user(client)
    ingredient = create_ingredient(client, token, name="Rice")

    response = client.put(
        f"/ingredients/{ingredient['id']}",
        headers=auth_headers(token),
        json={"name": "  Brown rice  ", "unit": "g", "calories_per_unit": "1.45"},
    )

    assert response.status_code == 200
    assert response.json()["name"] == "Brown rice"
