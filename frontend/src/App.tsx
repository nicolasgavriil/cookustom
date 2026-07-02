import { Route, Routes } from 'react-router'

import { NavBar } from './components/NavBar'
import { RequireAuth } from './components/RequireAuth'
import { DashboardPage } from './pages/DashboardPage'
import { EditIngredientPage } from './pages/EditIngredientPage'
import { IngredientsPage } from './pages/IngredientsPage'
import { LoginPage } from './pages/LoginPage'
import { NewIngredientPage } from './pages/NewIngredientPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { RegisterPage } from './pages/RegisterPage'
import { RecipeDetailPage } from './pages/RecipeDetailPage'
import { RecipesPage } from './pages/RecipesPage'

const App = () => {
  return (
    <main className="min-h-screen px-6 py-12 sm:px-8">
      <NavBar />

      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route
          path="/ingredients"
          element={
            <RequireAuth>
              <IngredientsPage />
            </RequireAuth>
          }
        />
        <Route
          path="/ingredients/new"
          element={
            <RequireAuth>
              <NewIngredientPage />
            </RequireAuth>
          }
        />
        <Route
          path="/ingredients/:ingredientId/edit"
          element={
            <RequireAuth>
              <EditIngredientPage />
            </RequireAuth>
          }
        />
        <Route
          path="/recipes"
          element={
            <RequireAuth>
              <RecipesPage />
            </RequireAuth>
          }
        />
        <Route
          path="/recipes/:recipeId"
          element={
            <RequireAuth>
              <RecipeDetailPage />
            </RequireAuth>
          }
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </main>
  )
}

export default App
