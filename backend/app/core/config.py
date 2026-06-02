from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Recipe App API"
    database_url: str = (
        "postgresql+asyncpg://recipe_app:recipe_app_password@localhost:5432/recipe_app"
    )

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
