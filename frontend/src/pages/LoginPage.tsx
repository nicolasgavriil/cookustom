import { useState } from 'react'
import { useNavigate } from 'react-router'

import { AuthForm } from '../components/AuthForm'
import * as authService from '../services/authService'
import { tokenStorage } from '../utils/tokenStorage'

export const LoginPage = () => {
  const navigate = useNavigate()
  const [authError, setAuthError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (email: string, password: string) => {
    setAuthError(null)
    setIsSubmitting(true)

    try {
      const token = await authService.login({ email, password })
      tokenStorage.setAccessToken(token.access_token)
      navigate('/')
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Login failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="mx-auto max-w-2xl">
      <p className="mb-3 text-sm font-bold tracking-widest text-blue-600 uppercase">
        Auth
      </p>
      <h1 className="m-0 text-4xl leading-none text-gray-900 sm:text-7xl">
        Log in
      </h1>
      <p className="mt-6 text-lg leading-8 text-gray-600">
        Sign in to manage your personal recipes and nutrition estimates.
      </p>
      <AuthForm
        submitLabel="Log in"
        error={authError}
        isSubmitting={isSubmitting}
        passwordAutoComplete="current-password"
        passwordMinLength={1}
        onSubmit={handleSubmit}
      />
    </section>
  )
}
