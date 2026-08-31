import { authenticatedApiRequest } from '../api/fetchApi'
import type {
  Ingredient,
  IngredientCreateRequest,
  IngredientUpdateRequest,
} from '../api/types'

const jsonHeaders = {
  'Content-Type': 'application/json',
}

export async function listIngredients(): Promise<Ingredient[]> {
  return authenticatedApiRequest<Ingredient[]>('/ingredients')
}

export async function createIngredient(
  request: IngredientCreateRequest,
): Promise<Ingredient> {
  return authenticatedApiRequest<Ingredient>('/ingredients', {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify(request),
  })
}

export async function updateIngredient(
  ingredientId: number,
  request: IngredientUpdateRequest,
): Promise<Ingredient> {
  return authenticatedApiRequest<Ingredient>(`/ingredients/${ingredientId}`, {
    method: 'PUT',
    headers: jsonHeaders,
    body: JSON.stringify(request),
  })
}

export async function deleteIngredient(ingredientId: number): Promise<void> {
  await authenticatedApiRequest<void>(`/ingredients/${ingredientId}`, {
    method: 'DELETE',
  })
}
