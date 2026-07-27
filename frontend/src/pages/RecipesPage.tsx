import { Fragment, useState } from 'react'
import { BookOpen, ChevronDown, ChevronRight, Plus } from 'lucide-react'
import { Link } from 'react-router'

import type { RecipeSummary } from '../api/types'
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
  const [expandedRecipeIds, setExpandedRecipeIds] = useState<Set<number>>(
    () => new Set(),
  )
  const recipesQuery = useRecipesQuery()
  const deleteRecipeMutation = useDeleteRecipeMutation()
  const recipes = recipesQuery.data ?? []
  const { rootRecipes, variantsByParentId } = groupRecipesByVariantParent(
    recipes,
  )
  const variantCount = countGroupedVariants(variantsByParentId)
  const recipeCountLabel = formatRecipeCollectionCount(
    rootRecipes.length,
    variantCount,
  )
  const deletingRecipeId = deleteRecipeMutation.variables ?? null

  const toggleRecipeVariants = (recipeId: number) => {
    setExpandedRecipeIds((currentRecipeIds) => {
      const nextRecipeIds = new Set(currentRecipeIds)

      if (nextRecipeIds.has(recipeId)) {
        nextRecipeIds.delete(recipeId)
      } else {
        nextRecipeIds.add(recipeId)
      }

      return nextRecipeIds
    })
  }

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
              {rootRecipes.map((recipe) => {
                const variants = variantsByParentId.get(recipe.id) ?? []
                const isExpanded = expandedRecipeIds.has(recipe.id)

                return (
                  <Fragment key={recipe.id}>
                    <RecipeTableRow
                      deletingRecipeId={deletingRecipeId}
                      isDeleting={deleteRecipeMutation.isPending}
                      recipe={recipe}
                      variants={variants}
                      variantsExpanded={isExpanded}
                      onDelete={handleDelete}
                      onToggleVariants={toggleRecipeVariants}
                    />

                    {isExpanded
                      ? variants.map((variant) => (
                          <RecipeTableRow
                            deletingRecipeId={deletingRecipeId}
                            isDeleting={deleteRecipeMutation.isPending}
                            isVariantRow
                            key={variant.id}
                            recipe={variant}
                            onDelete={handleDelete}
                          />
                        ))
                      : null}
                  </Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  )
}

type RecipeTableRowProps = {
  deletingRecipeId: number | null
  isDeleting: boolean
  isVariantRow?: boolean
  recipe: RecipeSummary
  variants?: RecipeSummary[]
  variantsExpanded?: boolean
  onDelete: (recipeId: number, recipeTitle: string) => void
  onToggleVariants?: (recipeId: number) => void
}

const RecipeTableRow = ({
  deletingRecipeId,
  isDeleting,
  isVariantRow = false,
  recipe,
  variants = [],
  variantsExpanded = false,
  onDelete,
  onToggleVariants,
}: RecipeTableRowProps) => {
  const variantCount = variants.length
  const variantCountLabel =
    variantCount === 1 ? '1 variant' : `${variantCount} variants`
  const rowClasses = isVariantRow
    ? 'border-b border-amber-100 bg-amber-50/30 text-sm text-stone-900 last:border-b-0'
    : 'border-b border-stone-100 text-sm text-stone-900 last:border-b-0'

  return (
    <tr className={rowClasses}>
      <td className="max-w-xs py-4 pr-4 pl-3 align-top">
        <div
          className={
            isVariantRow
              ? 'flex flex-wrap items-center gap-2 pl-6'
              : 'flex flex-wrap items-center gap-2'
          }
        >
          <Link
            className="font-bold text-stone-950 no-underline hover:text-emerald-800"
            to={`/recipes/${recipe.id}`}
          >
            {recipe.title}
          </Link>
          <RecipeVariantBadge parentRecipeId={recipe.parent_recipe_id} />
          {variantCount > 0 && onToggleVariants ? (
            <button
              className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-stone-200 bg-white px-2 py-1 text-xs font-bold text-stone-700 hover:border-emerald-700 hover:text-emerald-800"
              type="button"
              aria-label={
                variantsExpanded
                  ? `Hide variants for ${recipe.title}`
                  : `Show variants for ${recipe.title}`
              }
              aria-expanded={variantsExpanded}
              onClick={() => onToggleVariants(recipe.id)}
            >
              {variantsExpanded ? (
                <ChevronDown className="size-3" aria-hidden="true" />
              ) : (
                <ChevronRight className="size-3" aria-hidden="true" />
              )}
              {variantCountLabel}
            </button>
          ) : null}
        </div>
        {recipe.description ? (
          <p
            className={
              isVariantRow
                ? 'm-0 mt-1 line-clamp-2 pl-6 text-stone-600'
                : 'm-0 mt-1 line-clamp-2 text-stone-600'
            }
          >
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
            disabled={isDeleting && deletingRecipeId === recipe.id}
            onClick={() => onDelete(recipe.id, recipe.title)}
          >
            {isDeleting && deletingRecipeId === recipe.id
              ? 'Deleting...'
              : 'Delete'}
          </button>
        </div>
      </td>
    </tr>
  )
}

type RecipeVariantGroups = {
  rootRecipes: RecipeSummary[]
  variantsByParentId: Map<number, RecipeSummary[]>
}

function groupRecipesByVariantParent(
  recipes: RecipeSummary[],
): RecipeVariantGroups {
  const recipeIds = new Set(recipes.map((recipe) => recipe.id))
  const rootRecipes: RecipeSummary[] = []
  const variantsByParentId = new Map<number, RecipeSummary[]>()

  for (const recipe of recipes) {
    const parentRecipeId = recipe.parent_recipe_id

    if (parentRecipeId == null || !recipeIds.has(parentRecipeId)) {
      rootRecipes.push(recipe)
      continue
    }

    const variants = variantsByParentId.get(parentRecipeId) ?? []
    variants.push(recipe)
    variantsByParentId.set(parentRecipeId, variants)
  }

  return { rootRecipes, variantsByParentId }
}

function countGroupedVariants(
  variantsByParentId: Map<number, RecipeSummary[]>,
): number {
  return Array.from(variantsByParentId.values()).reduce(
    (count, variants) => count + variants.length,
    0,
  )
}

function formatRecipeCollectionCount(
  rootRecipeCount: number,
  variantCount: number,
): string {
  if (variantCount === 0) {
    return rootRecipeCount === 1 ? '1 recipe' : `${rootRecipeCount} recipes`
  }

  const rootRecipeLabel =
    rootRecipeCount === 1
      ? '1 original recipe'
      : `${rootRecipeCount} original recipes`
  const variantLabel =
    variantCount === 1 ? '1 variant' : `${variantCount} variants`

  return `${rootRecipeLabel}, ${variantLabel}`
}
