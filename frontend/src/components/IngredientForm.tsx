import { useForm } from 'react-hook-form'

import type { IngredientCreateRequest, IngredientUnit } from '../api/types'

type IngredientFormValues = {
  name: string
  unit: IngredientUnit
  calories_per_unit: string
}

type IngredientFormProps = {
  submitLabel: string
  error: string | null
  isSubmitting: boolean
  onSubmit: (request: IngredientCreateRequest) => void
}

const unitOptions: IngredientUnit[] = ['g', 'ml', 'piece']

export const IngredientForm = ({
  submitLabel,
  error,
  isSubmitting,
  onSubmit,
}: IngredientFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IngredientFormValues>({
    defaultValues: {
      name: '',
      unit: 'g',
      calories_per_unit: '',
    },
  })

  const submitForm = (values: IngredientFormValues) => {
    onSubmit({
      name: values.name,
      unit: values.unit,
      calories_per_unit: values.calories_per_unit,
    })
  }

  return (
    <form
      className="mt-8 flex max-w-md flex-col gap-5"
      onSubmit={handleSubmit(submitForm)}
    >
      <div>
        <label className="mb-2 block font-medium text-gray-900" htmlFor="name">
          Name
        </label>
        <input
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-blue-600"
          id="name"
          type="text"
          {...register('name', {
            required: 'Name is required',
            validate: (value) => value.trim().length > 0 || 'Name is required',
            maxLength: {
              value: 255,
              message: 'Name must be 255 characters or fewer',
            },
          })}
        />
        {errors.name ? (
          <p className="mt-2 text-sm text-red-600">{errors.name.message}</p>
        ) : null}
      </div>

      <div>
        <label className="mb-2 block font-medium text-gray-900" htmlFor="unit">
          Unit
        </label>
        <select
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-blue-600"
          id="unit"
          {...register('unit', { required: 'Unit is required' })}
        >
          {unitOptions.map((unit) => (
            <option key={unit} value={unit}>
              {unit}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          className="mb-2 block font-medium text-gray-900"
          htmlFor="calories_per_unit"
        >
          Calories per unit
        </label>
        <input
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-blue-600"
          id="calories_per_unit"
          inputMode="decimal"
          type="text"
          {...register('calories_per_unit', {
            required: 'Calories per unit is required',
            pattern: {
              value: /^\d+(\.\d{1,4})?$/,
              message:
                'Enter a positive number with up to 4 decimals (e.g. 1.25)',
            },
          })}
        />
        {errors.calories_per_unit ? (
          <p className="mt-2 text-sm text-red-600">
            {errors.calories_per_unit.message}
          </p>
        ) : null}
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
