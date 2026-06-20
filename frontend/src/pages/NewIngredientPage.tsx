import { Link, useNavigate } from 'react-router'

import type { IngredientFormValues } from '../components/IngredientForm'
import { IngredientForm } from '../components/IngredientForm'
import { useCreateIngredientMutation } from '../queries/ingredientQueries'

export const NewIngredientPage = () => {
  const navigate = useNavigate()
  const createIngredientMutation = useCreateIngredientMutation()
  const error =
    createIngredientMutation.error instanceof Error
      ? createIngredientMutation.error.message
      : null

  const handleSubmit = (values: IngredientFormValues) => {
    createIngredientMutation.reset()
    createIngredientMutation.mutate(values, {
      onSuccess: () => {
        navigate('/ingredients')
      },
    })
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
        Add ingredient
      </h1>
      <p className="mt-6 text-lg leading-8 text-gray-600">
        Add a reusable ingredient with calories per gram, milliliter, or piece.
      </p>
      <IngredientForm
        submitLabel="Create ingredient"
        error={error}
        isSubmitting={createIngredientMutation.isPending}
        onSubmit={handleSubmit}
      />
    </section>
  )
}
