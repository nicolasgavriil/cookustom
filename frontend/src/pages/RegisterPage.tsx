import { useState } from 'react'
import { useNavigate } from 'react-router'

import { AuthForm } from '../components/AuthForm'
import * as authService from '../services/authService'
import { tokenStorage } from '../utils/tokenStorage'

export const RegisterPage = () => {
  const navigate = useNavigate()
  const [authError, setAuthError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (email: string, password: string) => {
    setAuthError(null)
    setIsSubmitting(true)

    try {
      await authService.register({ email, password })
      const token = await authService.login({ email, password })
      tokenStorage.setAccessToken(token.access_token)
      navigate('/')
    } catch (error) {
      setAuthError(
        error instanceof Error ? error.message : 'Registration failed',
      )
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
        Create account
      </h1>
      <p className="mt-6 text-lg leading-8 text-gray-600">
        Create an account to start building your ingredient and recipe library.
      </p>
      <AuthForm
        submitLabel="Create account"
        error={authError}
        isSubmitting={isSubmitting}
        passwordAutoComplete="new-password"
        passwordMinLength={8}
        onSubmit={handleSubmit}
      />
    </section>
  )
}
