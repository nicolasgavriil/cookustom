from datetime import UTC, datetime, timedelta

from fastapi import Response
from pytest import MonkeyPatch

from app.api.auth_cookies import set_refresh_token_cookie
from app.core.config import settings
from app.services.auth_tokens import IssuedRefreshToken


def test_production_refresh_cookie_is_secure(monkeypatch: MonkeyPatch) -> None:
    monkeypatch.setattr(settings, "environment", "production")
    response = Response()

    set_refresh_token_cookie(
        response,
        IssuedRefreshToken(
            value="raw-refresh-token",
            expires_at=datetime.now(UTC) + timedelta(days=1),
        ),
    )

    set_cookie = response.headers["set-cookie"].lower()
    assert "secure" in set_cookie
    assert "httponly" in set_cookie
    assert "samesite=lax" in set_cookie
    assert "path=/auth" in set_cookie
