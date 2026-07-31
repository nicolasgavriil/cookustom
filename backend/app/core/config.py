from typing import Literal, Self

from pydantic import Field, SecretStr, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

EXAMPLE_JWT_SECRET_KEY = "replace-this-with-a-local-secret-at-least-32-bytes"
MIN_JWT_SECRET_KEY_LENGTH = 32
MAX_ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24
LOCALHOST_CORS_VALUES = (
    "localhost",
    "127.0.0.1",
    "[::1]",
)

Environment = Literal["development", "test", "production"]


class Settings(BaseSettings):
    app_name: str = "Recipe App API"
    environment: Environment
    database_url: str
    jwt_secret_key: SecretStr
    access_token_expire_minutes: int = Field(
        default=30,
        gt=0,
        le=MAX_ACCESS_TOKEN_EXPIRE_MINUTES,
    )
    frontend_origins: str = "http://localhost:5173,http://127.0.0.1:5173"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @model_validator(mode="after")
    def validate_required_config(self) -> Self:
        if not self.database_url.strip():
            raise ValueError("DATABASE_URL cannot be empty")

        jwt_secret_key = self.jwt_secret_key.get_secret_value()

        if jwt_secret_key == EXAMPLE_JWT_SECRET_KEY:
            raise ValueError("JWT_SECRET_KEY must be changed")

        if len(jwt_secret_key) < MIN_JWT_SECRET_KEY_LENGTH:
            raise ValueError("JWT_SECRET_KEY must be at least 32 characters")

        if self.environment == "production":
            cors_origins = self.cors_origins

            if not cors_origins:
                raise ValueError("FRONTEND_ORIGINS must be set in production")

            for origin in cors_origins:
                if origin == "*":
                    raise ValueError("FRONTEND_ORIGINS cannot include * in production")

                if any(localhost in origin for localhost in LOCALHOST_CORS_VALUES):
                    raise ValueError(
                        "FRONTEND_ORIGINS cannot include localhost in production"
                    )

        return self

    @property
    def cors_origins(self) -> list[str]:
        return [
            origin.strip()
            for origin in self.frontend_origins.split(",")
            if origin.strip()
        ]


# BaseSettings loads required fields from environment sources at runtime.
settings = Settings()  # pyright: ignore[reportCallIssue]
