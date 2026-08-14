from fastapi.testclient import TestClient

from app.core.security import create_access_token
from tests.conftest import register_user


def login_user(client: TestClient) -> str:
    response = client.post(
        "/auth/login",
        json={"email": "login.user@example.com", "password": "securepass123"},
    )
    assert response.status_code == 200
    return response.json()["access_token"]


def test_read_current_user_returns_authenticated_user(client: TestClient) -> None:
    register_user(client)
    token = login_user(client)

    response = client.get(
        "/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "login.user@example.com"
    assert data["is_demo"] is False
    assert "password" not in data
    assert "password_hash" not in data


def test_read_current_user_rejects_missing_token(client: TestClient) -> None:
    response = client.get("/auth/me")

    assert response.status_code == 401
    assert response.json() == {"detail": "Invalid authentication credentials"}
    assert response.headers["www-authenticate"] == "Bearer"


def test_read_current_user_rejects_invalid_token(client: TestClient) -> None:
    response = client.get(
        "/auth/me",
        headers={"Authorization": "Bearer invalid-token"},
    )

    assert response.status_code == 401
    assert response.json() == {"detail": "Invalid authentication credentials"}


def test_read_current_user_rejects_unknown_user(client: TestClient) -> None:
    token = create_access_token(subject="999999")

    response = client.get(
        "/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 401
    assert response.json() == {"detail": "Invalid authentication credentials"}
