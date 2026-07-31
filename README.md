# Recipe App

A full-stack recipe and nutrition manager for building a personal ingredient
library, creating recipes, scaling servings, and saving recipe variants.

The application is built as a monorepo with a FastAPI backend, PostgreSQL
database, and React frontend.

## Features

- User registration, login, and protected personal data
- Ingredient library with user-defined units and calories per unit
- Recipe creation, editing, listing, detail views, and deletion
- Recipe ingredients linked to the user's ingredient library
- Serving-based ingredient and calorie scaling
- Total and per-serving calorie summaries
- Recipe variants that preserve a connection to the original recipe
- Forms, routing, server-state caching, and generated API types

## Technical Overview

- The backend exposes a REST API with async FastAPI route handlers.
- SQLAlchemy models represent users, ingredients, recipes, recipe ingredients,
  and recipe variants.
- Alembic migrations manage database schema changes.
- Pydantic schemas define request and response shapes and generate frontend
  TypeScript types from the OpenAPI schema.
- The frontend uses React Router for pages, TanStack Query for server state,
  and React Hook Form for forms.

## Tech Stack

### Backend

- Python
- FastAPI
- Pydantic
- SQLAlchemy 2.0 async ORM
- Alembic
- PostgreSQL
- asyncpg
- pytest
- Ruff
- uv

### Frontend

- React
- TypeScript
- Vite
- React Router
- TanStack Query
- React Hook Form
- Tailwind CSS
- pnpm

## Local Development

### Prerequisites

- Docker and Docker Compose
- uv
- pnpm

Enable package manager shims if `pnpm` is not already available:

```bash
corepack enable
```

### Database

Copy the root Docker environment example:

```bash
cp .env.example .env
```

Start PostgreSQL from the repository root:

```bash
docker compose up -d postgres
```

If your machine already has PostgreSQL running on port `5432`, use another host
port for this project's Docker database:

```env
POSTGRES_PORT=5433
```

Then use the same host port in `backend/.env` for both database URLs.

### Backend Environment

Copy the backend environment example:

```bash
cp backend/.env.example backend/.env
```

Generate a local JWT signing secret and replace the placeholder
`JWT_SECRET_KEY` in `backend/.env`:

```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

The placeholder value is intentionally rejected so the application cannot start
with a public signing key.

Create the isolated test database the first time you initialize the local
PostgreSQL volume:

```bash
docker compose exec postgres sh -c 'createdb --username "$POSTGRES_USER" --owner "$POSTGRES_USER" --maintenance-db "$POSTGRES_DB" recipe_app_test'
```

Apply migrations to the development database:

```bash
cd backend
uv run alembic -c alembic.ini upgrade head
```

Apply the same migrations to the test database:

```bash
DATABASE_URL=postgresql+asyncpg://recipe_app:recipe_app_password@localhost:5432/recipe_app_test uv run alembic -c alembic.ini upgrade head
```

If you changed `POSTGRES_PORT`, update the port in `backend/.env` and in the
test database migration command.

### Frontend Environment

Copy the frontend environment example:

```bash
cp frontend/.env.example frontend/.env
```

For local development, the example points to the local backend:

```env
VITE_API_BASE_URL=http://localhost:8000
```

## Running The App

Start the backend from `backend/`:

```bash
uv run uvicorn app.main:app --reload
```

Start the frontend from `frontend/`:

```bash
pnpm install
pnpm dev
```

## API Types

Generate frontend API types from the FastAPI OpenAPI schema:

```bash
cd frontend
pnpm generate:api-types
```

This imports the backend FastAPI app, writes the OpenAPI schema, and regenerates
the TypeScript types used by the frontend. API calls are still implemented by
manual service functions.