import type {
  Ingredient,
  IngredientCreateRequest,
  IngredientUpdateRequest,
} from '../api/types'
import type { IngredientFormValues } from '../components/IngredientForm'

export const toIngredientFormValues = (
  ingredient: Ingredient,
): IngredientFormValues => {
  return {
    name: ingredient.name,
    unit: ingredient.unit,
    calories_per_unit: ingredient.calories_per_unit,
  }
}

export const toIngredientCreateRequest = (
  values: IngredientFormValues,
): IngredientCreateRequest => {
  return {
    name: values.name,
    unit: values.unit,
    calories_per_unit: values.calories_per_unit,
  }
}

export const toIngredientUpdateRequest = (
  values: IngredientFormValues,
): IngredientUpdateRequest => {
  return {
    name: values.name,
    unit: values.unit,
    calories_per_unit: values.calories_per_unit,
  }
}
