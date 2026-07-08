import { fetchApi, fetchApiJson } from '../api/fetchApi'
import type {
  Recipe,
  RecipeCreateRequest,
  RecipeSummary,
  RecipeUpdateRequest,
} from '../api/types'
import { tokenStorage } from '../utils/tokenStorage'

export async function listRecipes(): Promise<RecipeSummary[]> {
  return fetchApiJson<RecipeSummary[]>('/recipes', {
    headers: getAuthHeaders(),
  })
}

export async function getRecipe(recipeId: number): Promise<Recipe> {
  return fetchApiJson<Recipe>(`/recipes/${recipeId}`, {
    headers: getAuthHeaders(),
  })
}

export async function createRecipe(
  request: RecipeCreateRequest,
): Promise<Recipe> {
  return fetchApiJson<Recipe>('/recipes', {
    method: 'POST',
    headers: getJsonAuthHeaders(),
    body: JSON.stringify(request),
  })
}

export async function updateRecipe(
  recipeId: number,
  request: RecipeUpdateRequest,
): Promise<Recipe> {
  return fetchApiJson<Recipe>(`/recipes/${recipeId}`, {
    method: 'PUT',
    headers: getJsonAuthHeaders(),
    body: JSON.stringify(request),
  })
}

export async function deleteRecipe(recipeId: number): Promise<void> {
  await fetchApi(`/recipes/${recipeId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  })
}

function getAuthHeaders(): Headers {
  const headers = new Headers()
  const token = tokenStorage.getAccessToken()

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  return headers
}

function getJsonAuthHeaders(): Headers {
  const headers = getAuthHeaders()
  headers.set('Content-Type', 'application/json')
  return headers
}
