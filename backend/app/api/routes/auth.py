from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from fastapi.responses import JSONResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.auth_cookies import (
    REFRESH_TOKEN_COOKIE_NAME,
    clear_refresh_token_cookie,
    set_refresh_token_cookie,
)
from app.api.dependencies import get_current_user
from app.core.security import create_access_token, hash_password, verify_password
from app.db.database import get_db
from app.models.user import User
from app.schemas.user import (
    LoginRequest,
    TokenResponse,
    UserCreateRequest,
    UserResponse,
)
from app.services.auth_tokens import (
    InvalidRefreshTokenError,
    create_refresh_token,
    delete_refresh_token,
    validate_refresh_token,
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
async def register_user(
    user_create: UserCreateRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> User:
    email = user_create.email.lower()

    existing_user = await db.scalar(select(User).where(User.email == email))
    if existing_user is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )

    user = User(
        email=email,
        password_hash=hash_password(user_create.password),
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    return user


@router.post("/login", response_model=TokenResponse)
async def login_user(
    user_login: LoginRequest,
    response: Response,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> TokenResponse:
    email = user_login.email.lower()
    user = await db.scalar(select(User).where(User.email == email))

    if user is None or not verify_password(user_login.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    refresh_token = await create_refresh_token(db, user)
    await db.commit()
    set_refresh_token_cookie(response, refresh_token)

    return TokenResponse(access_token=create_access_token(subject=str(user.id)))


@router.post("/refresh", response_model=TokenResponse)
async def refresh_access_token(
    request: Request,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> TokenResponse | Response:
    raw_token = request.cookies.get(REFRESH_TOKEN_COOKIE_NAME)
    if raw_token is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )

    try:
        user = await validate_refresh_token(db, raw_token)
    except InvalidRefreshTokenError:
        await db.commit()
        error_response = JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"detail": "Invalid refresh token"},
        )
        clear_refresh_token_cookie(error_response)
        return error_response

    return TokenResponse(access_token=create_access_token(subject=str(user.id)))


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout_user(
    request: Request,
    response: Response,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> None:
    raw_token = request.cookies.get(REFRESH_TOKEN_COOKIE_NAME)
    if raw_token is not None:
        await delete_refresh_token(db, raw_token)
        await db.commit()

    clear_refresh_token_cookie(response)


@router.get("/me", response_model=UserResponse)
async def read_current_user(
    current_user: Annotated[User, Depends(get_current_user)],
) -> User:
    return current_user
