from typing import Any

import pytest
from pydantic import ValidationError
from pydantic_settings import SettingsConfigDict

from app.core.config import (
    EXAMPLE_JWT_SECRET_KEY,
    MAX_ACCESS_TOKEN_EXPIRE_MINUTES,
    Settings,
    build_sqlalchemy_database_url,
)

DATABASE_URL = "postgresql+asyncpg://recipe_app:recipe_app_password@localhost:5432/app"
JWT_SECRET_KEY = "use-a-real-generated-secret-with-at-least-32-characters"


class SettingsForTest(Settings):
    model_config = SettingsConfigDict(env_file=None, extra="ignore")


def build_settings(**overrides: Any) -> SettingsForTest:
    values = {
        "environment": "development",
        "database_url": DATABASE_URL,
        "jwt_secret_key": JWT_SECRET_KEY,
        **overrides,
    }

    return SettingsForTest(**values)


def test_settings_allow_local_config() -> None:
    settings = build_settings()

    assert settings.environment == "development"
    assert settings.jwt_secret_key.get_secret_value() == JWT_SECRET_KEY
    assert settings.sqlalchemy_database_url == DATABASE_URL


@pytest.mark.parametrize(
    ("database_url", "expected_database_url"),
    [
        (
            "postgresql://recipe_app:secret@localhost:5432/recipe_app",
            "postgresql+asyncpg://recipe_app:secret@localhost:5432/recipe_app",
        ),
        (
            "postgres://recipe_app:secret@localhost:5432/recipe_app",
            "postgresql+asyncpg://recipe_app:secret@localhost:5432/recipe_app",
        ),
        (
            "postgresql+asyncpg://recipe_app:secret@localhost:5432/recipe_app",
            "postgresql+asyncpg://recipe_app:secret@localhost:5432/recipe_app",
        ),
    ],
)
def test_build_sqlalchemy_database_url_uses_async_postgres_driver(
    database_url: str,
    expected_database_url: str,
) -> None:
    assert build_sqlalchemy_database_url(database_url) == expected_database_url


def test_settings_reject_unsupported_database_url_scheme() -> None:
    with pytest.raises(ValidationError):
        build_settings(database_url="sqlite:///recipe_app.db")


@pytest.mark.parametrize(
    "missing_field",
    [
        "environment",
        "database_url",
        "jwt_secret_key",
    ],
)
def test_settings_require_deployment_config(
    missing_field: str,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.delenv("DATABASE_URL", raising=False)
    monkeypatch.delenv("ENVIRONMENT", raising=False)
    monkeypatch.delenv("JWT_SECRET_KEY", raising=False)

    values = {
        "environment": "development",
        "database_url": DATABASE_URL,
        "jwt_secret_key": JWT_SECRET_KEY,
    }
    del values[missing_field]

    with pytest.raises(ValidationError):
        SettingsForTest(**values)


def test_cors_origins_trims_blank_entries() -> None:
    settings = build_settings(
        frontend_origins=" http://localhost:5173, ,https://recipes.example.com ",
    )

    assert settings.cors_origins == [
        "http://localhost:5173",
        "https://recipes.example.com",
    ]


def test_settings_reject_example_jwt_secret() -> None:
    with pytest.raises(ValidationError):
        build_settings(jwt_secret_key=EXAMPLE_JWT_SECRET_KEY)


def test_settings_reject_short_jwt_secret() -> None:
    with pytest.raises(ValidationError):
        build_settings(jwt_secret_key="too-short")


def test_settings_allow_strong_production_jwt_secret() -> None:
    settings = build_settings(
        environment="production",
        frontend_origins="https://recipes.example.com",
    )

    assert settings.environment == "production"


@pytest.mark.parametrize(
    "frontend_origins",
    [
        "",
        "   ",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://[::1]:5173",
        "https://recipes.example.com,http://localhost:5173",
        "*",
    ],
)
def test_settings_reject_unsafe_production_cors_origins(
    frontend_origins: str,
) -> None:
    with pytest.raises(ValidationError):
        build_settings(
            environment="production",
            frontend_origins=frontend_origins,
        )


@pytest.mark.parametrize(
    "frontend_origins",
    [
        "https://recipes.example.com",
        "http://recipes.example.com:8080",
        "https://recipes.example.com,https://app.example.com",
        "https://recipes.example.com/path",
    ],
)
def test_settings_allow_valid_production_cors_origins(
    frontend_origins: str,
) -> None:
    settings = build_settings(
        environment="production",
        frontend_origins=frontend_origins,
    )

    assert settings.cors_origins == [
        origin.strip() for origin in frontend_origins.split(",")
    ]


@pytest.mark.parametrize(
    "access_token_expire_minutes",
    [
        0,
        -1,
        MAX_ACCESS_TOKEN_EXPIRE_MINUTES + 1,
    ],
)
def test_settings_reject_invalid_access_token_lifetime(
    access_token_expire_minutes: int,
) -> None:
    with pytest.raises(ValidationError):
        build_settings(access_token_expire_minutes=access_token_expire_minutes)


def test_settings_reject_unknown_environment() -> None:
    with pytest.raises(ValidationError):
        build_settings(environment="prod")
