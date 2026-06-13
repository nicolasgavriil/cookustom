from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Recipe App API"
    database_url: str = (
        "postgresql+asyncpg://recipe_app:recipe_app_password@localhost:5432/recipe_app"
    )
    jwt_secret_key: str = "change-me-in-local-env-with-at-least-32-bytes"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    frontend_origins: str = "http://localhost:5173,http://127.0.0.1:5173"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.frontend_origins.split(",")]


settings = Settings()
