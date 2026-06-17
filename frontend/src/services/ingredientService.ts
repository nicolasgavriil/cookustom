import { API_BASE_URL } from '../api/config'
import type {
  ApiErrorResponse,
  Ingredient,
  IngredientCreateRequest,
  IngredientUpdateRequest,
} from '../api/types'
import { tokenStorage } from '../utils/tokenStorage'

export async function listIngredients(): Promise<Ingredient[]> {
  const response = await fetch(`${API_BASE_URL}/ingredients`, {
    headers: getAuthHeaders(),
  })

  if (!response.ok) {
    throw new Error(await getErrorMessage(response))
  }

  return response.json() as Promise<Ingredient[]>
}

export async function createIngredient(
  request: IngredientCreateRequest,
): Promise<Ingredient> {
  const response = await fetch(`${API_BASE_URL}/ingredients`, {
    method: 'POST',
    headers: getJsonAuthHeaders(),
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    throw new Error(await getErrorMessage(response))
  }

  return response.json() as Promise<Ingredient>
}

export async function updateIngredient(
  ingredientId: number,
  request: IngredientUpdateRequest,
): Promise<Ingredient> {
  const response = await fetch(`${API_BASE_URL}/ingredients/${ingredientId}`, {
    method: 'PUT',
    headers: getJsonAuthHeaders(),
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    throw new Error(await getErrorMessage(response))
  }

  return response.json() as Promise<Ingredient>
}

export async function deleteIngredient(ingredientId: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/ingredients/${ingredientId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  })

  if (!response.ok) {
    throw new Error(await getErrorMessage(response))
  }
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

async function getErrorMessage(response: Response): Promise<string> {
  try {
    const error = (await response.json()) as ApiErrorResponse
    return error.detail || 'Request failed'
  } catch {
    return 'Request failed'
  }
}
