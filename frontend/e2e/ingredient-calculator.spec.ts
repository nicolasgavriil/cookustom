import { expect, test } from '@playwright/test'

import { registerUser } from './helpers'
import { testUsers } from './testUsers'

test('calculates label calories and preserves normalized values when editing', async ({
  page,
}) => {
  await registerUser(page, testUsers.ingredientCalculator)
  await page.goto('/ingredients/new')
  await page.getByLabel('Name').fill('E2E label ingredient')
  const quantity = page.getByLabel('Label quantity', { exact: true })
  const calories = page.getByLabel('Calories (kcal)', { exact: true })
  const unit = page.getByLabel('Unit', { exact: true })

  await expect(quantity).toHaveValue('1')
  await expect(page.getByRole('status')).toBeEmpty()
  await quantity.fill('14')
  await calories.fill('126')
  await expect(page.getByRole('status')).toHaveText('9 kcal per gram')

  const createRequest = page.waitForRequest(
    (request) =>
      new URL(request.url()).pathname === '/ingredients' &&
      request.method() === 'POST',
  )
  await page.getByRole('button', { name: 'Create ingredient' }).click()
  expect((await createRequest).postDataJSON()).toEqual({
    name: 'E2E label ingredient',
    unit: 'g',
    calories_per_unit: '9.0000',
  })

  const row = page.getByRole('row').filter({ hasText: 'E2E label ingredient' })
  await row.getByRole('link', { name: 'Edit' }).click()
  await expect(quantity).toHaveValue('1')
  await expect(calories).toHaveValue('9.0000')

  await calories.fill('9.00005')
  await page.getByRole('button', { name: 'Save ingredient' }).click()
  await expect(
    page.getByText(
      'Enter zero or a positive number with up to 4 decimals (e.g. 1.25)',
    ),
  ).toBeVisible()
  await expect(page.getByRole('status')).toBeEmpty()
  await expect(page).toHaveURL(/\/ingredients\/\d+\/edit$/)
  await calories.fill('9.0000')

  await page.getByLabel('Name').fill('E2E renamed label ingredient')
  await page.getByRole('button', { name: 'Save ingredient' }).click()
  await expect(
    page.getByRole('heading', { name: 'Ingredient library' }),
  ).toBeVisible()
  await page.reload()
  const renamedRow = page
    .getByRole('row')
    .filter({ hasText: 'E2E renamed label ingredient' })
  await expect(
    renamedRow.getByRole('cell', { name: '9', exact: true }),
  ).toBeVisible()
  await renamedRow.getByRole('link', { name: 'Edit' }).click()

  await quantity.fill('7')
  await calories.fill('10')
  await unit.selectOption('piece')
  await expect(page.getByRole('status')).toHaveText('1.4286 kcal per piece')
  const updateRequest = page.waitForRequest(
    (request) =>
      /\/ingredients\/\d+$/.test(new URL(request.url()).pathname) &&
      request.method() === 'PUT',
  )
  await page.getByRole('button', { name: 'Save ingredient' }).click()
  expect((await updateRequest).postDataJSON()).toEqual({
    name: 'E2E renamed label ingredient',
    unit: 'piece',
    calories_per_unit: '1.4286',
  })
  await renamedRow.getByRole('link', { name: 'Edit' }).click()
  await expect(quantity).toHaveValue('1')
  await expect(calories).toHaveValue('1.4286')
  await expect(unit).toHaveValue('piece')
  await expect(page.getByRole('status')).toHaveText('1.4286 kcal per piece')
})

test('validates label inputs and supports fractional quantities and zero calories', async ({
  page,
}) => {
  await registerUser(page, testUsers.ingredientValidation)
  await page.goto('/ingredients/new')
  await page.getByLabel('Name').fill('E2E zero-calorie ingredient')
  const quantity = page.getByLabel('Label quantity', { exact: true })
  const calories = page.getByLabel('Calories (kcal)', { exact: true })
  const submit = page.getByRole('button', { name: 'Create ingredient' })
  await calories.fill('126')

  for (const invalidQuantity of [
    '', '0', '-14', 'abc', 'Infinity', '1e2', '14.00005',
  ]) {
    await quantity.fill(invalidQuantity)
    await submit.click()
    await expect(quantity).toHaveAttribute('aria-invalid', 'true')
    await expect(page.getByRole('status')).toBeEmpty()
    await expect(page).toHaveURL(/\/ingredients\/new$/)
  }

  await quantity.fill('14')
  for (const invalidCalories of ['', '-126', 'abc', 'Infinity', '1e2', '9.00005']) {
    await calories.fill(invalidCalories)
    await submit.click()
    await expect(calories).toHaveAttribute('aria-invalid', 'true')
    await expect(page.getByRole('status')).toBeEmpty()
    await expect(page).toHaveURL(/\/ingredients\/new$/)
  }

  await quantity.fill('1')
  await calories.fill('1000000')
  const rejectedCreation = page.waitForResponse(
    (response) =>
      new URL(response.url()).pathname === '/ingredients' &&
      response.request().method() === 'POST',
  )
  await submit.click()
  expect((await rejectedCreation).status()).toBe(422)
  await expect(page.getByText('Request failed', { exact: true })).toBeVisible()
  await quantity.fill('100')
  await expect(calories).toHaveAttribute('aria-invalid', 'false')
  await expect(page.getByRole('status')).toHaveText('10000 kcal per gram')

  await quantity.fill('2.5')
  await calories.fill('10')
  await page.getByLabel('Unit', { exact: true }).selectOption('ml')
  await expect(page.getByRole('status')).toHaveText('4 kcal per milliliter')
  await calories.fill('0')
  await expect(page.getByRole('status')).toHaveText('0 kcal per milliliter')
  await submit.click()

  const row = page
    .getByRole('row')
    .filter({ hasText: 'E2E zero-calorie ingredient' })
  await expect(row.getByRole('cell', { name: '0', exact: true })).toBeVisible()
  await expect(row.getByRole('cell', { name: 'ml', exact: true })).toBeVisible()
})
