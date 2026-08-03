import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

type TestUser = {
  email: string
  password: string
}

export const registerUser = async (page: Page, user: TestUser) => {
  await page.goto('/register')
  await page.getByLabel('Email').fill(user.email)
  await page.getByLabel('Password').fill(user.password)
  await page.getByRole('button', { name: 'Create account' }).click()

  await expect(page.getByText(user.email)).toBeVisible()
}

export const logout = async (page: Page) => {
  await page.getByRole('button', { name: 'Log out' }).first().click()
  await expect(page.getByRole('link', { name: 'Log in' })).toBeVisible()
}

export const createIngredient = async (
  page: Page,
  {
    name,
    caloriesPerUnit,
    unit = 'g',
  }: {
    name: string
    caloriesPerUnit: string
    unit?: 'g' | 'ml' | 'piece'
  },
) => {
  await page.goto('/ingredients/new')
  await page.getByLabel('Name').fill(name)
  await page.getByLabel('Unit', { exact: true }).selectOption(unit)
  await page.getByLabel('Calories per unit').fill(caloriesPerUnit)
  await page.getByRole('button', { name: 'Create ingredient' }).click()

  await expect(
    page.getByRole('heading', { name: 'Ingredient library' }),
  ).toBeVisible()
  await expect(page.getByRole('cell', { name })).toBeVisible()
}
