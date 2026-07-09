import type { SyntheticEvent } from 'react'

import { Button } from './ui/Button'

type AuthFormProps = {
  submitLabel: string
  error: string | null
  isSubmitting: boolean
  passwordAutoComplete: 'current-password' | 'new-password'
  passwordMinLength: number
  onSubmit: (email: string, password: string) => void
}

export const AuthForm = ({
  submitLabel,
  error,
  isSubmitting,
  passwordAutoComplete,
  passwordMinLength,
  onSubmit,
}: AuthFormProps) => {
  const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const email = String(formData.get('email') ?? '')
    const password = String(formData.get('password') ?? '')

    onSubmit(email, password)
  }

  return (
    <form
      className="mt-8 flex max-w-md flex-col gap-5 rounded-lg border border-stone-200 bg-white/85 p-5 shadow-sm sm:p-6"
      onSubmit={handleSubmit}
    >
      <div>
        <label className="mb-2 block font-medium text-stone-900" htmlFor="email">
          Email
        </label>
        <input
          className="w-full rounded-md border border-stone-300 bg-white px-3 py-2.5 text-stone-950 outline-emerald-700 focus:border-emerald-700"
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
        />
      </div>

      <div>
        <label
          className="mb-2 block font-medium text-stone-900"
          htmlFor="password"
        >
          Password
        </label>
        <input
          className="w-full rounded-md border border-stone-300 bg-white px-3 py-2.5 text-stone-950 outline-emerald-700 focus:border-emerald-700"
          id="password"
          name="password"
          type="password"
          autoComplete={passwordAutoComplete}
          minLength={passwordMinLength}
          maxLength={128}
          required
        />
      </div>

      {error ? <p className="m-0 text-sm text-rose-700">{error}</p> : null}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Please wait...' : submitLabel}
      </Button>
    </form>
  )
}
