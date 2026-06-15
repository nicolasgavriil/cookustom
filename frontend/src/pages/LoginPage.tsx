import { useNavigate } from 'react-router'

import { AuthForm } from '../components/AuthForm'
import { useLoginMutation } from '../queries/authQueries'

export const LoginPage = () => {
  const navigate = useNavigate()
  const loginMutation = useLoginMutation()
  const authError =
    loginMutation.error instanceof Error ? loginMutation.error.message : null

  const handleSubmit = (email: string, password: string) => {
    loginMutation.reset()
    loginMutation.mutate(
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
        Log in
      </h1>
      <p className="mt-6 text-lg leading-8 text-gray-600">
        Sign in to manage your personal recipes and nutrition estimates.
      </p>
      <AuthForm
        submitLabel="Log in"
        error={authError}
        isSubmitting={loginMutation.isPending}
        passwordAutoComplete="current-password"
        passwordMinLength={1}
        onSubmit={handleSubmit}
      />
    </section>
  )
}
