from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Recipe App API"
    database_url: str = (
        "postgresql+asyncpg://recipe_app:recipe_app_password@localhost:5432/recipe_app"
    )
    jwt_secret_key: str = "change-me-in-local-env-with-at-least-32-bytes"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
