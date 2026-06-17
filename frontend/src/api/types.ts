export type User = {
  id: number
  email: string
  created_at: string
}

export type UserCreateRequest = {
  email: string
  password: string
}

export type LoginRequest = {
  email: string
  password: string
}

export type TokenResponse = {
  access_token: string
  token_type: 'bearer'
}

export type IngredientUnit = 'g' | 'ml' | 'piece'

export type Ingredient = {
  id: number
  user_id: number
  name: string
  unit: IngredientUnit
  calories_per_unit: string
  created_at: string
}

export type IngredientCreateRequest = {
  name: string
  unit: IngredientUnit
  calories_per_unit: string
}

export type IngredientUpdateRequest = {
  name: string
  unit: IngredientUnit
  calories_per_unit: string
}

export type ApiErrorResponse = {
  detail: string
}
