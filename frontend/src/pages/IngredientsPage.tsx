import { Link } from 'react-router'

import { useIngredientsQuery } from '../queries/ingredientQueries'

export const IngredientsPage = () => {
  const ingredientsQuery = useIngredientsQuery()
  const ingredients = ingredientsQuery.data ?? []

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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  )
}
