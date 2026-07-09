import { Route, Routes } from 'react-router'

import { NavBar } from './components/NavBar'
import { RequireAuth } from './components/RequireAuth'
import { DashboardPage } from './pages/DashboardPage'
import { EditIngredientPage } from './pages/EditIngredientPage'
import { EditRecipePage } from './pages/EditRecipePage'
import { IngredientsPage } from './pages/IngredientsPage'
import { LoginPage } from './pages/LoginPage'
import { NewIngredientPage } from './pages/NewIngredientPage'
import { NewRecipePage } from './pages/NewRecipePage'
import { NotFoundPage } from './pages/NotFoundPage'
import { RegisterPage } from './pages/RegisterPage'
import { RecipeDetailPage } from './pages/RecipeDetailPage'
import { RecipesPage } from './pages/RecipesPage'

const App = () => {
  return (
    <div className="min-h-screen">
      <NavBar />

      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
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
            path="/recipes/new"
            element={
              <RequireAuth>
                <NewRecipePage />
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
          <Route
            path="/recipes/:recipeId/edit"
            element={
              <RequireAuth>
                <EditRecipePage />
              </RequireAuth>
            }
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
