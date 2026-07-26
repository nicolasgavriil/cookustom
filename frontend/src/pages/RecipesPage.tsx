import { BookOpen, Plus } from 'lucide-react'
import { Link } from 'react-router'

import {
  useDeleteRecipeMutation,
  useRecipesQuery,
} from '../queries/recipeQueries'
import { RecipeVariantBadge } from '../components/RecipeVariantBadge'
import { ButtonLink } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { PageHeader } from '../components/ui/PageHeader'
import { StatusMessage } from '../components/ui/StatusMessage'

export const RecipesPage = () => {
  const recipesQuery = useRecipesQuery()
  const deleteRecipeMutation = useDeleteRecipeMutation()
  const recipes = recipesQuery.data ?? []
  const deletingRecipeId = deleteRecipeMutation.variables ?? null
  const recipeCountLabel =
    recipes.length === 1 ? '1 recipe' : `${recipes.length} recipes`

  const handleDelete = (recipeId: number, recipeTitle: string) => {
    const shouldDelete = window.confirm(
      `Delete ${recipeTitle}? This cannot be undone.`,
    )

    if (!shouldDelete) {
      return
    }

    deleteRecipeMutation.reset()
    deleteRecipeMutation.mutate(recipeId)
  }

  return (
    <section>
      <PageHeader
        eyebrow="Recipes"
        title="Recipe collection"
        description={
          recipes.length > 0
            ? recipeCountLabel
            : 'Build a personal library of meals you cook and want to revisit.'
        }
        icon={<BookOpen className="size-6" aria-hidden="true" />}
        actions={
          <ButtonLink
            icon={<Plus className="size-4" aria-hidden="true" />}
            to="/recipes/new"
          >
            Add recipe
          </ButtonLink>
        }
      />

      {recipesQuery.isPending ? (
        <StatusMessage loading>Loading recipes...</StatusMessage>
      ) : null}

      {recipesQuery.isError ? (
        <StatusMessage tone="danger">
          {recipesQuery.error instanceof Error
            ? recipesQuery.error.message
            : 'Unable to load recipes'}
        </StatusMessage>
      ) : null}

      {deleteRecipeMutation.isError ? (
        <StatusMessage tone="danger">
          {deleteRecipeMutation.error instanceof Error
            ? deleteRecipeMutation.error.message
            : 'Unable to delete recipe'}
        </StatusMessage>
      ) : null}

      {recipesQuery.isSuccess && recipes.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="size-6" aria-hidden="true" />}
          title="No recipes yet"
          description="Add recipes after setting up your ingredient library."
          action={
            <ButtonLink
              icon={<Plus className="size-4" aria-hidden="true" />}
              to="/recipes/new"
            >
              Add recipe
            </ButtonLink>
          }
        />
      ) : null}

      {recipes.length > 0 ? (
        <div className="mt-8 overflow-x-auto rounded-lg border border-stone-200 bg-white/85 shadow-sm">
          <table className="w-full min-w-[48rem] border-collapse text-left">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-100/80 text-xs font-bold tracking-wider text-stone-600 uppercase">
                <th className="py-3 pr-4 pl-3 font-semibold">Recipe</th>
                <th className="py-3 pr-4 text-right font-semibold">
                  Per serving
                </th>
                <th className="py-3 pr-4 text-right font-semibold">
                  Total
                </th>
                <th className="py-3 pr-4 text-right font-semibold">
                  Servings
                </th>
                <th className="py-3 pr-4 text-right font-semibold">
                  Ingredients
                </th>
                <th className="py-3 pr-3 text-right font-semibold">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {recipes.map((recipe) => (
                <tr
                  className="border-b border-stone-100 text-sm text-stone-900 last:border-b-0"
                  key={recipe.id}
                >
                  <td className="max-w-xs py-4 pr-4 pl-3 align-top">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        className="font-bold text-stone-950 no-underline hover:text-emerald-800"
                        to={`/recipes/${recipe.id}`}
                      >
                        {recipe.title}
                      </Link>
                      <RecipeVariantBadge
                        parentRecipeId={recipe.parent_recipe_id}
                      />
                    </div>
                    {recipe.description ? (
                      <p className="m-0 mt-1 line-clamp-2 text-stone-600">
                        {recipe.description}
                      </p>
                    ) : null}
                  </td>
                  <td className="py-4 pr-4 text-right align-top font-medium whitespace-nowrap">
                    {recipe.calories_per_serving} kcal
                  </td>
                  <td className="py-4 pr-4 text-right align-top whitespace-nowrap">
                    {recipe.total_calories} kcal
                  </td>
                  <td className="py-4 pr-4 text-right align-top">
                    {recipe.base_servings}
                  </td>
                  <td className="py-4 pr-4 text-right align-top">
                    {recipe.ingredient_count}
                  </td>
                  <td className="py-4 pr-3 align-top">
                    <div className="flex justify-end gap-4">
                      <Link
                        className="font-bold text-stone-900 no-underline hover:text-emerald-800"
                        to={`/recipes/${recipe.id}/edit`}
                      >
                        Edit
                      </Link>
                      <button
                        className="cursor-pointer border-0 bg-transparent p-0 font-bold text-rose-700 disabled:cursor-not-allowed disabled:text-rose-300"
                        type="button"
                        disabled={
                          deleteRecipeMutation.isPending &&
                          deletingRecipeId === recipe.id
                        }
                        onClick={() => handleDelete(recipe.id, recipe.title)}
                      >
                        {deleteRecipeMutation.isPending &&
                        deletingRecipeId === recipe.id
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
