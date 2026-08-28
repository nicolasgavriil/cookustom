import asyncio
from datetime import UTC, datetime, timedelta

from fastapi.testclient import TestClient
from sqlalchemy import select

from app.api.auth_cookies import REFRESH_TOKEN_COOKIE_NAME
from app.core.security import hash_refresh_token
from app.models.refresh_token import RefreshToken
from tests.conftest import TestAsyncSessionLocal, register_user


async def get_refresh_token(token_hash: str) -> RefreshToken | None:
    async with TestAsyncSessionLocal() as session:
        return await session.scalar(
            select(RefreshToken).where(RefreshToken.token_hash == token_hash)
        )


async def expire_refresh_token(token_hash: str) -> None:
    async with TestAsyncSessionLocal() as session:
        refresh_token = await session.scalar(
            select(RefreshToken).where(RefreshToken.token_hash == token_hash)
        )
        assert refresh_token is not None
        refresh_token.expires_at = datetime.now(UTC) - timedelta(seconds=1)
        await session.commit()


def login(client: TestClient) -> str:
    response = client.post(
        "/auth/login",
        json={
            "email": "login.user@example.com",
            "password": "securepass123",
        },
    )
    assert response.status_code == 200
    refresh_token = response.cookies.get(REFRESH_TOKEN_COOKIE_NAME)
    assert refresh_token is not None
    return refresh_token


def test_refresh_reuses_refresh_token_and_returns_valid_access_token(
    client: TestClient,
) -> None:
    register_user(client)
    refresh_token = login(client)
    token_hash = hash_refresh_token(refresh_token)

    response = client.post("/auth/refresh")

    assert response.status_code == 200
    access_token = response.json()["access_token"]
    current_user_response = client.get(
        "/auth/me",
        headers={"Authorization": f"Bearer {access_token}"},
    )
    assert current_user_response.status_code == 200
    assert current_user_response.json()["email"] == "login.user@example.com"
    assert response.cookies.get(REFRESH_TOKEN_COOKIE_NAME) is None
    assert client.cookies.get(REFRESH_TOKEN_COOKIE_NAME) == refresh_token

    stored_token = asyncio.run(get_refresh_token(token_hash))
    assert stored_token is not None
    assert stored_token.token_hash == token_hash


def test_refresh_token_can_handle_repeated_requests(client: TestClient) -> None:
    register_user(client)
    refresh_token = login(client)

    first_response = client.post("/auth/refresh")
    second_response = client.post("/auth/refresh")

    assert first_response.status_code == 200
    assert second_response.status_code == 200
    assert client.cookies.get(REFRESH_TOKEN_COOKIE_NAME) == refresh_token


def test_refresh_rejects_missing_cookie(client: TestClient) -> None:
    response = client.post("/auth/refresh")

    assert response.status_code == 401
    assert response.json() == {"detail": "Invalid refresh token"}


def test_refresh_rejects_and_deletes_expired_token(client: TestClient) -> None:
    register_user(client)
    refresh_token = login(client)
    token_hash = hash_refresh_token(refresh_token)
    asyncio.run(expire_refresh_token(token_hash))

    response = client.post("/auth/refresh")

    assert response.status_code == 401
    assert REFRESH_TOKEN_COOKIE_NAME not in client.cookies
    assert asyncio.run(get_refresh_token(token_hash)) is None


def test_login_removes_expired_refresh_tokens(client: TestClient) -> None:
    register_user(client)
    expired_refresh_token = login(client)
    expired_token_hash = hash_refresh_token(expired_refresh_token)
    asyncio.run(expire_refresh_token(expired_token_hash))

    login(client)

    assert asyncio.run(get_refresh_token(expired_token_hash)) is None


def test_logout_deletes_refresh_token_and_clears_cookie(client: TestClient) -> None:
    register_user(client)
    refresh_token = login(client)
    token_hash = hash_refresh_token(refresh_token)

    response = client.post("/auth/logout")

    assert response.status_code == 204
    assert response.content == b""
    assert REFRESH_TOKEN_COOKIE_NAME not in client.cookies
    assert asyncio.run(get_refresh_token(token_hash)) is None

    client.cookies.set(
        REFRESH_TOKEN_COOKIE_NAME,
        refresh_token,
        path="/auth",
    )
    assert client.post("/auth/refresh").status_code == 401


def test_logout_only_deletes_the_presented_refresh_token(client: TestClient) -> None:
    register_user(client)
    first_refresh_token = login(client)
    second_refresh_token = login(client)

    response = client.post("/auth/logout")

    assert response.status_code == 204
    assert (
        asyncio.run(get_refresh_token(hash_refresh_token(second_refresh_token))) is None
    )
    assert (
        asyncio.run(get_refresh_token(hash_refresh_token(first_refresh_token)))
        is not None
    )

    client.cookies.set(
        REFRESH_TOKEN_COOKIE_NAME,
        first_refresh_token,
        path="/auth",
    )
    assert client.post("/auth/refresh").status_code == 200


def test_logout_without_refresh_token_is_idempotent(client: TestClient) -> None:
    response = client.post("/auth/logout")

    assert response.status_code == 204
