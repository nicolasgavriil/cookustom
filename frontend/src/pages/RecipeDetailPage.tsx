import { useState } from 'react'
import { ArrowLeft, BookOpen, Minus, Pencil, Plus, Trash2 } from 'lucide-react'
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
        <RecipeContent
          key={recipe.id}
          recipe={recipe}
          isDeleting={deleteRecipeMutation.isPending}
          onDelete={handleDelete}
        />
      ) : null}
    </section>
  )
}

type RecipeContentProps = {
  recipe: Recipe
  isDeleting: boolean
  onDelete: (recipe: Recipe) => void
}

const RecipeContent = ({
  recipe,
  isDeleting,
  onDelete,
}: RecipeContentProps) => {
  const [servingsInput, setServingsInput] = useState(
    String(recipe.base_servings),
  )
  const [targetServings, setTargetServings] = useState(recipe.base_servings)
  const servingsError = getServingInputError(servingsInput)
  const scaleFactor = targetServings / recipe.base_servings
  const baseTotalCalories = calculateBaseTotalCalories(recipe)
  const caloriesPerServing = baseTotalCalories / recipe.base_servings
  const scaledTotalCalories = baseTotalCalories * scaleFactor

  const handleServingsChange = (value: string) => {
    if (/^\d*$/.test(value)) {
      setServingsInput(value)

      const servingCount = parseServingCount(value)
      if (servingCount !== null) {
        setTargetServings(servingCount)
      }
    }
  }

  const decreaseServings = () => {
    const nextServings = Math.max(1, targetServings - 1)
    setServingsInput(String(nextServings))
    setTargetServings(nextServings)
  }

  const increaseServings = () => {
    const nextServings = targetServings + 1
    setServingsInput(String(nextServings))
    setTargetServings(nextServings)
  }

  const resetInvalidServings = () => {
    setServingsInput(String(targetServings))
  }

  return (
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
                disabled={isDeleting}
                onClick={() => onDelete(recipe)}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
            </>
          }
        />
      </div>

      <section className="mt-8 flex flex-col gap-4 rounded-lg border border-stone-200 bg-white/85 p-5 shadow-sm sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="m-0 text-xl font-bold text-stone-950">
            Scale servings
          </h2>
          <p className="m-0 mt-2 max-w-2xl text-sm leading-6 text-stone-600">
            Temporarily adjust quantities for this cooking session. The saved
            recipe stays at {formatServingLabel(recipe.base_servings)}.
          </p>
        </div>
        <div>
          <label
            className="mb-2 block text-sm font-semibold text-stone-700"
            htmlFor="target-servings"
          >
            Target servings
          </label>
          <div className="flex items-center gap-2">
            <Button
              className="px-3"
              icon={<Minus className="size-4" aria-hidden="true" />}
              variant="secondary"
              type="button"
              aria-label="Decrease servings"
              disabled={targetServings === 1}
              onClick={decreaseServings}
            />
            <input
              className="h-10 w-20 rounded-md border border-stone-300 bg-white px-3 text-center font-semibold text-stone-950 outline-emerald-700 focus:border-emerald-700 aria-invalid:border-rose-500"
              aria-describedby={
                servingsError ? 'target-servings-error' : undefined
              }
              aria-invalid={servingsError ? 'true' : undefined}
              id="target-servings"
              inputMode="numeric"
              type="text"
              value={servingsInput}
              onBlur={resetInvalidServings}
              onChange={(event) => handleServingsChange(event.target.value)}
            />
            <Button
              className="px-3"
              icon={<Plus className="size-4" aria-hidden="true" />}
              variant="secondary"
              type="button"
              aria-label="Increase servings"
              onClick={increaseServings}
            />
          </div>
          {servingsError ? (
            <p
              className="m-0 mt-2 text-sm text-rose-700"
              id="target-servings-error"
            >
              {servingsError}
            </p>
          ) : null}
        </div>
      </section>

      <dl className="mt-6 grid overflow-hidden rounded-lg border border-stone-200 bg-white/85 shadow-sm sm:grid-cols-4">
        <div className="border-b border-stone-200 p-5 sm:border-r sm:border-b-0">
          <dt className="text-xs font-bold tracking-wider text-stone-500 uppercase">
            Per serving
          </dt>
          <dd className="m-0 mt-2 text-2xl font-bold text-stone-950">
            {formatCalories(caloriesPerServing)} kcal
          </dd>
        </div>
        <div className="border-b border-stone-200 p-5 sm:border-r sm:border-b-0">
          <dt className="text-xs font-bold tracking-wider text-stone-500 uppercase">
            Total for {targetServings}
          </dt>
          <dd className="m-0 mt-2 text-2xl font-bold text-stone-950">
            {formatCalories(scaledTotalCalories)} kcal
          </dd>
        </div>
        <div className="border-b border-stone-200 p-5 sm:border-r sm:border-b-0">
          <dt className="text-xs font-bold tracking-wider text-stone-500 uppercase">
            Saved servings
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
        <h2 className="m-0 text-xl font-bold text-stone-950">Ingredients</h2>
        <p className="m-0 mt-2 text-sm text-stone-600">
          Quantities shown for {formatServingLabel(targetServings)}.
        </p>
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
                    {formatScaledQuantity(ingredient.quantity, scaleFactor)}{' '}
                    {ingredient.unit}
                  </td>
                  <td className="py-4 pr-4 text-right whitespace-nowrap">
                    {formatCalories(
                      calculateIngredientCalories(ingredient, scaleFactor),
                    )}{' '}
                    kcal
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
        <h2 className="m-0 text-xl font-bold text-stone-950">Instructions</h2>
        <p className="mt-4 max-w-3xl whitespace-pre-wrap rounded-lg border border-stone-200 bg-white/85 p-5 leading-7 text-stone-700 shadow-sm">
          {recipe.instructions}
        </p>
      </section>
    </>
  )
}

const quantityFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 4,
})

const calorieFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 0,
})

function parseServingCount(value: string): number | null {
  const servingCount = Number(value)

  if (Number.isInteger(servingCount) && servingCount >= 1) {
    return servingCount
  }

  return null
}

function getServingInputError(value: string): string | null {
  if (parseServingCount(value) !== null) {
    return null
  }

  return 'Enter at least 1 serving'
}

function formatServingLabel(servings: number): string {
  return servings === 1 ? '1 serving' : `${servings} servings`
}

function formatScaledQuantity(quantity: string, scaleFactor: number): string {
  const scaledQuantity = Number(quantity) * scaleFactor

  if (!Number.isFinite(scaledQuantity)) {
    return quantity
  }

  return quantityFormatter.format(scaledQuantity)
}

function formatCalories(calories: number): string {
  return calorieFormatter.format(calories)
}

function calculateBaseTotalCalories(recipe: Recipe): number {
  return recipe.ingredients.reduce(
    (totalCalories, ingredient) =>
      totalCalories + calculateIngredientCalories(ingredient),
    0,
  )
}

function calculateIngredientCalories(
  ingredient: Recipe['ingredients'][number],
  scaleFactor = 1,
): number {
  return (
    Number(ingredient.quantity) *
    Number(ingredient.calories_per_unit) *
    scaleFactor
  )
}
