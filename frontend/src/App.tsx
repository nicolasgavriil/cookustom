import { Route, Routes } from 'react-router'

import { NavBar } from './components/NavBar'
import { DashboardPage } from './pages/DashboardPage'
import { IngredientsPage } from './pages/IngredientsPage'
import { LoginPage } from './pages/LoginPage'
import { NewIngredientPage } from './pages/NewIngredientPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { RegisterPage } from './pages/RegisterPage'

const App = () => {
  return (
    <main className="min-h-screen px-6 py-12 sm:px-8">
      <NavBar />

      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/ingredients" element={<IngredientsPage />} />
        <Route path="/ingredients/new" element={<NewIngredientPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </main>
  )
}

export default App
