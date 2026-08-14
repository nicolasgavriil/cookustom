import { UserPlus } from 'lucide-react'
import { useNavigate } from 'react-router'

import { AuthForm } from '../components/AuthForm'
import { DemoButton } from '../components/DemoButton'
import { PageHeader } from '../components/ui/PageHeader'
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
    <section className="max-w-2xl">
      <PageHeader
        eyebrow="Auth"
        title="Create account"
        description="Create an account to start building your ingredient and recipe library."
        icon={<UserPlus className="size-6" aria-hidden="true" />}
      />
      <AuthForm
        submitLabel="Create account"
        error={authError}
        isSubmitting={registerMutation.isPending}
        passwordAutoComplete="new-password"
        passwordMinLength={8}
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
