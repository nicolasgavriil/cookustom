import { useRecipesQuery } from '../queries/recipeQueries'

export const RecipesPage = () => {
  const recipesQuery = useRecipesQuery()
  const recipes = recipesQuery.data ?? []

  return (
    <section className="mx-auto max-w-5xl">
      <div className="border-b border-gray-200 pb-6">
        <p className="mb-3 text-sm font-bold tracking-widest text-blue-600 uppercase">
          Recipes
        </p>
        <h1 className="m-0 text-4xl leading-none text-gray-900 sm:text-6xl">
          Recipe collection
        </h1>
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
                <th className="py-3 font-semibold">Ingredients</th>
              </tr>
            </thead>
            <tbody>
              {recipes.map((recipe) => (
                <tr
                  className="border-b border-gray-100 text-gray-900"
                  key={recipe.id}
                >
                  <td className="py-3 pr-4 font-medium">{recipe.title}</td>
                  <td className="py-3 pr-4">
                    {recipe.calories_per_serving} kcal
                  </td>
                  <td className="py-3 pr-4">{recipe.total_calories} kcal</td>
                  <td className="py-3 pr-4">{recipe.base_servings}</td>
                  <td className="py-3">{recipe.ingredients.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  )
}
