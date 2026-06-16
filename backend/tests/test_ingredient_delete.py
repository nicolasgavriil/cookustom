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


def test_delete_ingredient_deletes_owned_ingredient(client: TestClient) -> None:
    register_user(client)
    token = login_user(client)
    ingredient = create_ingredient(client, token, name="Rice")

    response = client.delete(
        f"/ingredients/{ingredient['id']}",
        headers=auth_headers(token),
    )
    list_response = client.get("/ingredients", headers=auth_headers(token))

    assert response.status_code == 204
    assert response.content == b""
    assert list_response.status_code == 200
    assert list_response.json() == []


def test_delete_ingredient_rejects_missing_token(client: TestClient) -> None:
    response = client.delete("/ingredients/1")

    assert response.status_code == 401
    assert response.json() == {"detail": "Invalid authentication credentials"}


def test_delete_ingredient_returns_not_found_for_unknown_ingredient(
    client: TestClient,
) -> None:
    register_user(client)
    token = login_user(client)

    response = client.delete(
        "/ingredients/999999",
        headers=auth_headers(token),
    )

    assert response.status_code == 404
    assert response.json() == {"detail": "Ingredient not found"}


def test_delete_ingredient_returns_not_found_for_other_users_ingredient(
    client: TestClient,
) -> None:
    register_user(client)
    first_token = login_user(client)
    ingredient = create_ingredient(client, first_token, name="Rice")

    register_user(client, email="another.user@example.com")
    second_token = login_user(client, email="another.user@example.com")

    response = client.delete(
        f"/ingredients/{ingredient['id']}",
        headers=auth_headers(second_token),
    )
    list_response = client.get("/ingredients", headers=auth_headers(first_token))

    assert response.status_code == 404
    assert response.json() == {"detail": "Ingredient not found"}
    assert list_response.status_code == 200
    assert [ingredient["name"] for ingredient in list_response.json()] == ["Rice"]
