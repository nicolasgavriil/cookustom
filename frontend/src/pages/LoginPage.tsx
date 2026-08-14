import { LogIn } from 'lucide-react'
import { useNavigate } from 'react-router'

import { AuthForm } from '../components/AuthForm'
import { DemoButton } from '../components/DemoButton'
import { PageHeader } from '../components/ui/PageHeader'
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
    <section className="max-w-2xl">
      <PageHeader
        eyebrow="Auth"
        title="Log in"
        description="Sign in to manage your personal recipes and nutrition estimates."
        icon={<LogIn className="size-6" aria-hidden="true" />}
      />
      <AuthForm
        submitLabel="Log in"
        error={authError}
        isSubmitting={loginMutation.isPending}
        passwordAutoComplete="current-password"
        passwordMinLength={1}
        onSubmit={handleSubmit}
      />
      <DemoButton
        buttonClassName="w-full"
        className="mt-4 max-w-md"
        variant="secondary"
      />
    </section>
  )
}
