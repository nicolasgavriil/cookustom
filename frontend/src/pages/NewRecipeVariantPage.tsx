import { ArrowLeft, CopyPlus } from 'lucide-react'
import { useNavigate, useParams } from 'react-router'

import type { RecipeFormValues } from '../components/RecipeForm'
import { RecipeForm } from '../components/RecipeForm'
import { ButtonLink } from '../components/ui/Button'
import { PageHeader } from '../components/ui/PageHeader'
import { StatusMessage } from '../components/ui/StatusMessage'
import { useIngredientsQuery } from '../queries/ingredientQueries'
import {
  useCreateRecipeVariantMutation,
  useRecipeQuery,
} from '../queries/recipeQueries'
import {
  toRecipeCreateRequest,
  toRecipeFormValues,
} from '../utils/recipeFormMappers'

export const NewRecipeVariantPage = () => {
  const navigate = useNavigate()
  const { recipeId } = useParams()
  const parsedRecipeId = Number(recipeId)
  const isValidRecipeId = Number.isInteger(parsedRecipeId) && parsedRecipeId > 0
  const recipeQuery = useRecipeQuery(parsedRecipeId, {
    enabled: isValidRecipeId,
  })
  const ingredientsQuery = useIngredientsQuery()
  const createVariantMutation = useCreateRecipeVariantMutation()
  const recipe = recipeQuery.data
  const ingredients = ingredientsQuery.data ?? []
  const error =
    createVariantMutation.error instanceof Error
      ? createVariantMutation.error.message
      : null

  const handleSubmit = (values: RecipeFormValues) => {
    if (!recipe) {
      return
    }

    createVariantMutation.reset()
    createVariantMutation.mutate(
      {
        sourceRecipeId: recipe.id,
        request: toRecipeCreateRequest(values),
      },
      {
        onSuccess: (createdRecipe) => {
          navigate(`/recipes/${createdRecipe.id}`)
        },
      },
    )
  }

  return (
    <section>
      <ButtonLink
        icon={<ArrowLeft className="size-4" aria-hidden="true" />}
        variant="ghost"
        to={recipe ? `/recipes/${recipe.id}` : '/recipes'}
      >
        Back to recipe
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
              title="Create variant"
              description={`Start from ${recipe.title}, then adjust the recipe before saving it as a variant.`}
              icon={<CopyPlus className="size-6" aria-hidden="true" />}
            />
          </div>
          <RecipeForm
            availableIngredients={ingredients}
            defaultValues={toRecipeFormValues(recipe)}
            key={recipe.id}
            submitLabel="Create variant"
            error={error}
            isSubmitting={createVariantMutation.isPending}
            onSubmit={handleSubmit}
          />
        </>
      ) : null}
    </section>
  )
}
