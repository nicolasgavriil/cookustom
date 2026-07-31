from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
from sqlalchemy.engine import make_url
from sqlalchemy.exc import ArgumentError

TEST_DATABASE_NAME_SUFFIX = "_test"


def validate_test_database_url(test_database_url: str) -> str:
    if not test_database_url.strip():
        raise ValueError("TEST_DATABASE_URL cannot be empty")

    try:
        url = make_url(test_database_url)
    except ArgumentError as error:
        raise ValueError("TEST_DATABASE_URL must be a valid database URL") from error

    if url.database is None or not url.database.endswith(TEST_DATABASE_NAME_SUFFIX):
        raise ValueError(
            f"TEST_DATABASE_URL database name must end with {TEST_DATABASE_NAME_SUFFIX}"
        )

    return test_database_url


class DatabaseTestSettings(BaseSettings):
    test_database_url: str

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @field_validator("test_database_url")
    @classmethod
    def validate_database_url(cls, test_database_url: str) -> str:
        return validate_test_database_url(test_database_url)
