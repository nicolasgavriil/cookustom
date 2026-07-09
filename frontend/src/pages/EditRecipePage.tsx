import { ArrowLeft, BookOpen } from 'lucide-react'
import { useNavigate, useParams } from 'react-router'

import type { RecipeFormValues } from '../components/RecipeForm'
import { RecipeForm } from '../components/RecipeForm'
import { ButtonLink } from '../components/ui/Button'
import { PageHeader } from '../components/ui/PageHeader'
import { StatusMessage } from '../components/ui/StatusMessage'
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
    <section>
      <ButtonLink
        icon={<ArrowLeft className="size-4" aria-hidden="true" />}
        variant="ghost"
        to="/recipes"
      >
        Back to recipes
      </ButtonLink>

      {!isValidRecipeId ? (
        <StatusMessage>Recipe not found.</StatusMessage>
      ) : null}

      {recipeQuery.isPending && isValidRecipeId ? (
        <StatusMessage loading>Loading recipe...</StatusMessage>
      ) : null}

      {recipeQuery.isError ? (
        <StatusMessage tone="danger">
          {recipeQuery.error instanceof Error
            ? recipeQuery.error.message
            : 'Unable to load recipe'}
        </StatusMessage>
      ) : null}

      {ingredientsQuery.isPending ? (
        <StatusMessage loading>Loading ingredients...</StatusMessage>
      ) : null}

      {ingredientsQuery.isError ? (
        <StatusMessage tone="danger">
          {ingredientsQuery.error instanceof Error
            ? ingredientsQuery.error.message
            : 'Unable to load ingredients'}
        </StatusMessage>
      ) : null}

      {recipe && ingredientsQuery.isSuccess ? (
        <>
          <div className="mt-6 max-w-4xl">
            <PageHeader
              eyebrow="Recipes"
              title="Edit recipe"
              icon={<BookOpen className="size-6" aria-hidden="true" />}
            />
          </div>
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
