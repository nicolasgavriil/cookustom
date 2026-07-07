// Frontend-facing facade over generated OpenAPI types.
// App code should import from this file instead of importing generated files directly.
import type {
  IngredientResponse,
  RecipeIngredientCreateRequest,
  RecipeIngredientResponse,
  RecipeResponse,
  TokenResponse as GeneratedTokenResponse,
  UserResponse,
} from './generated'

export type {
  IngredientCreateRequest,
  IngredientUpdateRequest,
  LoginRequest,
  RecipeCreateRequest,
  RecipeUpdateRequest,
  UserCreateRequest,
} from './generated'

export type User = UserResponse

export type TokenResponse = GeneratedTokenResponse

export type IngredientUnit = IngredientResponse['unit']

export type Ingredient = IngredientResponse

export type RecipeIngredient = RecipeIngredientResponse

export type Recipe = RecipeResponse

export type RecipeIngredientRequest = RecipeIngredientCreateRequest
