import asyncio

from sqlalchemy import delete, select
from sqlalchemy.engine import make_url
from sqlalchemy.exc import ArgumentError

from app.core.config import settings
from app.db.database import AsyncSessionLocal, engine
from app.models.ingredient import Ingredient
from app.models.recipe import Recipe
from app.models.user import User

TEST_DATABASE_NAME_SUFFIX = "_test"
E2E_EMAILS = {
    "e2e-auth-refocus@example.com",
    "e2e-auth-refresh@example.com",
    "e2e-calorie-rounding@example.com",
    "e2e-user-a@example.com",
    "e2e-user-b@example.com",
    "e2e-workflow@example.com",
}


def validate_e2e_database_url() -> None:
    try:
        database_name = make_url(settings.database_url).database
    except ArgumentError as error:
        raise RuntimeError("E2E cleanup requires a valid database URL") from error

    if database_name is None or not database_name.endswith(TEST_DATABASE_NAME_SUFFIX):
        raise RuntimeError(
            f"E2E cleanup requires a database ending in {TEST_DATABASE_NAME_SUFFIX}"
        )


async def cleanup_e2e_data() -> None:
    validate_e2e_database_url()

    async with AsyncSessionLocal() as session:
        e2e_user_ids = select(User.id).where(User.email.in_(E2E_EMAILS))
        await session.execute(delete(Recipe).where(Recipe.user_id.in_(e2e_user_ids)))
        await session.execute(
            delete(Ingredient).where(Ingredient.user_id.in_(e2e_user_ids))
        )
        await session.execute(delete(User).where(User.email.in_(E2E_EMAILS)))
        await session.commit()

    await engine.dispose()


def main() -> None:
    asyncio.run(cleanup_e2e_data())


if __name__ == "__main__":
    main()
