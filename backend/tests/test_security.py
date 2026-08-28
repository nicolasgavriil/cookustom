import jwt
import pytest

from app.core.config import settings
from app.core.security import (
    JWT_ALGORITHM,
    decode_access_token,
    generate_refresh_token,
    hash_refresh_token,
)


def test_decode_access_token_rejects_token_without_expiration() -> None:
    token = jwt.encode(
        {"sub": "1"},
        settings.jwt_secret_key.get_secret_value(),
        algorithm=JWT_ALGORITHM,
    )

    with pytest.raises(ValueError, match="Invalid access token"):
        decode_access_token(token)


def test_refresh_tokens_are_random_and_hash_deterministically() -> None:
    first_token = generate_refresh_token()
    second_token = generate_refresh_token()

    assert first_token != second_token
    assert hash_refresh_token(first_token) == hash_refresh_token(first_token)
    assert hash_refresh_token(first_token) != hash_refresh_token(second_token)
    assert first_token != hash_refresh_token(first_token)
    assert len(hash_refresh_token(first_token)) == 64
