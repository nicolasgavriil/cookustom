from datetime import UTC, datetime, timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import create_access_token
from app.db.database import get_db
from app.schemas.user import TokenResponse
from app.services.demo_sessions import provision_demo_user

router = APIRouter(prefix="/demo", tags=["demo"])


@router.post("", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def create_demo_session(
    db: Annotated[AsyncSession, Depends(get_db)],
) -> TokenResponse:
    expires_at = datetime.now(UTC) + timedelta(
        minutes=settings.access_token_expire_minutes
    )
    user = await provision_demo_user(db, expires_at)
    await db.commit()

    return TokenResponse(
        access_token=create_access_token(
            subject=str(user.id),
            expires_at=expires_at,
        )
    )
