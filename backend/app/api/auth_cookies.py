from datetime import UTC, datetime

from fastapi import Response

from app.core.config import settings
from app.services.auth_tokens import IssuedRefreshToken

REFRESH_TOKEN_COOKIE_NAME = "cookustom_refresh_token"
REFRESH_TOKEN_COOKIE_PATH = "/auth"


def set_refresh_token_cookie(
    response: Response,
    refresh_token: IssuedRefreshToken,
) -> None:
    max_age = max(
        0,
        int((refresh_token.expires_at - datetime.now(UTC)).total_seconds()),
    )
    response.set_cookie(
        key=REFRESH_TOKEN_COOKIE_NAME,
        value=refresh_token.value,
        max_age=max_age,
        expires=refresh_token.expires_at,
        path=REFRESH_TOKEN_COOKIE_PATH,
        secure=settings.environment == "production",
        httponly=True,
        samesite="lax",
    )


def clear_refresh_token_cookie(response: Response) -> None:
    response.delete_cookie(
        key=REFRESH_TOKEN_COOKIE_NAME,
        path=REFRESH_TOKEN_COOKIE_PATH,
        secure=settings.environment == "production",
        httponly=True,
        samesite="lax",
    )
