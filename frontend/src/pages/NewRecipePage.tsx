import { ArrowLeft, BookOpen } from 'lucide-react'
import { useNavigate } from 'react-router'

import type { RecipeFormValues } from '../components/RecipeForm'
import { RecipeForm } from '../components/RecipeForm'
import { ButtonLink } from '../components/ui/Button'
import { PageHeader } from '../components/ui/PageHeader'
import { StatusMessage } from '../components/ui/StatusMessage'
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
    <section>
      <ButtonLink
        icon={<ArrowLeft className="size-4" aria-hidden="true" />}
        variant="ghost"
        to="/recipes"
      >
        Back to recipes
      </ButtonLink>
      <div className="mt-6 max-w-4xl">
        <PageHeader
          eyebrow="Recipes"
          title="Add recipe"
          description="Build a recipe from your ingredient library and calculate calories per serving."
          icon={<BookOpen className="size-6" aria-hidden="true" />}
        />
      </div>

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

      {ingredientsQuery.isSuccess && ingredients.length === 0 ? (
        <StatusMessage>Add ingredients before creating recipes.</StatusMessage>
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
