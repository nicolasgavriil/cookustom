import { defineConfig, devices } from '@playwright/test'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const backendDir = path.resolve(__dirname, '../backend')

const apiPort = 8001
const frontendPort = 5174
const apiBaseUrl = `http://127.0.0.1:${apiPort}`
const frontendBaseUrl = `http://127.0.0.1:${frontendPort}`
const testDatabaseUrl =
  process.env.E2E_DATABASE_URL ??
  process.env.TEST_DATABASE_URL ??
  'postgresql+asyncpg://recipe_app:recipe_app_password@localhost:5432/recipe_app_test'
const testDatabaseNameSuffix = '_test'

const getDatabaseName = (databaseUrl: string) => {
  const trimmedDatabaseUrl = databaseUrl.trim()

  if (!trimmedDatabaseUrl) {
    throw new Error('E2E_DATABASE_URL or TEST_DATABASE_URL cannot be empty')
  }

  let parsedDatabaseUrl: URL

  try {
    parsedDatabaseUrl = new URL(trimmedDatabaseUrl)
  } catch (error) {
    throw new Error('E2E_DATABASE_URL or TEST_DATABASE_URL must be valid', {
      cause: error,
    })
  }

  const databaseName = decodeURIComponent(
    parsedDatabaseUrl.pathname.replace(/^\//, ''),
  )

  if (!databaseName) {
    throw new Error('E2E database URL must include a database name')
  }

  return databaseName
}

const databaseName = getDatabaseName(testDatabaseUrl)

if (!databaseName.endsWith(testDatabaseNameSuffix)) {
  throw new Error(
    `E2E database name must end with ${testDatabaseNameSuffix}: ${databaseName}`,
  )
}

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: frontendBaseUrl,
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command:
        "sh -c 'uv run alembic -c alembic.ini upgrade head && " +
        "uv run python -m scripts.cleanup_e2e_data && " +
        `uv run uvicorn app.main:app --host 127.0.0.1 --port ${apiPort}'`,
      cwd: backendDir,
      env: {
        DATABASE_URL: testDatabaseUrl,
        ENVIRONMENT: 'test',
        JWT_SECRET_KEY: 'test-jwt-secret-key-with-at-least-32-characters',
        FRONTEND_ORIGINS: frontendBaseUrl,
      },
      url: `${apiBaseUrl}/health`,
      reuseExistingServer: false,
      timeout: 120_000,
    },
    {
      command: `pnpm dev --host 127.0.0.1 --port ${frontendPort}`,
      env: {
        VITE_API_BASE_URL: apiBaseUrl,
      },
      url: frontendBaseUrl,
      reuseExistingServer: false,
      timeout: 120_000,
    },
  ],
})
