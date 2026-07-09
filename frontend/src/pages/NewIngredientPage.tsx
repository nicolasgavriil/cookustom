import { ArrowLeft, Carrot } from 'lucide-react'
import { useNavigate } from 'react-router'

import type { IngredientFormValues } from '../components/IngredientForm'
import { IngredientForm } from '../components/IngredientForm'
import { ButtonLink } from '../components/ui/Button'
import { PageHeader } from '../components/ui/PageHeader'
import { useCreateIngredientMutation } from '../queries/ingredientQueries'
import { toIngredientCreateRequest } from '../utils/ingredientFormMappers'

export const NewIngredientPage = () => {
  const navigate = useNavigate()
  const createIngredientMutation = useCreateIngredientMutation()
  const error =
    createIngredientMutation.error instanceof Error
      ? createIngredientMutation.error.message
      : null

  const handleSubmit = (values: IngredientFormValues) => {
    createIngredientMutation.reset()
    createIngredientMutation.mutate(toIngredientCreateRequest(values), {
      onSuccess: () => {
        navigate('/ingredients')
      },
    })
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
          title="Add ingredient"
          description="Add a reusable ingredient with calories per gram, milliliter, or piece."
          icon={<Carrot className="size-6" aria-hidden="true" />}
        />
      </div>
      <IngredientForm
        submitLabel="Create ingredient"
        error={error}
        isSubmitting={createIngredientMutation.isPending}
        onSubmit={handleSubmit}
      />
    </section>
  )
}
