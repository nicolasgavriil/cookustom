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
