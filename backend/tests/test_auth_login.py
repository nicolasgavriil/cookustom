import asyncio

from fastapi.testclient import TestClient
from sqlalchemy import select

from app.api.auth_cookies import REFRESH_TOKEN_COOKIE_NAME
from app.core.security import hash_refresh_token
from app.models.refresh_token import RefreshToken
from app.models.user import User
from tests.conftest import TestAsyncSessionLocal, register_user


async def get_user_refresh_tokens(email: str) -> list[RefreshToken]:
    async with TestAsyncSessionLocal() as session:
        refresh_tokens = await session.scalars(
            select(RefreshToken)
            .join(User)
            .where(User.email == email)
            .order_by(RefreshToken.created_at)
        )
        return list(refresh_tokens)


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
    raw_refresh_token = response.cookies.get(REFRESH_TOKEN_COOKIE_NAME)
    assert raw_refresh_token is not None

    set_cookie = response.headers["set-cookie"].lower()
    assert "httponly" in set_cookie
    assert "samesite=lax" in set_cookie
    assert "path=/auth" in set_cookie
    assert "; secure" not in set_cookie

    stored_tokens = asyncio.run(get_user_refresh_tokens("login.user@example.com"))
    assert len(stored_tokens) == 1
    assert stored_tokens[0].token_hash == hash_refresh_token(raw_refresh_token)
    assert stored_tokens[0].token_hash != raw_refresh_token


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
    assert response.cookies.get(REFRESH_TOKEN_COOKIE_NAME) is None


def test_login_user_rejects_wrong_password(client: TestClient) -> None:
    register_user(client)

    response = client.post(
        "/auth/login",
        json={"email": "login.user@example.com", "password": "wrongpass123"},
    )

    assert response.status_code == 401
    assert response.json() == {"detail": "Invalid email or password"}
