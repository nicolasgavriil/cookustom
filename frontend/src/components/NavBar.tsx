import { Link } from 'react-router'

export const NavBar = () => {
  return (
    <nav className="app__nav" aria-label="Primary navigation">
      <Link to="/">Recipe App</Link>
      <div>
        <Link to="/login">Log in</Link>
        <Link to="/register">Register</Link>
      </div>
    </nav>
  )
}
