import { Link } from 'react-router'

import {
  useDeleteIngredientMutation,
  useIngredientsQuery,
} from '../queries/ingredientQueries'

export const IngredientsPage = () => {
  const ingredientsQuery = useIngredientsQuery()
  const deleteIngredientMutation = useDeleteIngredientMutation()
  const ingredients = ingredientsQuery.data ?? []
  const deletingIngredientId = deleteIngredientMutation.variables ?? null

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
    <section className="mx-auto max-w-5xl">
      <div className="flex flex-col gap-4 border-b border-gray-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-3 text-sm font-bold tracking-widest text-blue-600 uppercase">
            Ingredients
          </p>
          <h1 className="m-0 text-4xl leading-none text-gray-900 sm:text-6xl">
            Ingredient library
          </h1>
        </div>
        <Link
          className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 font-semibold text-white no-underline"
          to="/ingredients/new"
        >
          Add ingredient
        </Link>
      </div>

      {ingredientsQuery.isPending ? (
        <p className="mt-8 text-gray-600">Loading ingredients...</p>
      ) : null}

      {ingredientsQuery.isError ? (
        <p className="mt-8 text-red-600">
          {ingredientsQuery.error instanceof Error
            ? ingredientsQuery.error.message
            : 'Unable to load ingredients'}
        </p>
      ) : null}

      {deleteIngredientMutation.isError ? (
        <p className="mt-8 text-red-600">
          {deleteIngredientMutation.error instanceof Error
            ? deleteIngredientMutation.error.message
            : 'Unable to delete ingredient'}
        </p>
      ) : null}

      {ingredientsQuery.isSuccess && ingredients.length === 0 ? (
        <p className="mt-8 text-gray-600">
          Your ingredient library is empty. Add your first ingredient to start
          building recipes.
        </p>
      ) : null}

      {ingredients.length > 0 ? (
        <div className="mt-8 overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-gray-200 text-sm text-gray-600">
                <th className="py-3 pr-4 font-semibold">Name</th>
                <th className="py-3 pr-4 font-semibold">Unit</th>
                <th className="py-3 pr-4 font-semibold">Calories per unit</th>
                <th className="py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {ingredients.map((ingredient) => (
                <tr
                  className="border-b border-gray-100 text-gray-900"
                  key={ingredient.id}
                >
                  <td className="py-3 pr-4 font-medium">{ingredient.name}</td>
                  <td className="py-3 pr-4">{ingredient.unit}</td>
                  <td className="py-3 pr-4">
                    {ingredient.calories_per_unit}
                  </td>
                  <td className="py-3">
                    <div className="flex gap-4">
                      <Link
                        className="font-bold text-gray-900 no-underline"
                        to={`/ingredients/${ingredient.id}/edit`}
                      >
                        Edit
                      </Link>
                      <button
                        className="cursor-pointer border-0 bg-transparent p-0 font-bold text-red-600 disabled:cursor-not-allowed disabled:text-red-300"
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
