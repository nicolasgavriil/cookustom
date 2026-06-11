from fastapi.testclient import TestClient


def register_user(
    client: TestClient,
    email: str = "login.user@example.com",
    password: str = "securepass123",
) -> None:
    response = client.post(
        "/auth/register",
        json={"email": email, "password": password},
    )
    assert response.status_code == 201


def test_login_user_returns_access_token(client: TestClient) -> None:
    register_user(client)

    response = client.post(
        "/auth/login",
        json={"email": "login.user@example.com", "password": "securepass123"},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["access_token"]
    assert data["token_type"] == "bearer"


def test_login_user_accepts_case_insensitive_email(client: TestClient) -> None:
    register_user(client)

    response = client.post(
        "/auth/login",
        json={"email": "Login.User@Example.com", "password": "securepass123"},
    )

    assert response.status_code == 200
    assert response.json()["token_type"] == "bearer"


def test_login_user_rejects_unknown_email(client: TestClient) -> None:
    response = client.post(
        "/auth/login",
        json={"email": "unknown@example.com", "password": "securepass123"},
    )

    assert response.status_code == 401
    assert response.json() == {"detail": "Invalid email or password"}


def test_login_user_rejects_wrong_password(client: TestClient) -> None:
    register_user(client)

    response = client.post(
        "/auth/login",
        json={"email": "login.user@example.com", "password": "wrongpass123"},
    )

    assert response.status_code == 401
    assert response.json() == {"detail": "Invalid email or password"}
