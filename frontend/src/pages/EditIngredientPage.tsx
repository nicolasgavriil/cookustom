import { Link, useNavigate, useParams } from 'react-router'

import type { IngredientFormValues } from '../components/IngredientForm'
import { IngredientForm } from '../components/IngredientForm'
import {
  useIngredientsQuery,
  useUpdateIngredientMutation,
} from '../queries/ingredientQueries'

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
      { ingredientId: ingredient.id, request: values },
      {
        onSuccess: () => {
          navigate('/ingredients')
        },
      },
    )
  }

  return (
    <section className="mx-auto max-w-2xl">
      <Link className="font-bold text-gray-900 no-underline" to="/ingredients">
        Back to ingredients
      </Link>
      <p className="mt-8 mb-3 text-sm font-bold tracking-widest text-blue-600 uppercase">
        Ingredients
      </p>
      <h1 className="m-0 text-4xl leading-none text-gray-900 sm:text-6xl">
        Edit ingredient
      </h1>

      {ingredientsQuery.isPending ? (
        <p className="mt-8 text-gray-600">Loading ingredient...</p>
      ) : null}

      {ingredientsQuery.isError ? (
        <p className="mt-8 text-red-600">
          {ingredientsQuery.error instanceof Error
            ? ingredientsQuery.error.message
            : 'Unable to load ingredient'}
        </p>
      ) : null}

      {ingredientsQuery.isSuccess && !ingredient ? (
        <p className="mt-8 text-gray-600">Ingredient not found.</p>
      ) : null}

      {ingredient ? (
        <IngredientForm
          defaultValues={{
            name: ingredient.name,
            unit: ingredient.unit,
            calories_per_unit: ingredient.calories_per_unit,
          }}
          submitLabel="Save ingredient"
          error={error}
          isSubmitting={updateIngredientMutation.isPending}
          onSubmit={handleSubmit}
        />
      ) : null}
    </section>
  )
}
