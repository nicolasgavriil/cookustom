from fastapi.testclient import TestClient

from app.core.config import settings
from app.main import app

client = TestClient(app)


def test_frontend_origins_can_preflight_api_requests() -> None:
    for origin in settings.cors_origins:
        response = client.options(
            "/health",
            headers={
                "Origin": origin,
                "Access-Control-Request-Method": "GET",
            },
        )

        assert response.status_code == 200
        assert response.headers["access-control-allow-origin"] == origin


def test_unknown_origin_cannot_preflight_api_requests() -> None:
    response = client.options(
        "/health",
        headers={
            "Origin": "http://localhost:3000",
            "Access-Control-Request-Method": "GET",
        },
    )

    assert response.status_code == 400
    assert "access-control-allow-origin" not in response.headers
