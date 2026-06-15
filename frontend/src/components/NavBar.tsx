import { Link } from 'react-router'

import { useCurrentUserQuery, useLogout } from '../queries/authQueries'

export const NavBar = () => {
  const currentUserQuery = useCurrentUserQuery()
  const logout = useLogout()

  return (
    <nav
      className="mx-auto mb-18 flex w-full max-w-5xl items-start justify-between sm:mb-24 sm:items-center"
      aria-label="Primary navigation"
    >
      <Link className="font-bold text-gray-900 no-underline" to="/">
        Recipe App
      </Link>
      <div className="flex flex-col gap-3 sm:flex-row sm:gap-6">
        {currentUserQuery.data ? (
          <>
            <span className="font-medium text-gray-700">
              {currentUserQuery.data.email}
            </span>
            <button
              className="cursor-pointer border-0 bg-transparent p-0 text-left font-bold text-gray-900"
              type="button"
              onClick={logout}
            >
              Log out
            </button>
          </>
        ) : (
          <>
            <Link className="font-bold text-gray-900 no-underline" to="/login">
              Log in
            </Link>
            <Link
              className="font-bold text-gray-900 no-underline"
              to="/register"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}
