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
) -> None:
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


def test_list_ingredients_returns_empty_list_for_new_user(
    client: TestClient,
) -> None:
    register_user(client)
    token = login_user(client)

    response = client.get("/ingredients", headers=auth_headers(token))

    assert response.status_code == 200
    assert response.json() == []


def test_list_ingredients_returns_current_users_ingredients(
    client: TestClient,
) -> None:
    register_user(client)
    token = login_user(client)
    create_ingredient(client, token, name="Rice")
    create_ingredient(client, token, name="Milk", unit="ml", calories_per_unit="0.6")

    response = client.get("/ingredients", headers=auth_headers(token))

    assert response.status_code == 200
    data = response.json()
    assert [ingredient["name"] for ingredient in data] == ["Milk", "Rice"]
    assert data[0]["unit"] == "ml"
    assert data[0]["calories_per_unit"] == "0.6000"
    assert data[1]["unit"] == "g"
    assert data[1]["calories_per_unit"] == "1.3000"


def test_list_ingredients_excludes_other_users_ingredients(
    client: TestClient,
) -> None:
    register_user(client)
    first_token = login_user(client)
    create_ingredient(client, first_token, name="Rice")

    register_user(client, email="another.user@example.com")
    second_token = login_user(client, email="another.user@example.com")
    create_ingredient(client, second_token, name="Milk", unit="ml")

    response = client.get("/ingredients", headers=auth_headers(first_token))

    assert response.status_code == 200
    data = response.json()
    assert [ingredient["name"] for ingredient in data] == ["Rice"]


def test_list_ingredients_rejects_missing_token(client: TestClient) -> None:
    response = client.get("/ingredients")

    assert response.status_code == 401
    assert response.json() == {"detail": "Invalid authentication credentials"}
