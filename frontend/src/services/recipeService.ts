import { API_BASE_URL } from '../api/config'
import type {
  ApiErrorResponse,
  Recipe,
  RecipeCreateRequest,
  RecipeUpdateRequest,
} from '../api/types'
import { tokenStorage } from '../utils/tokenStorage'

export async function listRecipes(): Promise<Recipe[]> {
  const response = await fetch(`${API_BASE_URL}/recipes`, {
    headers: getAuthHeaders(),
  })

  if (!response.ok) {
    throw new Error(await getErrorMessage(response))
  }

  return response.json() as Promise<Recipe[]>
}

export async function getRecipe(recipeId: number): Promise<Recipe> {
  const response = await fetch(`${API_BASE_URL}/recipes/${recipeId}`, {
    headers: getAuthHeaders(),
  })

  if (!response.ok) {
    throw new Error(await getErrorMessage(response))
  }

  return response.json() as Promise<Recipe>
}

export async function createRecipe(
  request: RecipeCreateRequest,
): Promise<Recipe> {
  const response = await fetch(`${API_BASE_URL}/recipes`, {
    method: 'POST',
    headers: getJsonAuthHeaders(),
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    throw new Error(await getErrorMessage(response))
  }

  return response.json() as Promise<Recipe>
}

export async function updateRecipe(
  recipeId: number,
  request: RecipeUpdateRequest,
): Promise<Recipe> {
  const response = await fetch(`${API_BASE_URL}/recipes/${recipeId}`, {
    method: 'PUT',
    headers: getJsonAuthHeaders(),
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    throw new Error(await getErrorMessage(response))
  }

  return response.json() as Promise<Recipe>
}

export async function deleteRecipe(recipeId: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/recipes/${recipeId}`, {
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
