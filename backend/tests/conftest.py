import asyncio
import os
from collections.abc import AsyncGenerator, Generator

import pytest
from fastapi.testclient import TestClient
from pydantic import ValidationError
from sqlalchemy import delete, or_, select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import NullPool

from tests.database_settings import DatabaseTestSettings


def load_test_database_url() -> str:
    try:
        # BaseSettings loads required fields from environment sources at runtime.
        settings = DatabaseTestSettings()  # pyright: ignore[reportCallIssue]
        return settings.test_database_url
    except ValidationError as error:
        raise RuntimeError(
            "TEST_DATABASE_URL must identify a database whose name ends with '_test'"
        ) from error


test_database_url = load_test_database_url()
os.environ["DATABASE_URL"] = test_database_url
os.environ["ENVIRONMENT"] = "test"
os.environ["JWT_SECRET_KEY"] = "test-jwt-secret-key-with-at-least-32-characters"

# Test environment must be configured before importing application modules.
from app.core.config import build_sqlalchemy_database_url  # noqa: E402
from app.db.database import get_db  # noqa: E402
from app.main import app  # noqa: E402
from app.models.recipe import Recipe  # noqa: E402
from app.models.user import User  # noqa: E402

TEST_EMAILS = {
    "another.user@example.com",
    "login.user@example.com",
    "new.user@example.com",
    "duplicate@example.com",
    "mixed.case@example.com",
    "unknown@example.com",
}


test_engine = create_async_engine(
    build_sqlalchemy_database_url(test_database_url),
    poolclass=NullPool,
)
TestAsyncSessionLocal = async_sessionmaker(
    test_engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def override_get_db() -> AsyncGenerator[AsyncSession]:
    async with TestAsyncSessionLocal() as session:
        yield session


async def delete_test_users() -> None:
    async with TestAsyncSessionLocal() as session:
        test_user_filter = or_(
            User.email.in_(TEST_EMAILS),
            User.demo_expires_at.is_not(None),
        )
        test_user_ids = select(User.id).where(test_user_filter)
        await session.execute(delete(Recipe).where(Recipe.user_id.in_(test_user_ids)))
        await session.execute(delete(User).where(test_user_filter))
        await session.commit()


@pytest.fixture
def client() -> Generator[TestClient]:
    app.dependency_overrides[get_db] = override_get_db
    asyncio.run(delete_test_users())

    try:
        with TestClient(app) as test_client:
            yield test_client
    finally:
        asyncio.run(delete_test_users())
        app.dependency_overrides.clear()


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


def login_user(
    client: TestClient,
    email: str = "login.user@example.com",
    password: str = "securepass123",
) -> str:
    response = client.post(
        "/auth/login",
        json={"email": email, "password": password},
    )
    assert response.status_code == 200
    return response.json()["access_token"]
