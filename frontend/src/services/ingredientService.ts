import { fetchApi, fetchApiJson } from '../api/fetchApi'
import type {
  Ingredient,
  IngredientCreateRequest,
  IngredientUpdateRequest,
} from '../api/types'
import { tokenStorage } from '../utils/tokenStorage'

export async function listIngredients(): Promise<Ingredient[]> {
  return fetchApiJson<Ingredient[]>('/ingredients', {
    headers: getAuthHeaders(),
  })
}

export async function createIngredient(
  request: IngredientCreateRequest,
): Promise<Ingredient> {
  return fetchApiJson<Ingredient>('/ingredients', {
    method: 'POST',
    headers: getJsonAuthHeaders(),
    body: JSON.stringify(request),
  })
}

export async function updateIngredient(
  ingredientId: number,
  request: IngredientUpdateRequest,
): Promise<Ingredient> {
  return fetchApiJson<Ingredient>(`/ingredients/${ingredientId}`, {
    method: 'PUT',
    headers: getJsonAuthHeaders(),
    body: JSON.stringify(request),
  })
}

export async function deleteIngredient(ingredientId: number): Promise<void> {
  await fetchApi(`/ingredients/${ingredientId}`, {
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
