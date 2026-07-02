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

export type RecipeIngredient = {
  ingredient_id: number
  ingredient_name: string
  unit: IngredientUnit
  quantity: string
  calories_per_unit: string
  calories: number
}

export type Recipe = {
  id: number
  parent_recipe_id: number | null
  title: string
  description: string | null
  base_servings: number
  instructions: string
  created_at: string
  ingredients: RecipeIngredient[]
  total_calories: number
  calories_per_serving: number
}

export type RecipeIngredientRequest = {
  ingredient_id: number
  quantity: string
}

export type RecipeCreateRequest = {
  title: string
  description: string | null
  base_servings: number
  instructions: string
  ingredients: RecipeIngredientRequest[]
}

export type RecipeUpdateRequest = RecipeCreateRequest

export type ApiErrorResponse = {
  detail: string
}
