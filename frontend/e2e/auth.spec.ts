import { expect, test } from '@playwright/test'

import { logout, registerUser } from './helpers'
import { testUsers } from './testUsers'

const apiBaseUrl = 'http://127.0.0.1:8001'

test('redirects logged-out users away from protected pages', async ({ page }) => {
  await page.goto('/recipes')

  await expect(page).toHaveURL(/\/login$/)
  await expect(page.getByRole('heading', { name: 'Log in' })).toBeVisible()
})

test('opens an isolated populated demo without registration', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Explore demo' }).click()

  await expect(page).toHaveURL(/\/recipes$/)
  await expect(
    page.getByRole('heading', { name: 'Recipe collection' }),
  ).toBeVisible()
  await expect(page.getByText('Demo session')).toBeVisible()
  await expect(
    page.getByRole('link', { name: 'Chicken rice bowl' }),
  ).toBeVisible()
  await expect(
    page.getByRole('link', { name: 'Avocado egg toast' }),
  ).toBeVisible()

  await page
    .getByRole('button', { name: 'Show variants for Chicken rice bowl' })
    .click()

  await expect(
    page.getByRole('link', { name: 'Higher-protein rice bowl' }),
  ).toBeVisible()
  await expect(
    page.getByRole('link', { name: 'Vegetarian rice bowl' }),
  ).toBeVisible()
})

test('opens the demo from the login page', async ({ page }) => {
  await page.goto('/login')
  await page.getByRole('button', { name: 'Explore demo' }).click()

  await expect(page).toHaveURL(/\/recipes$/)
  await expect(page.getByText('Demo session')).toBeVisible()
  await expect(
    page.getByRole('link', { name: 'Chicken rice bowl' }),
  ).toBeVisible()
})

test('restores the user from a stored token after refreshing', async ({ page }) => {
  await registerUser(page, testUsers.authRefresh)

  await page.goto('/recipes')
  await expect(
    page.getByRole('heading', { name: 'Recipe collection' }),
  ).toBeVisible()

  await page.reload()

  await expect(
    page.getByRole('heading', { name: 'Recipe collection' }),
  ).toBeVisible()
  await expect(page.getByText(testUsers.authRefresh.email)).toBeVisible()
})

test('clears the stored token when session refetch is unauthorized', async ({
  page,
}) => {
  await registerUser(page, testUsers.authRefocus)

  await page.goto('/recipes')
  await expect(
    page.getByRole('heading', { name: 'Recipe collection' }),
  ).toBeVisible()

  const authMeRoute = (url: URL) =>
    url.origin === apiBaseUrl && url.pathname === '/auth/me'

  await page.route(authMeRoute, async (route) => {
    await route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({ detail: 'Could not validate credentials' }),
    })
  })

  const authRefetch = page.waitForResponse(
    (response) =>
      response.url() === `${apiBaseUrl}/auth/me` && response.status() === 401,
  )

  await page.evaluate(() => {
    window.dispatchEvent(new Event('visibilitychange'))
  })
  await authRefetch

  await expect(page).toHaveURL(/\/login$/)
  await expect
    .poll(() =>
      page.evaluate(() => localStorage.getItem('recipe_app_access_token')),
    )
    .toBeNull()
})

test('does not show previous account data after account switch', async ({ page }) => {
  await registerUser(page, testUsers.userA)
  await page.goto('/ingredients/new')
  await page.getByLabel('Name').fill('E2E user A ingredient')
  await page.getByLabel('Calories per unit').fill('1.5')
  await page.getByRole('button', { name: 'Create ingredient' }).click()
  await expect(
    page.getByRole('cell', { name: 'E2E user A ingredient' }),
  ).toBeVisible()

  await logout(page)
  await registerUser(page, testUsers.userB)

  let releaseIngredientsResponse: () => void = () => undefined
  const delayedIngredientsResponse = new Promise<void>((resolve) => {
    releaseIngredientsResponse = resolve
  })
  const ingredientsRoute = (url: URL) =>
    url.origin === apiBaseUrl && url.pathname === '/ingredients'

  await page.route(ingredientsRoute, async (route) => {
    if (route.request().method() !== 'GET') {
      await route.continue()
      return
    }

    await delayedIngredientsResponse
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    })
  })

  await page.goto('/ingredients')

  try {
    await expect(
      page.getByRole('heading', { name: 'Ingredient library' }),
    ).toBeVisible()
    await expect(page.getByText('E2E user A ingredient')).toBeHidden({
      timeout: 500,
    })
  } finally {
    releaseIngredientsResponse()
  }

  await expect(page.getByText('No ingredients yet')).toBeVisible()
  await expect(page.getByText('E2E user A ingredient')).not.toBeVisible()
  await page.unroute(ingredientsRoute)
})
