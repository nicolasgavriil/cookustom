from dataclasses import dataclass
from datetime import UTC, datetime, timedelta

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import generate_refresh_token, hash_refresh_token
from app.models.refresh_token import RefreshToken
from app.models.user import User


class InvalidRefreshTokenError(Exception):
    pass


@dataclass(frozen=True)
class IssuedRefreshToken:
    value: str
    expires_at: datetime


async def create_refresh_token(
    db: AsyncSession,
    user: User,
) -> IssuedRefreshToken:
    now = datetime.now(UTC)
    expires_at = now + timedelta(days=settings.refresh_token_expire_days)

    await db.execute(delete(RefreshToken).where(RefreshToken.expires_at <= now))

    raw_token = generate_refresh_token()
    db.add(
        RefreshToken(
            user_id=user.id,
            token_hash=hash_refresh_token(raw_token),
            expires_at=expires_at,
        )
    )

    return IssuedRefreshToken(value=raw_token, expires_at=expires_at)


async def validate_refresh_token(
    db: AsyncSession,
    raw_token: str,
) -> User:
    now = datetime.now(UTC)
    refresh_token = await db.scalar(
        select(RefreshToken).where(
            RefreshToken.token_hash == hash_refresh_token(raw_token)
        )
    )
    if refresh_token is None:
        raise InvalidRefreshTokenError

    user = await db.get(User, refresh_token.user_id)
    if refresh_token.expires_at <= now or user is None:
        await db.delete(refresh_token)
        raise InvalidRefreshTokenError

    return user


async def delete_refresh_token(db: AsyncSession, raw_token: str) -> None:
    refresh_token = await db.scalar(
        select(RefreshToken).where(
            RefreshToken.token_hash == hash_refresh_token(raw_token)
        )
    )
    if refresh_token is not None:
        await db.delete(refresh_token)
