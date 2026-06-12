import { Link } from 'react-router'

export const NavBar = () => {
  return (
    <nav
      className="mx-auto mb-18 flex w-full max-w-5xl items-start justify-between sm:mb-24 sm:items-center"
      aria-label="Primary navigation"
    >
      <Link className="font-bold text-gray-900 no-underline" to="/">
        Recipe App
      </Link>
      <div className="flex flex-col gap-3 sm:flex-row sm:gap-6">
        <Link className="font-bold text-gray-900 no-underline" to="/login">
          Log in
        </Link>
        <Link className="font-bold text-gray-900 no-underline" to="/register">
          Register
        </Link>
      </div>
    </nav>
  )
}
