import { Link } from 'react-router'

import {
  useDeleteRecipeMutation,
  useRecipesQuery,
} from '../queries/recipeQueries'

export const RecipesPage = () => {
  const recipesQuery = useRecipesQuery()
  const deleteRecipeMutation = useDeleteRecipeMutation()
  const recipes = recipesQuery.data ?? []
  const deletingRecipeId = deleteRecipeMutation.variables ?? null

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
    <section className="mx-auto max-w-5xl">
      <div className="flex flex-col gap-4 border-b border-gray-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-3 text-sm font-bold tracking-widest text-blue-600 uppercase">
            Recipes
          </p>
          <h1 className="m-0 text-4xl leading-none text-gray-900 sm:text-6xl">
            Recipe collection
          </h1>
        </div>
        <Link
          className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 font-semibold text-white no-underline"
          to="/recipes/new"
        >
          Add recipe
        </Link>
      </div>

      {recipesQuery.isPending ? (
        <p className="mt-8 text-gray-600">Loading recipes...</p>
      ) : null}

      {recipesQuery.isError ? (
        <p className="mt-8 text-red-600">
          {recipesQuery.error instanceof Error
            ? recipesQuery.error.message
            : 'Unable to load recipes'}
        </p>
      ) : null}

      {deleteRecipeMutation.isError ? (
        <p className="mt-8 text-red-600">
          {deleteRecipeMutation.error instanceof Error
            ? deleteRecipeMutation.error.message
            : 'Unable to delete recipe'}
        </p>
      ) : null}

      {recipesQuery.isSuccess && recipes.length === 0 ? (
        <p className="mt-8 text-gray-600">
          Your recipe collection is empty. Add recipes after setting up your
          ingredient library.
        </p>
      ) : null}

      {recipes.length > 0 ? (
        <div className="mt-8 overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-gray-200 text-sm text-gray-600">
                <th className="py-3 pr-4 font-semibold">Title</th>
                <th className="py-3 pr-4 font-semibold">Per serving</th>
                <th className="py-3 pr-4 font-semibold">Total calories</th>
                <th className="py-3 pr-4 font-semibold">Servings</th>
                <th className="py-3 pr-4 font-semibold">Ingredients</th>
                <th className="py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recipes.map((recipe) => (
                <tr
                  className="border-b border-gray-100 text-gray-900"
                  key={recipe.id}
                >
                  <td className="py-3 pr-4 font-medium">
                    <Link
                      className="font-bold text-gray-900 no-underline"
                      to={`/recipes/${recipe.id}`}
                    >
                      {recipe.title}
                    </Link>
                  </td>
                  <td className="py-3 pr-4">
                    {recipe.calories_per_serving} kcal
                  </td>
                  <td className="py-3 pr-4">{recipe.total_calories} kcal</td>
                  <td className="py-3 pr-4">{recipe.base_servings}</td>
                  <td className="py-3 pr-4">{recipe.ingredient_count}</td>
                  <td className="py-3">
                    <div className="flex gap-4">
                      <Link
                        className="font-bold text-gray-900 no-underline"
                        to={`/recipes/${recipe.id}/edit`}
                      >
                        Edit
                      </Link>
                      <button
                        className="cursor-pointer border-0 bg-transparent p-0 font-bold text-red-600 disabled:cursor-not-allowed disabled:text-red-300"
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
