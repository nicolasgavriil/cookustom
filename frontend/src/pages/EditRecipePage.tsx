import { Link, useNavigate, useParams } from 'react-router'

import type { RecipeFormValues } from '../components/RecipeForm'
import { RecipeForm } from '../components/RecipeForm'
import { useIngredientsQuery } from '../queries/ingredientQueries'
import {
  useRecipeQuery,
  useUpdateRecipeMutation,
} from '../queries/recipeQueries'
import {
  toRecipeFormValues,
  toRecipeUpdateRequest,
} from '../utils/recipeFormMappers'

export const EditRecipePage = () => {
  const navigate = useNavigate()
  const { recipeId } = useParams()
  const parsedRecipeId = Number(recipeId)
  const isValidRecipeId = Number.isInteger(parsedRecipeId) && parsedRecipeId > 0
  const recipeQuery = useRecipeQuery(parsedRecipeId, {
    enabled: isValidRecipeId,
  })
  const ingredientsQuery = useIngredientsQuery()
  const updateRecipeMutation = useUpdateRecipeMutation()
  const recipe = recipeQuery.data
  const ingredients = ingredientsQuery.data ?? []
  const error =
    updateRecipeMutation.error instanceof Error
      ? updateRecipeMutation.error.message
      : null

  const handleSubmit = (values: RecipeFormValues) => {
    if (!recipe) {
      return
    }

    updateRecipeMutation.reset()
    updateRecipeMutation.mutate(
      { recipeId: recipe.id, request: toRecipeUpdateRequest(values) },
      {
        onSuccess: (updatedRecipe) => {
          navigate(`/recipes/${updatedRecipe.id}`)
        },
      },
    )
  }

  return (
    <section className="mx-auto max-w-3xl">
      <Link className="font-bold text-gray-900 no-underline" to="/recipes">
        Back to recipes
      </Link>

      {!isValidRecipeId ? (
        <p className="mt-8 text-gray-600">Recipe not found.</p>
      ) : null}

      {recipeQuery.isPending && isValidRecipeId ? (
        <p className="mt-8 text-gray-600">Loading recipe...</p>
      ) : null}

      {recipeQuery.isError ? (
        <p className="mt-8 text-red-600">
          {recipeQuery.error instanceof Error
            ? recipeQuery.error.message
            : 'Unable to load recipe'}
        </p>
      ) : null}

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

      {recipe && ingredientsQuery.isSuccess ? (
        <>
          <p className="mt-8 mb-3 text-sm font-bold tracking-widest text-blue-600 uppercase">
            Recipes
          </p>
          <h1 className="m-0 text-4xl leading-none text-gray-900 sm:text-6xl">
            Edit recipe
          </h1>
          <RecipeForm
            availableIngredients={ingredients}
            defaultValues={toRecipeFormValues(recipe)}
            key={recipe.id}
            submitLabel="Save recipe"
            error={error}
            isSubmitting={updateRecipeMutation.isPending}
            onSubmit={handleSubmit}
          />
        </>
      ) : null}
    </section>
  )
}
