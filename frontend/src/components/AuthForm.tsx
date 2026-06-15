import type { SyntheticEvent } from 'react'

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
    <form className="mt-8 flex max-w-md flex-col gap-5" onSubmit={handleSubmit}>
      <div>
        <label className="mb-2 block font-medium text-gray-900" htmlFor="email">
          Email
        </label>
        <input
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-blue-600"
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
        />
      </div>

      <div>
        <label
          className="mb-2 block font-medium text-gray-900"
          htmlFor="password"
        >
          Password
        </label>
        <input
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-blue-600"
          id="password"
          name="password"
          type="password"
          autoComplete={passwordAutoComplete}
          minLength={passwordMinLength}
          maxLength={128}
          required
        />
      </div>

      {error ? <p className="m-0 text-sm text-red-600">{error}</p> : null}

      <button
        className="rounded-md bg-blue-600 px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:bg-blue-300"
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Please wait...' : submitLabel}
      </button>
    </form>
  )
}
