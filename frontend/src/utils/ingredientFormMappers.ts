import type {
  Ingredient,
  IngredientCreateRequest,
  IngredientUpdateRequest,
} from '../api/types'
import type { IngredientFormValues } from '../components/IngredientForm'

export const calculateCaloriesPerUnit = (
  labelQuantity: string,
  labelCalories: string,
): string => (Number(labelCalories) / Number(labelQuantity)).toFixed(4)

export const toIngredientFormValues = (
  ingredient: Ingredient,
): IngredientFormValues => {
  return {
    name: ingredient.name,
    unit: ingredient.unit,
    labelQuantity: '1',
    labelCalories: ingredient.calories_per_unit,
  }
}

export const toIngredientCreateRequest = (
  values: IngredientFormValues,
): IngredientCreateRequest => {
  return {
    name: values.name,
    unit: values.unit,
    calories_per_unit: calculateCaloriesPerUnit(
      values.labelQuantity,
      values.labelCalories,
    ),
  }
}

export const toIngredientUpdateRequest = (
  values: IngredientFormValues,
): IngredientUpdateRequest => {
  return {
    name: values.name,
    unit: values.unit,
    calories_per_unit: calculateCaloriesPerUnit(
      values.labelQuantity,
      values.labelCalories,
    ),
  }
}
