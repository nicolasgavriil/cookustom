import asyncio
from collections.abc import AsyncGenerator, Generator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import delete
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import NullPool

from app.core.config import settings
from app.db.database import get_db
from app.main import app
from app.models.user import User

TEST_EMAILS = {
    "login.user@example.com",
    "new.user@example.com",
    "duplicate@example.com",
    "mixed.case@example.com",
    "unknown@example.com",
}

test_engine = create_async_engine(settings.database_url, poolclass=NullPool)
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
        await session.execute(delete(User).where(User.email.in_(TEST_EMAILS)))
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
