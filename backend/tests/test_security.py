import jwt
import pytest

from app.core.config import settings
from app.core.security import JWT_ALGORITHM, decode_access_token


def test_decode_access_token_rejects_token_without_expiration() -> None:
    token = jwt.encode(
        {"sub": "1"},
        settings.jwt_secret_key.get_secret_value(),
        algorithm=JWT_ALGORITHM,
    )

    with pytest.raises(ValueError, match="Invalid access token"):
        decode_access_token(token)
