import { Link, useNavigate, useParams } from 'react-router'

import type { Recipe } from '../api/types'
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
    <section className="mx-auto max-w-5xl">
      <Link className="font-bold text-gray-900 no-underline" to="/recipes">
        Back to recipes
      </Link>

      {!isValidRecipeId ? (
        <p className="mt-8 text-gray-600">Recipe not found.</p>
      ) : null}

      {recipeQuery.isPending && isValidRecipeId ? (
        <p className="mt-8 text-gray-600">Loading recipe...</p>
      ) : null}

      {recipeQuery.isError ? (
        <p className="mt-8 text-red-600">
          {recipeQuery.error instanceof Error
            ? recipeQuery.error.message
            : 'Unable to load recipe'}
        </p>
      ) : null}

      {deleteRecipeMutation.isError ? (
        <p className="mt-8 text-red-600">
          {deleteRecipeMutation.error instanceof Error
            ? deleteRecipeMutation.error.message
            : 'Unable to delete recipe'}
        </p>
      ) : null}

      {recipe ? (
        <>
          <div className="mt-8 flex flex-col gap-4 border-b border-gray-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-3 text-sm font-bold tracking-widest text-blue-600 uppercase">
                Recipe
              </p>
              <h1 className="m-0 text-4xl leading-none text-gray-900 sm:text-6xl">
                {recipe.title}
              </h1>
              {recipe.description ? (
                <p className="mt-4 max-w-3xl text-lg leading-8 text-gray-700">
                  {recipe.description}
                </p>
              ) : null}
            </div>
            <div className="flex gap-3">
              <Link
                className="inline-flex items-center justify-center rounded-md bg-gray-900 px-4 py-2 font-semibold text-white no-underline"
                to={`/recipes/${recipe.id}/edit`}
              >
                Edit
              </Link>
              <button
                className="inline-flex cursor-pointer items-center justify-center rounded-md border-0 bg-red-600 px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:bg-red-300"
                type="button"
                disabled={deleteRecipeMutation.isPending}
                onClick={() => handleDelete(recipe)}
              >
                {deleteRecipeMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>

          <dl className="mt-8 grid gap-4 sm:grid-cols-3">
            <div>
              <dt className="text-sm font-semibold text-gray-600">
                Per serving
              </dt>
              <dd className="m-0 mt-1 text-2xl font-bold text-gray-900">
                {recipe.calories_per_serving} kcal
              </dd>
            </div>
            <div>
              <dt className="text-sm font-semibold text-gray-600">
                Total calories
              </dt>
              <dd className="m-0 mt-1 text-2xl font-bold text-gray-900">
                {recipe.total_calories} kcal
              </dd>
            </div>
            <div>
              <dt className="text-sm font-semibold text-gray-600">
                Base servings
              </dt>
              <dd className="m-0 mt-1 text-2xl font-bold text-gray-900">
                {recipe.base_servings}
              </dd>
            </div>
          </dl>

          <section className="mt-10">
            <h2 className="m-0 text-2xl text-gray-900">Ingredients</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-gray-200 text-sm text-gray-600">
                    <th className="py-3 pr-4 font-semibold">Name</th>
                    <th className="py-3 pr-4 font-semibold">Quantity</th>
                    <th className="py-3 pr-4 font-semibold">Calories</th>
                    <th className="py-3 font-semibold">Per unit</th>
                  </tr>
                </thead>
                <tbody>
                  {recipe.ingredients.map((ingredient) => (
                    <tr
                      className="border-b border-gray-100 text-gray-900"
                      key={ingredient.ingredient_id}
                    >
                      <td className="py-3 pr-4 font-medium">
                        {ingredient.ingredient_name}
                      </td>
                      <td className="py-3 pr-4">
                        {ingredient.quantity} {ingredient.unit}
                      </td>
                      <td className="py-3 pr-4">{ingredient.calories} kcal</td>
                      <td className="py-3">
                        {ingredient.calories_per_unit} kcal
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-10">
            <h2 className="m-0 text-2xl text-gray-900">Instructions</h2>
            <p className="mt-4 whitespace-pre-wrap text-gray-700">
              {recipe.instructions}
            </p>
          </section>
        </>
      ) : null}
    </section>
  )
}
