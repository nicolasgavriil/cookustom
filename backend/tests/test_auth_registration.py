import asyncio

from fastapi.testclient import TestClient
from sqlalchemy import select

from app.models.user import User
from tests.conftest import TestAsyncSessionLocal


async def get_user_by_email(email: str) -> User | None:
    async with TestAsyncSessionLocal() as session:
        user = await session.scalar(select(User).where(User.email == email))
    return user


def test_register_user_creates_user(client: TestClient) -> None:
    response = client.post(
        "/auth/register",
        json={"email": "new.user@example.com", "password": "securepass123"},
    )

    assert response.status_code == 201
    data = response.json()
    assert data["id"] > 0
    assert data["email"] == "new.user@example.com"
    assert data["is_demo"] is False
    assert "created_at" in data
    assert "password" not in data
    assert "password_hash" not in data

    user = asyncio.run(get_user_by_email("new.user@example.com"))
    assert user is not None
    assert user.password_hash != "securepass123"
    assert user.password_hash.startswith("$argon2")


def test_register_user_rejects_duplicate_email(client: TestClient) -> None:
    payload = {"email": "duplicate@example.com", "password": "securepass123"}

    first_response = client.post("/auth/register", json=payload)
    second_response = client.post("/auth/register", json=payload)

    assert first_response.status_code == 201
    assert second_response.status_code == 409
    assert second_response.json() == {"detail": "Email already registered"}


def test_register_user_normalizes_email_to_lowercase(client: TestClient) -> None:
    response = client.post(
        "/auth/register",
        json={"email": "Mixed.Case@Example.com", "password": "securepass123"},
    )

    assert response.status_code == 201
    assert response.json()["email"] == "mixed.case@example.com"


def test_register_user_rejects_short_password(client: TestClient) -> None:
    response = client.post(
        "/auth/register",
        json={"email": "new.user@example.com", "password": "short"},
    )

    assert response.status_code == 422
