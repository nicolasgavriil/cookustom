import { Link, useNavigate } from 'react-router'

import type { RecipeFormValues } from '../components/RecipeForm'
import { RecipeForm } from '../components/RecipeForm'
import { useIngredientsQuery } from '../queries/ingredientQueries'
import { useCreateRecipeMutation } from '../queries/recipeQueries'
import { toRecipeCreateRequest } from '../utils/recipeFormMappers'

export const NewRecipePage = () => {
  const navigate = useNavigate()
  const ingredientsQuery = useIngredientsQuery()
  const createRecipeMutation = useCreateRecipeMutation()
  const ingredients = ingredientsQuery.data ?? []
  const error =
    createRecipeMutation.error instanceof Error
      ? createRecipeMutation.error.message
      : null

  const handleSubmit = (values: RecipeFormValues) => {
    createRecipeMutation.reset()
    createRecipeMutation.mutate(toRecipeCreateRequest(values), {
      onSuccess: (recipe) => {
        navigate(`/recipes/${recipe.id}`)
      },
    })
  }

  return (
    <section className="mx-auto max-w-3xl">
      <Link className="font-bold text-gray-900 no-underline" to="/recipes">
        Back to recipes
      </Link>
      <p className="mt-8 mb-3 text-sm font-bold tracking-widest text-blue-600 uppercase">
        Recipes
      </p>
      <h1 className="m-0 text-4xl leading-none text-gray-900 sm:text-6xl">
        Add recipe
      </h1>
      <p className="mt-6 text-lg leading-8 text-gray-600">
        Build a recipe from your ingredient library and calculate calories per
        serving.
      </p>

      {ingredientsQuery.isPending ? (
        <p className="mt-8 text-gray-600">Loading ingredients...</p>
      ) : null}

      {ingredientsQuery.isError ? (
        <p className="mt-8 text-red-600">
          {ingredientsQuery.error instanceof Error
            ? ingredientsQuery.error.message
            : 'Unable to load ingredients'}
        </p>
      ) : null}

      {ingredientsQuery.isSuccess && ingredients.length === 0 ? (
        <p className="mt-8 text-gray-600">
          Add ingredients before creating recipes.
        </p>
      ) : null}

      {ingredients.length > 0 ? (
        <RecipeForm
          availableIngredients={ingredients}
          submitLabel="Create recipe"
          error={error}
          isSubmitting={createRecipeMutation.isPending}
          onSubmit={handleSubmit}
        />
      ) : null}
    </section>
  )
}
