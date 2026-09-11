import { expect, test } from '@playwright/test'

import { createIngredient, registerUser } from './helpers'
import { testUsers } from './testUsers'

test('creates the first library ingredient without losing an unfinished recipe', async ({
  page,
}, testInfo) => {
  await registerUser(page, testUsers.recipeIngredientCreation)
  await page.goto('/recipes/new')
  await page.getByLabel('Title').fill('E2E recipe from an empty library')
  await page.getByLabel('Description').fill('Keep this description')
  await page.getByLabel('Instructions').fill('Keep these instructions')
  await page.getByLabel('Base servings').fill('3')
  await page.getByRole('button', { name: 'Create recipe', exact: true }).click()
  await expect(page.getByText('Ingredient is required', { exact: true })).toBeVisible()

  const createButton = page.getByRole('button', { name: 'Create ingredient', exact: true })
  const dialog = page.getByRole('dialog', { name: 'Create ingredient' })
  await createButton.click()
  await expect(dialog.getByLabel('Name', { exact: true })).toBeFocused()
  await dialog.getByLabel('Name', { exact: true }).fill('Canceled ingredient')
  await page.keyboard.press('Escape')
  await expect(dialog).not.toBeVisible()
  await expect(createButton).toBeFocused()
  await expect(page.getByLabel('Ingredient', { exact: true })).toHaveCount(1)
  await expect(page.getByLabel('Title')).toHaveValue('E2E recipe from an empty library')
  await expect(page.getByLabel('Instructions')).toHaveValue('Keep these instructions')

  await createButton.click()
  await expect(dialog.getByLabel('Name', { exact: true })).toHaveValue('')
  await dialog.getByRole('button', { name: 'Cancel', exact: true }).click()
  await expect(dialog).not.toBeVisible()
  await expect(createButton).toBeFocused()
  await createButton.click()
  await dialog.getByLabel('Name', { exact: true }).fill('E2E new flour')
  await dialog.getByLabel('Label quantity', { exact: true }).fill('14')
  await dialog.getByLabel('Calories (kcal)', { exact: true }).fill('126')
  await expect(dialog.getByRole('status')).toHaveText('9 kcal per gram')
  await page.screenshot({ path: testInfo.outputPath('ingredient-dialog-desktop.png') })

  const createdIngredient = page.waitForResponse(
    (response) =>
      new URL(response.url()).pathname === '/ingredients' &&
      response.request().method() === 'POST',
  )
  await dialog.getByRole('button', { name: 'Create ingredient', exact: true }).click()
  const creationResponse = await createdIngredient
  expect(creationResponse.status()).toBe(201)
  const ingredient = await creationResponse.json()
  await expect(dialog).not.toBeVisible()
  await expect(page.getByLabel('Ingredient', { exact: true })).toHaveCount(2)
  await expect(page.getByLabel('Quantity', { exact: true }).first()).toBeFocused()
  await expect(page.getByLabel('Ingredient', { exact: true }).nth(1)).toHaveValue('0')
  await expect(page.getByLabel('Quantity', { exact: true }).nth(1)).toHaveValue('')
  await expect(page.getByText('Ingredient is required', { exact: true })).toHaveCount(1)
  await expect(
    page.getByLabel('Ingredient', { exact: true }).first(),
  ).toHaveValue(String(ingredient.id))
  await expect(
    page.getByLabel('Ingredient', { exact: true }).first().locator('option:checked'),
  ).toHaveText('E2E new flour (g)')
  await expect(page.getByLabel('Quantity', { exact: true }).first()).toHaveValue('')
  await page.getByLabel('Quantity', { exact: true }).first().fill('100')
  await expect(page.getByLabel('Title')).toHaveValue('E2E recipe from an empty library')
  await expect(page.getByLabel('Description')).toHaveValue('Keep this description')
  await expect(page.getByLabel('Instructions')).toHaveValue('Keep these instructions')
  await expect(page.getByLabel('Base servings')).toHaveValue('3')

  await page.getByRole('button', { name: 'Remove', exact: true }).nth(1).click()
  await page.getByRole('button', { name: 'Create recipe', exact: true }).click()
  await expect(
    page.getByRole('heading', { name: 'E2E recipe from an empty library' }),
  ).toBeVisible()
  await expect(
    page.getByRole('cell', { name: 'E2E new flour', exact: true }),
  ).toBeVisible()
  await expect(page.getByLabel('Target servings')).toHaveValue('3')
  await page.goto('/ingredients')
  await expect(
    page.getByRole('cell', { name: 'Canceled ingredient', exact: true }),
  ).toHaveCount(0)
  await expect(
    page.getByRole('cell', { name: 'E2E new flour', exact: true }),
  ).toBeVisible()
})

test('keeps edit inputs on ingredient creation errors and adds a row after retry', async ({
  page,
}) => {
  await registerUser(page, testUsers.recipeIngredientEditing)
  await createIngredient(page, { name: 'E2E existing oats', caloriesPerUnit: '4' })
  await page.goto('/recipes/new')
  await page.getByLabel('Title').fill('E2E oats recipe')
  await page.getByLabel('Instructions').fill('Mix the oats')
  await page.getByLabel('Ingredient', { exact: true }).selectOption({ label: 'E2E existing oats (g)' })
  await page.getByLabel('Quantity', { exact: true }).fill('40')
  await page.getByRole('button', { name: 'Create recipe', exact: true }).click()
  await page.getByRole('link', { name: 'Edit', exact: true }).click()
  await page.getByLabel('Title').fill('E2E updated oats recipe')
  const originalQuantity = await page.getByLabel('Quantity', { exact: true }).inputValue()
  await page.getByLabel('Instructions').fill('Mix the oats and milk')
  await page.getByRole('button', { name: 'Create ingredient', exact: true }).click()

  const dialog = page.getByRole('dialog', { name: 'Create ingredient' })
  await dialog.getByLabel('Name', { exact: true }).fill('E2E existing oats')
  await dialog.getByLabel('Unit', { exact: true }).selectOption('ml')
  await dialog.getByLabel('Label quantity', { exact: true }).fill('100')
  await dialog.getByLabel('Calories (kcal)', { exact: true }).fill('50')
  await dialog.getByRole('button', { name: 'Create ingredient', exact: true }).click()
  await expect(
    dialog.getByText('Ingredient already exists', { exact: true }),
  ).toBeVisible()
  await expect(page.getByLabel('Ingredient', { exact: true })).toHaveCount(1)
  await expect(
    dialog.getByLabel('Name', { exact: true }),
  ).toHaveValue('E2E existing oats')
  await expect(dialog.getByLabel('Label quantity', { exact: true })).toHaveValue('100')
  await expect(dialog.getByLabel('Calories (kcal)', { exact: true })).toHaveValue('50')
  await dialog.getByLabel('Name', { exact: true }).fill('E2E new milk')

  let releaseResponse!: () => void
  const responseGate = new Promise<void>((resolve) => {
    releaseResponse = resolve
  })
  await page.route('**/ingredients', async (route) => {
    if (route.request().method() !== 'POST') {
      await route.continue()
      return
    }
    const response = await route.fetch()
    await responseGate
    await route.fulfill({ response })
  })
  try {
    await dialog.getByRole('button', { name: 'Create ingredient', exact: true }).click()
    await expect(dialog.getByRole('button', { name: 'Please wait...' })).toBeDisabled()
    await expect(dialog.getByRole('button', { name: 'Cancel', exact: true })).toBeDisabled()
    await page.keyboard.press('Escape')
    await expect(dialog).toBeVisible()
  } finally {
    releaseResponse()
  }
  await expect(dialog).not.toBeVisible()
  await page.unrouteAll({ behavior: 'wait' })
  await expect(page.getByLabel('Ingredient', { exact: true })).toHaveCount(2)
  await expect(page.getByLabel('Quantity', { exact: true }).nth(0)).toBeFocused()
  await expect(
    page.getByLabel('Ingredient', { exact: true }).nth(1).locator('option:checked'),
  ).toHaveText('E2E existing oats (g)')
  await expect(
    page.getByLabel('Ingredient', { exact: true }).nth(0).locator('option:checked'),
  ).toHaveText('E2E new milk (ml)')
  await expect(
    page.getByLabel('Quantity', { exact: true }).nth(1),
  ).toHaveValue(originalQuantity)
  await expect(page.getByLabel('Quantity', { exact: true }).nth(0)).toHaveValue('')
  await page.getByLabel('Quantity', { exact: true }).nth(0).fill('125')
  await expect(page.getByLabel('Title')).toHaveValue('E2E updated oats recipe')
  await expect(page.getByLabel('Instructions')).toHaveValue('Mix the oats and milk')
  await page.getByRole('button', { name: 'Save recipe', exact: true }).click()
  await expect(
    page.getByRole('heading', { name: 'E2E updated oats recipe' }),
  ).toBeVisible()
  await expect(
    page.getByRole('cell', { name: 'E2E existing oats', exact: true }),
  ).toBeVisible()
  await expect(
    page.getByRole('cell', { name: 'E2E new milk', exact: true }),
  ).toBeVisible()
})

test('creates an ingredient in a variant on mobile even when the library refresh fails', async ({
  page,
}, testInfo) => {
  await registerUser(page, testUsers.variantIngredientCreation)
  await createIngredient(page, { name: 'E2E original egg', caloriesPerUnit: '70', unit: 'piece' })
  await page.goto('/recipes/new')
  await page.getByLabel('Title').fill('E2E egg recipe')
  await page.getByLabel('Instructions').fill('Cook the egg')
  await page.getByLabel('Ingredient', { exact: true }).selectOption({ label: 'E2E original egg (piece)' })
  await page.getByLabel('Quantity', { exact: true }).fill('1')
  await page.getByRole('button', { name: 'Create recipe', exact: true }).click()
  await page.getByRole('link', { name: 'Create variant', exact: true }).click()
  await page.setViewportSize({ width: 390, height: 844 })
  await page.getByLabel('Title').fill('E2E egg and cheese variant')
  await page.getByLabel('Instructions').fill('Cook the egg with cheese')
  await page.getByRole('button', { name: 'Add ingredient', exact: true }).click()
  await expect(page.getByLabel('Ingredient', { exact: true }).nth(0)).toBeFocused()
  await expect(page.getByLabel('Quantity', { exact: true }).nth(1)).toHaveValue('1.0000')
  await page.getByRole('button', { name: 'Add ingredient', exact: true }).click()
  await expect(page.getByLabel('Ingredient', { exact: true }).nth(0)).toBeFocused()
  await page.getByLabel('Quantity', { exact: true }).nth(0).fill('20')
  await page.getByRole('button', { name: 'Create variant', exact: true }).click()
  await expect(page.getByText('Ingredient is required', { exact: true })).toHaveCount(2)
  const createButton = page.getByRole('button', { name: 'Create ingredient', exact: true })
  await expect(createButton).toHaveCount(1)
  await createButton.scrollIntoViewIfNeeded()
  await page.screenshot({ path: testInfo.outputPath('recipe-ingredient-actions-mobile.png') })
  expect(await page.evaluate(() =>
    document.documentElement.scrollWidth <= window.innerWidth,
  )).toBe(true)
  await createButton.click()
  const dialog = page.getByRole('dialog', { name: 'Create ingredient' })
  await dialog.getByLabel('Name', { exact: true }).fill('E2E new cheese')
  await dialog.getByLabel('Calories (kcal)', { exact: true }).fill('4')
  await page.screenshot({ path: testInfo.outputPath('ingredient-dialog-mobile.png') })
  expect(await dialog.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true)

  await page.route('**/ingredients', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({ status: 503, json: { detail: 'Ingredient library refresh unavailable' } })
    } else {
      await route.continue()
    }
  })
  await dialog.getByRole('button', { name: 'Create ingredient', exact: true }).click()
  await expect(dialog).not.toBeVisible()
  await expect(page.getByLabel('Ingredient', { exact: true })).toHaveCount(4)
  await expect(page.getByLabel('Quantity', { exact: true }).nth(0)).toBeFocused()
  await expect(page.getByLabel('Ingredient', { exact: true }).nth(1)).toHaveValue('0')
  await expect(page.getByLabel('Ingredient', { exact: true }).nth(2)).toHaveValue('0')
  await expect(page.getByLabel('Quantity', { exact: true }).nth(2)).toHaveValue('')
  await expect(page.getByText('Ingredient is required', { exact: true })).toHaveCount(2)
  await expect(
    page.getByLabel('Ingredient', { exact: true }).nth(0).locator('..')
      .getByText('Ingredient is required', { exact: true }),
  ).not.toBeVisible()
  await expect(
    page.getByLabel('Ingredient', { exact: true }).nth(1).locator('..')
      .getByText('Ingredient is required', { exact: true }),
  ).toBeVisible()
  await expect(page.getByLabel('Quantity', { exact: true }).nth(1)).toHaveValue('20')
  await expect(
    page.getByLabel('Ingredient', { exact: true }).nth(0).locator('option:checked'),
  ).toHaveText('E2E new cheese (g)')
  await page.getByLabel('Quantity', { exact: true }).nth(0).fill('20')
  await expect(
    page.getByText('Ingredient library refresh unavailable', { exact: true }),
  ).toBeVisible({ timeout: 15000 })
  await expect(page.getByLabel('Title')).toHaveValue('E2E egg and cheese variant')
  await expect(page.getByLabel('Instructions')).toHaveValue('Cook the egg with cheese')
  await expect(page.getByLabel('Quantity', { exact: true }).nth(1)).toHaveValue('20')
  await page.unrouteAll({ behavior: 'wait' })
  await page.getByRole('button', { name: 'Remove', exact: true }).nth(2).click()
  await page.getByRole('button', { name: 'Remove', exact: true }).nth(1).click()
  await page.getByRole('button', { name: 'Create variant', exact: true }).click()
  await expect(
    page.getByRole('heading', { name: 'E2E egg and cheese variant' }),
  ).toBeVisible()
  await expect(
    page.getByRole('cell', { name: 'E2E original egg', exact: true }),
  ).toBeVisible()
  await expect(
    page.getByRole('cell', { name: 'E2E new cheese', exact: true }),
  ).toBeVisible()
})

test('does not duplicate an ingredient loaded by a refresh before creation completes', async ({ page }) => {
  await registerUser(page, testUsers.ingredientCreationRefresh)
  await page.goto('/recipes/new')
  await page.getByRole('button', { name: 'Create ingredient', exact: true }).click()
  const dialog = page.getByRole('dialog', { name: 'Create ingredient' })
  await dialog.getByLabel('Name', { exact: true }).fill('E2E refreshed ingredient')
  await dialog.getByLabel('Calories (kcal)', { exact: true }).fill('2')

  let ingredientSaved!: () => void
  const saved = new Promise<void>((resolve) => {
    ingredientSaved = resolve
  })
  let releaseCreation!: () => void
  const creationGate = new Promise<void>((resolve) => {
    releaseCreation = resolve
  })
  let releaseRefresh!: () => void
  const refreshGate = new Promise<void>((resolve) => {
    releaseRefresh = resolve
  })
  let holdRefresh = false

  await page.route('**/ingredients', async (route) => {
    if (route.request().method() === 'POST') {
      const response = await route.fetch()
      expect(response.status()).toBe(201)
      ingredientSaved()
      await creationGate
      await route.fulfill({ response })
    } else {
      if (holdRefresh) {
        await refreshGate
      }
      await route.continue()
    }
  })

  try {
    await dialog.getByRole('button', { name: 'Create ingredient', exact: true }).click()
    await saved

    // Simulate returning to the tab while the creation response is still pending.
    await page.evaluate(() => {
      Object.defineProperty(document, 'visibilityState', {
        configurable: true,
        value: 'hidden',
      })
      document.dispatchEvent(new Event('visibilitychange', { bubbles: true }))
      Reflect.deleteProperty(document, 'visibilityState')
      document.dispatchEvent(new Event('visibilitychange', { bubbles: true }))
    })

    const ingredientOption = page
      .getByLabel('Ingredient', { exact: true })
      .first()
      .locator('option')
      .filter({ hasText: 'E2E refreshed ingredient (g)' })
    await expect(ingredientOption).toHaveCount(1)
    await expect(dialog.getByRole('button', { name: 'Please wait...' })).toBeDisabled()

    // Hold the next refresh so it cannot hide a duplicate inserted by onSuccess.
    holdRefresh = true
    releaseCreation()
    await expect(dialog).not.toBeVisible()
    await expect(page.getByLabel('Ingredient', { exact: true })).toHaveCount(2)
    await expect(page.getByLabel('Quantity', { exact: true }).first()).toBeFocused()
    await expect(ingredientOption).toHaveCount(1)
    await expect(
      page.getByLabel('Ingredient', { exact: true }).first().locator('option:checked'),
    ).toHaveText('E2E refreshed ingredient (g)')
  } finally {
    releaseCreation()
    releaseRefresh()
    await page.unrouteAll({ behavior: 'wait' })
  }
})
