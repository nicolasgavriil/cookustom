import { authenticatedApiRequest } from '../api/fetchApi'
import type {
  Recipe,
  RecipeCreateRequest,
  RecipeSummary,
  RecipeUpdateRequest,
} from '../api/types'

const jsonHeaders = {
  'Content-Type': 'application/json',
}

export async function listRecipes(): Promise<RecipeSummary[]> {
  return authenticatedApiRequest<RecipeSummary[]>('/recipes')
}

export async function getRecipe(recipeId: number): Promise<Recipe> {
  return authenticatedApiRequest<Recipe>(`/recipes/${recipeId}`)
}

export async function createRecipe(
  request: RecipeCreateRequest,
): Promise<Recipe> {
  return authenticatedApiRequest<Recipe>('/recipes', {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify(request),
  })
}

export async function createRecipeVariant(
  sourceRecipeId: number,
  request: RecipeCreateRequest,
): Promise<Recipe> {
  return authenticatedApiRequest<Recipe>(
    `/recipes/${sourceRecipeId}/variants`,
    {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify(request),
    },
  )
}

export async function updateRecipe(
  recipeId: number,
  request: RecipeUpdateRequest,
): Promise<Recipe> {
  return authenticatedApiRequest<Recipe>(`/recipes/${recipeId}`, {
    method: 'PUT',
    headers: jsonHeaders,
    body: JSON.stringify(request),
  })
}

export async function deleteRecipe(recipeId: number): Promise<void> {
  await authenticatedApiRequest<void>(`/recipes/${recipeId}`, {
    method: 'DELETE',
  })
}
