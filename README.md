# Recipe App

A full-stack personal recipe and nutrition manager built with FastAPI, PostgreSQL, React, and TypeScript.

## Planned Features

- User registration and protected user data
- Personal ingredient library with manually entered calorie values
- Recipe creation, editing, listing, detail views, and deletion
- Recipe ingredients linked to the user's ingredient library
- Serving-based recipe scaling
- Total and per-serving calorie calculations
- Recipe variants that preserve the original recipe

## Tech Stack

### Backend

- Python
- FastAPI
- Pydantic
- SQLAlchemy 2.0
- Alembic
- PostgreSQL
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

## Development Status

This project is in early development. The initial focus is building the backend foundation with a small, tested FastAPI application before adding the database schema, authentication, recipe management, and frontend.

## Backend Development

From the `backend/` directory:

```bash
uv run uvicorn app.main:app --reload
```

Run backend tests and lint checks:

```bash
uv run pytest
uv run ruff check .
uv run ruff format --check .
```

## Local Database

Copy the example environment file if you want to override the default local database values:

```bash
cp .env.example .env
```

Start PostgreSQL from the repository root:

```bash
docker compose up -d postgres
```

The backend reads its own environment from `backend/.env`. Copy the example file before running database-backed features:

```bash
cp backend/.env.example backend/.env
```
