# Cookustom

Customize every recipe to your taste.

Cookustom is a full-stack recipe manager for maintaining a personal ingredient
library, building recipes from those ingredients, scaling servings, and saving
recipe variants.

The app is built as a monorepo with a FastAPI backend, PostgreSQL database, and
React frontend.

- **Live app:** [cookustom.com](https://cookustom.com)
- **API documentation:** [api.cookustom.com/docs](https://api.cookustom.com/docs)

## Motivation

This project started from a request by a family member who found that the recipe
applications they had tried did not fit how they want to manage their own
recipes and ingredient data.

The application focuses on their core workflow: maintaining a reusable ingredient
library, calculating calorie estimates, scaling quantities for different serving
counts, and creating recipe variants without overwriting the original.

## What It Does

- Register and log in with JWT-based authentication
- Manage a personal ingredient library with calories per gram, milliliter, or
  piece
- Create recipes from saved ingredients
- Edit, delete, and view recipes
- Scale recipe servings on the recipe detail page
- Save variants of existing recipes while keeping them grouped with the original
- View recipe calorie totals and per-serving estimates

## Technical Overview

### Backend

- FastAPI REST API with async route handlers
- PostgreSQL persistence with SQLAlchemy 2.0 async sessions and `asyncpg`
- Alembic migrations for schema changes
- Pydantic request and response schemas
- JWT authentication and password hashing with Argon2
- Pytest test suite

### Frontend

- React and TypeScript with Vite
- React Router for application routes
- TanStack Query for server state, caching, invalidation, and auth-aware query
  cleanup
- React Hook Form for form state and validation
- Tailwind CSS for styling
- Generated TypeScript types from the FastAPI OpenAPI schema
- Playwright smoke tests

## Tech Stack

| Area | Tools |
| --- | --- |
| Backend | Python, FastAPI, Pydantic, SQLAlchemy, Alembic, PostgreSQL, asyncpg |
| Frontend | React, TypeScript, Vite, React Router, TanStack Query, React Hook Form, Tailwind CSS |
| Tooling | uv, pnpm, Ruff, pytest, Playwright, Docker Compose |
| Deployment | Vercel frontend, Render backend, managed PostgreSQL |

## Local Development

### Prerequisites

- Docker and Docker Compose
- uv
- pnpm

### 1. Configure Environment Files

From the repository root:

```bash
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Generate a local JWT secret and replace the placeholder value in
`backend/.env`:

```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### 2. Start PostgreSQL

```bash
docker compose up -d postgres
```

Create the isolated test database once per local Docker volume:

```bash
docker compose exec postgres sh -c 'createdb --username "$POSTGRES_USER" --owner "$POSTGRES_USER" --maintenance-db "$POSTGRES_DB" recipe_app_test'
```

### 3. Run Backend Migrations

```bash
cd backend
uv run alembic -c alembic.ini upgrade head
```

To migrate the test database, run the same command with `DATABASE_URL` pointing
at `recipe_app_test`.

Default local example:

```bash
DATABASE_URL=postgresql+asyncpg://recipe_app:recipe_app_password@localhost:5432/recipe_app_test uv run alembic -c alembic.ini upgrade head
```

If you changed `POSTGRES_PORT`, use that port in the test database URL.

### 4. Start The App

Backend:

```bash
cd backend
uv run uvicorn app.main:app --reload
```

Frontend:

```bash
cd frontend
pnpm install
pnpm dev
```

The frontend expects `VITE_API_BASE_URL` in `frontend/.env`; the example file
points to the local backend at `http://localhost:8000`.

## Checks And Tests

Backend:

```bash
cd backend
uv run ruff format --check .
uv run ruff check .
uv run pytest
```

Frontend:

```bash
cd frontend
pnpm lint
VITE_API_BASE_URL=http://localhost:8000 pnpm build
```

End-to-end smoke tests:

```bash
cd frontend
TEST_DATABASE_URL=postgresql+asyncpg://recipe_app:recipe_app_password@localhost:5432/recipe_app_test pnpm test:e2e
```

The Playwright setup starts FastAPI and Vite locally, runs Alembic against the
test database, and refuses to run unless the selected database name ends in
`_test`.

## API Types

Frontend API types are generated from the backend OpenAPI schema:

```bash
cd frontend
pnpm generate:api-types
```

The generated files are used through a small frontend type facade in
`frontend/src/api/types.ts`.
