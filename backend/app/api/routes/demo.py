from datetime import UTC, datetime, timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.auth_cookies import clear_refresh_token_cookie
from app.core.config import settings
from app.core.security import create_access_token
from app.db.database import get_db
from app.schemas.user import TokenResponse
from app.services.demo_sessions import provision_demo_user

router = APIRouter(prefix="/demo", tags=["demo"])


@router.post("", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def create_demo_session(
    response: Response,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> TokenResponse:
    expires_at = datetime.now(UTC) + timedelta(hours=settings.demo_session_expire_hours)
    user = await provision_demo_user(db, expires_at)
    await db.commit()
    clear_refresh_token_cookie(response)

    return TokenResponse(
        access_token=create_access_token(
            subject=str(user.id),
            expires_at=expires_at,
        ),
    )
