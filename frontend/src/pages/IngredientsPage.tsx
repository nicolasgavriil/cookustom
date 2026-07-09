import { Carrot, Plus } from 'lucide-react'
import { Link } from 'react-router'

import {
  useDeleteIngredientMutation,
  useIngredientsQuery,
} from '../queries/ingredientQueries'
import { ButtonLink } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { PageHeader } from '../components/ui/PageHeader'
import { StatusMessage } from '../components/ui/StatusMessage'

export const IngredientsPage = () => {
  const ingredientsQuery = useIngredientsQuery()
  const deleteIngredientMutation = useDeleteIngredientMutation()
  const ingredients = ingredientsQuery.data ?? []
  const deletingIngredientId = deleteIngredientMutation.variables ?? null
  const ingredientCountLabel =
    ingredients.length === 1 ? '1 ingredient' : `${ingredients.length} ingredients`

  const handleDelete = (ingredientId: number, ingredientName: string) => {
    const shouldDelete = window.confirm(
      `Delete ${ingredientName}? This cannot be undone.`,
    )

    if (!shouldDelete) {
      return
    }

    deleteIngredientMutation.reset()
    deleteIngredientMutation.mutate(ingredientId)
  }

  return (
    <section>
      <PageHeader
        eyebrow="Ingredients"
        title="Ingredient library"
        description={
          ingredients.length > 0
            ? ingredientCountLabel
            : 'Collect reusable ingredients before building recipes.'
        }
        icon={<Carrot className="size-6" aria-hidden="true" />}
        actions={
          <ButtonLink
            icon={<Plus className="size-4" aria-hidden="true" />}
            to="/ingredients/new"
          >
            Add ingredient
          </ButtonLink>
        }
      />

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

      {deleteIngredientMutation.isError ? (
        <StatusMessage tone="danger">
          {deleteIngredientMutation.error instanceof Error
            ? deleteIngredientMutation.error.message
            : 'Unable to delete ingredient'}
        </StatusMessage>
      ) : null}

      {ingredientsQuery.isSuccess && ingredients.length === 0 ? (
        <EmptyState
          icon={<Carrot className="size-6" aria-hidden="true" />}
          title="No ingredients yet"
          description="Add ingredients with calories per gram, milliliter, or piece."
          action={
            <ButtonLink
              icon={<Plus className="size-4" aria-hidden="true" />}
              to="/ingredients/new"
            >
              Add ingredient
            </ButtonLink>
          }
        />
      ) : null}

      {ingredients.length > 0 ? (
        <div className="mt-8 overflow-x-auto rounded-lg border border-stone-200 bg-white/85 shadow-sm">
          <table className="w-full min-w-[38rem] border-collapse text-left">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-100/80 text-xs font-bold tracking-wider text-stone-600 uppercase">
                <th className="py-3 pr-4 pl-3 font-semibold">Name</th>
                <th className="py-3 pr-4 text-right font-semibold">Unit</th>
                <th className="py-3 pr-4 text-right font-semibold">
                  Calories per unit
                </th>
                <th className="py-3 pr-3 text-right font-semibold">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {ingredients.map((ingredient) => (
                <tr
                  className="border-b border-stone-100 text-sm text-stone-900 last:border-b-0"
                  key={ingredient.id}
                >
                  <td className="py-4 pr-4 pl-3 font-medium">
                    {ingredient.name}
                  </td>
                  <td className="py-4 pr-4 text-right">{ingredient.unit}</td>
                  <td className="py-4 pr-4 text-right">
                    {ingredient.calories_per_unit}
                  </td>
                  <td className="py-4 pr-3">
                    <div className="flex justify-end gap-4">
                      <Link
                        className="font-bold text-stone-900 no-underline hover:text-emerald-800"
                        to={`/ingredients/${ingredient.id}/edit`}
                      >
                        Edit
                      </Link>
                      <button
                        className="cursor-pointer border-0 bg-transparent p-0 font-bold text-rose-700 disabled:cursor-not-allowed disabled:text-rose-300"
                        type="button"
                        disabled={
                          deleteIngredientMutation.isPending &&
                          deletingIngredientId === ingredient.id
                        }
                        onClick={() =>
                          handleDelete(ingredient.id, ingredient.name)
                        }
                      >
                        {deleteIngredientMutation.isPending &&
                        deletingIngredientId === ingredient.id
                          ? 'Deleting...'
                          : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  )
}
