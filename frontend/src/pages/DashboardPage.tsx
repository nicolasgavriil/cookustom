import { BookOpen, Carrot, ChefHat, NotebookText } from 'lucide-react'

import { ButtonLink } from '../components/ui/Button'
import { useCurrentUserQuery } from '../queries/authQueries'

export const DashboardPage = () => {
  const currentUserQuery = useCurrentUserQuery()
  const isAuthenticated = Boolean(currentUserQuery.data)

  return (
    <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
      <div className="rounded-lg border border-stone-200 bg-white/80 p-6 shadow-sm sm:p-8">
        <div className="flex size-12 items-center justify-center rounded-lg bg-emerald-800 text-white">
          <ChefHat className="size-6" aria-hidden="true" />
        </div>
        <p className="mt-8 mb-2 text-xs font-bold tracking-widest text-emerald-800 uppercase">
          Cookustom
        </p>
        <h1 className="m-0 max-w-3xl text-4xl leading-tight font-bold text-stone-950 sm:text-5xl">
          Customize every recipe to your taste.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-stone-600">
          Keep your personal library organized around the meals you actually
          cook.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          {isAuthenticated ? (
            <>
              <ButtonLink
                icon={<BookOpen className="size-4" aria-hidden="true" />}
                to="/recipes"
              >
                Open recipes
              </ButtonLink>
              <ButtonLink
                icon={<Carrot className="size-4" aria-hidden="true" />}
                variant="secondary"
                to="/ingredients"
              >
                Open ingredients
              </ButtonLink>
            </>
          ) : (
            <>
              <ButtonLink to="/register">Create account</ButtonLink>
              <ButtonLink variant="secondary" to="/login">
                Log in
              </ButtonLink>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-4">
        <div className="rounded-lg border border-stone-200 bg-white/80 p-5 shadow-sm">
          <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-amber-100 text-amber-800">
            <NotebookText className="size-5" aria-hidden="true" />
          </div>
          <h2 className="m-0 text-lg font-bold text-stone-950">
            Recipe collection
          </h2>
          <p className="mt-2 text-sm leading-6 text-stone-600">
            Save instructions, servings, ingredients, and calorie estimates in
            one place.
          </p>
        </div>
        <div className="rounded-lg border border-stone-200 bg-white/80 p-5 shadow-sm">
          <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
            <Carrot className="size-5" aria-hidden="true" />
          </div>
          <h2 className="m-0 text-lg font-bold text-stone-950">
            Ingredient library
          </h2>
          <p className="mt-2 text-sm leading-6 text-stone-600">
            Reuse ingredients across recipes with calories per gram,
            milliliter, or piece.
          </p>
        </div>
      </div>
    </section>
  )
}
