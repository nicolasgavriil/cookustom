import { ArrowLeft, BookOpen, Pencil, Trash2 } from 'lucide-react'
import { useNavigate, useParams } from 'react-router'

import type { Recipe } from '../api/types'
import { Button, ButtonLink } from '../components/ui/Button'
import { PageHeader } from '../components/ui/PageHeader'
import { StatusMessage } from '../components/ui/StatusMessage'
import {
  useDeleteRecipeMutation,
  useRecipeQuery,
} from '../queries/recipeQueries'

export const RecipeDetailPage = () => {
  const navigate = useNavigate()
  const { recipeId } = useParams()
  const parsedRecipeId = Number(recipeId)
  const isValidRecipeId = Number.isInteger(parsedRecipeId) && parsedRecipeId > 0
  const recipeQuery = useRecipeQuery(parsedRecipeId, {
    enabled: isValidRecipeId,
  })
  const deleteRecipeMutation = useDeleteRecipeMutation()
  const recipe = recipeQuery.data

  const handleDelete = (recipeToDelete: Recipe) => {
    const shouldDelete = window.confirm(
      `Delete ${recipeToDelete.title}? This cannot be undone.`,
    )

    if (!shouldDelete) {
      return
    }

    deleteRecipeMutation.reset()
    deleteRecipeMutation.mutate(recipeToDelete.id, {
      onSuccess: () => {
        navigate('/recipes')
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

      {deleteRecipeMutation.isError ? (
        <StatusMessage tone="danger">
          {deleteRecipeMutation.error instanceof Error
            ? deleteRecipeMutation.error.message
            : 'Unable to delete recipe'}
        </StatusMessage>
      ) : null}

      {recipe ? (
        <>
          <div className="mt-6">
            <PageHeader
              eyebrow="Recipe"
              title={recipe.title}
              description={recipe.description ?? undefined}
              icon={<BookOpen className="size-6" aria-hidden="true" />}
              actions={
                <>
                  <ButtonLink
                    icon={<Pencil className="size-4" aria-hidden="true" />}
                    variant="secondary"
                    to={`/recipes/${recipe.id}/edit`}
                  >
                    Edit
                  </ButtonLink>
                  <Button
                    icon={<Trash2 className="size-4" aria-hidden="true" />}
                    variant="danger"
                    type="button"
                    disabled={deleteRecipeMutation.isPending}
                    onClick={() => handleDelete(recipe)}
                  >
                    {deleteRecipeMutation.isPending ? 'Deleting...' : 'Delete'}
                  </Button>
                </>
              }
            />
          </div>

          <dl className="mt-8 grid overflow-hidden rounded-lg border border-stone-200 bg-white/85 shadow-sm sm:grid-cols-4">
            <div className="border-b border-stone-200 p-5 sm:border-r sm:border-b-0">
              <dt className="text-xs font-bold tracking-wider text-stone-500 uppercase">
                Per serving
              </dt>
              <dd className="m-0 mt-2 text-2xl font-bold text-stone-950">
                {recipe.calories_per_serving} kcal
              </dd>
            </div>
            <div className="border-b border-stone-200 p-5 sm:border-r sm:border-b-0">
              <dt className="text-xs font-bold tracking-wider text-stone-500 uppercase">
                Total calories
              </dt>
              <dd className="m-0 mt-2 text-2xl font-bold text-stone-950">
                {recipe.total_calories} kcal
              </dd>
            </div>
            <div className="border-b border-stone-200 p-5 sm:border-r sm:border-b-0">
              <dt className="text-xs font-bold tracking-wider text-stone-500 uppercase">
                Base servings
              </dt>
              <dd className="m-0 mt-2 text-2xl font-bold text-stone-950">
                {recipe.base_servings}
              </dd>
            </div>
            <div className="p-5">
              <dt className="text-xs font-bold tracking-wider text-stone-500 uppercase">
                Ingredients
              </dt>
              <dd className="m-0 mt-2 text-2xl font-bold text-stone-950">
                {recipe.ingredient_count}
              </dd>
            </div>
          </dl>

          <section className="mt-10">
            <h2 className="m-0 text-xl font-bold text-stone-950">
              Ingredients
            </h2>
            <div className="mt-4 overflow-x-auto rounded-lg border border-stone-200 bg-white/85 shadow-sm">
              <table className="w-full min-w-[42rem] border-collapse text-left">
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-100/80 text-xs font-bold tracking-wider text-stone-600 uppercase">
                    <th className="py-3 pr-4 pl-3 font-semibold">Name</th>
                    <th className="py-3 pr-4 text-right font-semibold">
                      Quantity
                    </th>
                    <th className="py-3 pr-4 text-right font-semibold">
                      Calories
                    </th>
                    <th className="py-3 pr-3 text-right font-semibold">
                      Per unit
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recipe.ingredients.map((ingredient) => (
                    <tr
                      className="border-b border-stone-100 text-sm text-stone-900 last:border-b-0"
                      key={ingredient.ingredient_id}
                    >
                      <td className="py-4 pr-4 pl-3 font-medium">
                        {ingredient.ingredient_name}
                      </td>
                      <td className="py-4 pr-4 text-right whitespace-nowrap">
                        {ingredient.quantity} {ingredient.unit}
                      </td>
                      <td className="py-4 pr-4 text-right whitespace-nowrap">
                        {ingredient.calories} kcal
                      </td>
                      <td className="py-4 pr-3 text-right whitespace-nowrap">
                        {ingredient.calories_per_unit} kcal
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-10">
            <h2 className="m-0 text-xl font-bold text-stone-950">
              Instructions
            </h2>
            <p className="mt-4 max-w-3xl whitespace-pre-wrap rounded-lg border border-stone-200 bg-white/85 p-5 leading-7 text-stone-700 shadow-sm">
              {recipe.instructions}
            </p>
          </section>
        </>
      ) : null}
    </section>
  )
}
