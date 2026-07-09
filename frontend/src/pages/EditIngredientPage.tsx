import { ArrowLeft, Carrot } from 'lucide-react'
import { useNavigate, useParams } from 'react-router'

import type { IngredientFormValues } from '../components/IngredientForm'
import { IngredientForm } from '../components/IngredientForm'
import { ButtonLink } from '../components/ui/Button'
import { PageHeader } from '../components/ui/PageHeader'
import { StatusMessage } from '../components/ui/StatusMessage'
import {
  useIngredientsQuery,
  useUpdateIngredientMutation,
} from '../queries/ingredientQueries'
import {
  toIngredientFormValues,
  toIngredientUpdateRequest,
} from '../utils/ingredientFormMappers'

export const EditIngredientPage = () => {
  const navigate = useNavigate()
  const { ingredientId } = useParams()
  const ingredientsQuery = useIngredientsQuery()
  const updateIngredientMutation = useUpdateIngredientMutation()
  const numericIngredientId = Number(ingredientId)
  const ingredient = ingredientsQuery.data?.find(
    (item) => item.id === numericIngredientId,
  )
  const error =
    updateIngredientMutation.error instanceof Error
      ? updateIngredientMutation.error.message
      : null

  const handleSubmit = (values: IngredientFormValues) => {
    if (!ingredient) {
      return
    }

    updateIngredientMutation.reset()
    updateIngredientMutation.mutate(
      { ingredientId: ingredient.id, request: toIngredientUpdateRequest(values) },
      {
        onSuccess: () => {
          navigate('/ingredients')
        },
      },
    )
  }

  return (
    <section className="max-w-2xl">
      <ButtonLink
        icon={<ArrowLeft className="size-4" aria-hidden="true" />}
        variant="ghost"
        to="/ingredients"
      >
        Back to ingredients
      </ButtonLink>
      <div className="mt-6">
        <PageHeader
          eyebrow="Ingredients"
          title="Edit ingredient"
          icon={<Carrot className="size-6" aria-hidden="true" />}
        />
      </div>

      {ingredientsQuery.isPending ? (
        <StatusMessage loading>Loading ingredient...</StatusMessage>
      ) : null}

      {ingredientsQuery.isError ? (
        <StatusMessage tone="danger">
          {ingredientsQuery.error instanceof Error
            ? ingredientsQuery.error.message
            : 'Unable to load ingredient'}
        </StatusMessage>
      ) : null}

      {ingredientsQuery.isSuccess && !ingredient ? (
        <StatusMessage>Ingredient not found.</StatusMessage>
      ) : null}

      {ingredient ? (
        <IngredientForm
          defaultValues={toIngredientFormValues(ingredient)}
          submitLabel="Save ingredient"
          error={error}
          isSubmitting={updateIngredientMutation.isPending}
          onSubmit={handleSubmit}
        />
      ) : null}
    </section>
  )
}
