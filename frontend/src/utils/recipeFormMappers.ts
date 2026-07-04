import type {
  Recipe,
  RecipeCreateRequest,
  RecipeUpdateRequest,
} from '../api/types'
import type { RecipeFormValues } from '../components/RecipeForm'

export const toRecipeFormValues = (recipe: Recipe): RecipeFormValues => {
  return {
    title: recipe.title,
    description: recipe.description ?? '',
    base_servings: recipe.base_servings,
    instructions: recipe.instructions,
    ingredients: recipe.ingredients.map((ingredient) => ({
      ingredient_id: ingredient.ingredient_id,
      quantity: ingredient.quantity,
    })),
  }
}

export const toRecipeCreateRequest = (
  values: RecipeFormValues,
): RecipeCreateRequest => {
  return {
    title: values.title.trim(),
    description: values.description.trim() || null,
    base_servings: values.base_servings,
    instructions: values.instructions.trim(),
    ingredients: values.ingredients.map((ingredient) => ({
      ingredient_id: ingredient.ingredient_id,
      quantity: ingredient.quantity,
    })),
  }
}

export const toRecipeUpdateRequest = (
  values: RecipeFormValues,
): RecipeUpdateRequest => {
  return {
    title: values.title.trim(),
    description: values.description.trim() || null,
    base_servings: values.base_servings,
    instructions: values.instructions.trim(),
    ingredients: values.ingredients.map((ingredient) => ({
      ingredient_id: ingredient.ingredient_id,
      quantity: ingredient.quantity,
    })),
  }
}
