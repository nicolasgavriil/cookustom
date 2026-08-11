import { expect, test } from '@playwright/test'

import { createIngredient, registerUser } from './helpers'
import { testUsers } from './testUsers'

test('creates an ingredient and recipe, then opens recipe detail', async ({
  page,
}) => {
  await registerUser(page, testUsers.workflow)
  await createIngredient(page, {
    name: 'E2E flour',
    caloriesPerUnit: '3.6',
  })

  await page.goto('/recipes/new')
  await page.getByLabel('Title').fill('E2E pancakes')
  await page.getByLabel('Base servings').fill('2')
  await page.getByLabel('Description').fill('Simple E2E recipe')
  await page.getByLabel('Instructions').fill('Mix ingredients and cook.')
  await page.getByLabel('Ingredient').selectOption({ label: 'E2E flour (g)' })
  await page.getByLabel('Quantity').fill('100')
  await page.getByRole('button', { name: 'Create recipe' }).click()

  await expect(
    page.getByRole('heading', { name: 'E2E pancakes' }),
  ).toBeVisible()
  await expect(page.getByText('Simple E2E recipe')).toBeVisible()
  await expect(page.getByRole('cell', { name: 'E2E flour' })).toBeVisible()
  await expect(page.getByLabel('Target servings')).toHaveValue('2')

  await page.getByRole('button', { name: 'Increase servings' }).click()

  await expect(page.getByLabel('Target servings')).toHaveValue('3')
})

test('rounds fractional calories consistently in recipe list and detail', async ({
  page,
}) => {
  await registerUser(page, testUsers.calorieRounding)
  await createIngredient(page, {
    name: 'E2E half-calorie ingredient',
    caloriesPerUnit: '2.5',
  })

  await page.goto('/recipes/new')
  await page.getByLabel('Title').fill('E2E calorie rounding')
  await page.getByLabel('Base servings').fill('1')
  await page.getByLabel('Instructions').fill('Mix and serve.')
  await page
    .getByLabel('Ingredient')
    .selectOption({ label: 'E2E half-calorie ingredient (g)' })
  await page.getByLabel('Quantity').fill('1')
  await page.getByRole('button', { name: 'Create recipe' }).click()

  const calorieSummary = page.locator('dl')
  await expect(
    calorieSummary.getByText('Per serving').locator('..'),
  ).toContainText('3 kcal')
  await expect(
    calorieSummary.getByText('Total for 1').locator('..'),
  ).toContainText('3 kcal')
  const ingredientRow = page
    .getByRole('row')
    .filter({ hasText: 'E2E half-calorie ingredient' })
  await expect(ingredientRow.getByRole('cell', { name: '3 kcal' })).toBeVisible()

  await page.goto('/recipes')

  const recipeRow = page
    .getByRole('row')
    .filter({ hasText: 'E2E calorie rounding' })
  await expect(recipeRow.getByRole('cell', { name: '3 kcal' })).toHaveCount(2)
})
