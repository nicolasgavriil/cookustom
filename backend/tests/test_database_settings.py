import pytest
from pydantic import ValidationError
from pydantic_settings import SettingsConfigDict

from tests.database_settings import DatabaseTestSettings, validate_test_database_url


class DatabaseTestSettingsForTest(DatabaseTestSettings):
    model_config = SettingsConfigDict(env_file=None, extra="ignore")


def test_validate_test_database_url_allows_test_database_name() -> None:
    test_database_url = (
        "postgresql+asyncpg://recipe_app:recipe_app_password"
        "@localhost:5432/recipe_app_test"
    )

    assert validate_test_database_url(test_database_url) == test_database_url


def test_test_database_settings_require_test_database_url(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.delenv("TEST_DATABASE_URL", raising=False)

    with pytest.raises(ValidationError):
        # Deliberately omit the required setting to verify runtime validation.
        DatabaseTestSettingsForTest()  # pyright: ignore[reportCallIssue]


def test_test_database_settings_return_test_database_url() -> None:
    test_database_url = (
        "postgresql+asyncpg://recipe_app:recipe_app_password"
        "@localhost:5432/recipe_app_test"
    )

    settings = DatabaseTestSettingsForTest(test_database_url=test_database_url)

    assert settings.test_database_url == test_database_url


def test_validate_test_database_url_allows_query_params() -> None:
    test_database_url = (
        "postgresql+asyncpg://recipe_app:recipe_app_password"
        "@localhost:5432/recipe_app_test?ssl=require"
    )

    assert validate_test_database_url(test_database_url) == test_database_url


@pytest.mark.parametrize(
    "test_database_url",
    [
        "",
        "   ",
        "postgresql+asyncpg://recipe_app:recipe_app_password@localhost:5432/recipe_app",
        "postgresql+asyncpg://recipe_app:recipe_app_password@localhost:5432/",
        "not-a-database-url",
    ],
)
def test_validate_test_database_url_rejects_unsafe_database_name(
    test_database_url: str,
) -> None:
    with pytest.raises(ValueError):
        validate_test_database_url(test_database_url)
