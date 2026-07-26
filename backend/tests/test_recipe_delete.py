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
                    "quantity": "100",
                }
            ],
        },
    )
    assert response.status_code == 201
    return response.json()


def variant_payload(ingredient_id: int, title: str = "Rice bowl variant") -> dict:
    return {
        "title": title,
        "description": "Variant meal",
        "base_servings": 4,
        "instructions": "Cook and serve as a variant.",
        "ingredients": [
            {
                "ingredient_id": ingredient_id,
                "quantity": "150",
            }
        ],
    }


def create_variant(
    client: TestClient,
    token: str,
    source_recipe_id: int,
    ingredient_id: int,
) -> dict:
    response = client.post(
        f"/recipes/{source_recipe_id}/variants",
        headers=auth_headers(token),
        json=variant_payload(ingredient_id),
    )
    assert response.status_code == 201
    return response.json()


def test_delete_recipe_deletes_current_users_recipe(client: TestClient) -> None:
    register_user(client)
    token = login_user(client)
    rice = create_ingredient(client, token, name="Rice")
    recipe = create_recipe(client, token, "Rice bowl", rice["id"])

    response = client.delete(f"/recipes/{recipe['id']}", headers=auth_headers(token))

    assert response.status_code == 204
    assert response.content == b""

    detail_response = client.get(
        f"/recipes/{recipe['id']}", headers=auth_headers(token)
    )
    assert detail_response.status_code == 404
    assert detail_response.json() == {"detail": "Recipe not found"}

    list_response = client.get("/recipes", headers=auth_headers(token))
    assert list_response.status_code == 200
    assert list_response.json() == []


def test_delete_recipe_rejects_missing_token(client: TestClient) -> None:
    response = client.delete("/recipes/1")

    assert response.status_code == 401
    assert response.json() == {"detail": "Invalid authentication credentials"}


def test_delete_recipe_returns_not_found_for_unknown_recipe(
    client: TestClient,
) -> None:
    register_user(client)
    token = login_user(client)

    response = client.delete("/recipes/999999", headers=auth_headers(token))

    assert response.status_code == 404
    assert response.json() == {"detail": "Recipe not found"}


def test_delete_recipe_returns_not_found_for_other_users_recipe(
    client: TestClient,
) -> None:
    register_user(client)
    first_token = login_user(client)
    rice = create_ingredient(client, first_token, name="Rice")
    recipe = create_recipe(client, first_token, "Rice bowl", rice["id"])

    register_user(client, email="another.user@example.com")
    second_token = login_user(client, email="another.user@example.com")

    response = client.delete(
        f"/recipes/{recipe['id']}",
        headers=auth_headers(second_token),
    )

    assert response.status_code == 404
    assert response.json() == {"detail": "Recipe not found"}

    detail_response = client.get(
        f"/recipes/{recipe['id']}",
        headers=auth_headers(first_token),
    )
    assert detail_response.status_code == 200


def test_delete_recipe_rejects_original_with_variants(client: TestClient) -> None:
    register_user(client)
    token = login_user(client)
    rice = create_ingredient(client, token, name="Rice")
    recipe = create_recipe(client, token, "Rice bowl", rice["id"])
    variant = create_variant(client, token, recipe["id"], rice["id"])

    response = client.delete(f"/recipes/{recipe['id']}", headers=auth_headers(token))

    assert response.status_code == 409
    assert response.json() == {"detail": "Cannot delete recipe with variants"}

    detail_response = client.get(
        f"/recipes/{recipe['id']}",
        headers=auth_headers(token),
    )
    assert detail_response.status_code == 200

    variant_response = client.get(
        f"/recipes/{variant['id']}",
        headers=auth_headers(token),
    )
    assert variant_response.status_code == 200
    assert variant_response.json()["parent_recipe_id"] == recipe["id"]


def test_delete_recipe_deletes_variant_recipe(client: TestClient) -> None:
    register_user(client)
    token = login_user(client)
    rice = create_ingredient(client, token, name="Rice")
    recipe = create_recipe(client, token, "Rice bowl", rice["id"])
    variant = create_variant(client, token, recipe["id"], rice["id"])

    response = client.delete(f"/recipes/{variant['id']}", headers=auth_headers(token))

    assert response.status_code == 204
    assert response.content == b""

    variant_response = client.get(
        f"/recipes/{variant['id']}",
        headers=auth_headers(token),
    )
    assert variant_response.status_code == 404

    original_response = client.get(
        f"/recipes/{recipe['id']}",
        headers=auth_headers(token),
    )
    assert original_response.status_code == 200
