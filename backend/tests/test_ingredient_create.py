from fastapi.testclient import TestClient

from tests.conftest import login_user, register_user


def auth_headers(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


def test_create_ingredient_creates_owned_ingredient(client: TestClient) -> None:
    register_user(client)
    token = login_user(client)

    response = client.post(
        "/ingredients",
        headers=auth_headers(token),
        json={"name": "Rice", "unit": "g", "calories_per_unit": "1.3"},
    )

    assert response.status_code == 201
    data = response.json()
    assert data["id"] > 0
    assert data["user_id"] > 0
    assert data["name"] == "Rice"
    assert data["unit"] == "g"
    assert data["calories_per_unit"] == "1.3000"
    assert "created_at" in data


def test_create_ingredient_rejects_missing_token(client: TestClient) -> None:
    response = client.post(
        "/ingredients",
        json={"name": "Rice", "unit": "g", "calories_per_unit": "1.3"},
    )

    assert response.status_code == 401
    assert response.json() == {"detail": "Invalid authentication credentials"}


def test_create_ingredient_rejects_duplicate_name_for_same_user(
    client: TestClient,
) -> None:
    register_user(client)
    token = login_user(client)
    payload = {"name": "Rice", "unit": "g", "calories_per_unit": "1.3"}

    first_response = client.post(
        "/ingredients",
        headers=auth_headers(token),
        json=payload,
    )
    second_response = client.post(
        "/ingredients",
        headers=auth_headers(token),
        json=payload,
    )

    assert first_response.status_code == 201
    assert second_response.status_code == 409
    assert second_response.json() == {"detail": "Ingredient already exists"}


def test_create_ingredient_allows_same_name_for_different_users(
    client: TestClient,
) -> None:
    register_user(client)
    first_token = login_user(client)

    register_user(client, email="another.user@example.com")
    second_token = login_user(client, email="another.user@example.com")

    first_response = client.post(
        "/ingredients",
        headers=auth_headers(first_token),
        json={"name": "Rice", "unit": "g", "calories_per_unit": "1.3"},
    )
    second_response = client.post(
        "/ingredients",
        headers=auth_headers(second_token),
        json={"name": "Rice", "unit": "g", "calories_per_unit": "1.3"},
    )

    assert first_response.status_code == 201
    assert second_response.status_code == 201
    assert first_response.json()["user_id"] != second_response.json()["user_id"]


def test_create_ingredient_rejects_invalid_unit(client: TestClient) -> None:
    register_user(client)
    token = login_user(client)

    response = client.post(
        "/ingredients",
        headers=auth_headers(token),
        json={"name": "Rice", "unit": "oz", "calories_per_unit": "1.3"},
    )

    assert response.status_code == 422


def test_create_ingredient_trims_name(client: TestClient) -> None:
    register_user(client)
    token = login_user(client)

    response = client.post(
        "/ingredients",
        headers=auth_headers(token),
        json={"name": "  Rice  ", "unit": "g", "calories_per_unit": "1.3"},
    )

    assert response.status_code == 201
    assert response.json()["name"] == "Rice"
