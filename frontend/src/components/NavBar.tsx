import {
  BookOpen,
  Carrot,
  ChefHat,
  LogIn,
  LogOut,
  UserPlus,
} from 'lucide-react'
import { Link, NavLink, useNavigate } from 'react-router'

import { useCurrentUserQuery, useLogout } from '../queries/authQueries'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'inline-flex min-h-9 items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold no-underline transition-colors',
    isActive
      ? 'bg-emerald-100 text-emerald-950'
      : 'text-stone-700 hover:bg-stone-100 hover:text-emerald-900',
  ].join(' ')

export const NavBar = () => {
  const navigate = useNavigate()
  const currentUserQuery = useCurrentUserQuery()
  const logout = useLogout()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav
      className="sticky top-0 z-20 border-b border-stone-200 bg-[#fffaf3]/95 backdrop-blur"
      aria-label="Primary navigation"
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <Link
            className="inline-flex items-center gap-3 text-base font-bold text-stone-950 no-underline"
            to="/"
          >
            <span className="flex size-9 items-center justify-center rounded-lg bg-emerald-800 text-white">
              <ChefHat className="size-5" aria-hidden="true" />
            </span>
            Cookustom
          </Link>

          {currentUserQuery.data ? (
            <div className="hidden items-center gap-3 text-sm text-stone-600 md:flex">
              <span className="max-w-56 truncate">
                {currentUserQuery.data.is_demo
                  ? 'Demo session'
                  : currentUserQuery.data.email}
              </span>
              <button
                className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-transparent bg-transparent px-3 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-100 hover:text-emerald-900"
                type="button"
                onClick={handleLogout}
              >
                <LogOut className="size-4" aria-hidden="true" />
                Log out
              </button>
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {currentUserQuery.data ? (
            <>
              <NavLink className={navLinkClass} to="/ingredients">
                <Carrot className="size-4" aria-hidden="true" />
                Ingredients
              </NavLink>
              <NavLink className={navLinkClass} to="/recipes">
                <BookOpen className="size-4" aria-hidden="true" />
                Recipes
              </NavLink>
              <button
                className="inline-flex min-h-9 cursor-pointer items-center gap-2 rounded-md border border-transparent bg-transparent px-3 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-100 hover:text-emerald-900 md:hidden"
                type="button"
                onClick={handleLogout}
              >
                <LogOut className="size-4" aria-hidden="true" />
                Log out
              </button>
            </>
          ) : (
            <>
              <NavLink className={navLinkClass} to="/login">
                <LogIn className="size-4" aria-hidden="true" />
                Log in
              </NavLink>
              <NavLink className={navLinkClass} to="/register">
                <UserPlus className="size-4" aria-hidden="true" />
                Register
              </NavLink>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
