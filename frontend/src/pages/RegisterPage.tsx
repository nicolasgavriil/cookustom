import { useNavigate } from 'react-router'

import { AuthForm } from '../components/AuthForm'
import { useRegisterMutation } from '../queries/authQueries'

export const RegisterPage = () => {
  const navigate = useNavigate()
  const registerMutation = useRegisterMutation()
  const authError =
    registerMutation.error instanceof Error
      ? registerMutation.error.message
      : null

  const handleSubmit = (email: string, password: string) => {
    registerMutation.reset()
    registerMutation.mutate(
      { email, password },
      {
        onSuccess: () => {
          navigate('/')
        },
      },
    )
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
        isSubmitting={registerMutation.isPending}
        passwordAutoComplete="new-password"
        passwordMinLength={8}
        onSubmit={handleSubmit}
      />
    </section>
  )
}
