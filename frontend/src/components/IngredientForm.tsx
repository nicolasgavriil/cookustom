import { useForm } from 'react-hook-form'

import type { IngredientUnit } from '../api/types'
import { Button } from './ui/Button'

export type IngredientFormValues = {
  name: string
  unit: IngredientUnit
  calories_per_unit: string
}

type IngredientFormProps = {
  defaultValues?: IngredientFormValues
  submitLabel: string
  error: string | null
  isSubmitting: boolean
  onSubmit: (values: IngredientFormValues) => void
}

const unitOptions: IngredientUnit[] = ['g', 'ml', 'piece']

export const IngredientForm = ({
  defaultValues,
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
    defaultValues: defaultValues ?? {
      name: '',
      unit: 'g',
      calories_per_unit: '',
    },
  })

  return (
    <form
      className="mt-8 flex max-w-md flex-col gap-5 rounded-lg border border-stone-200 bg-white/85 p-5 shadow-sm sm:p-6"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div>
        <label className="mb-2 block font-medium text-stone-900" htmlFor="name">
          Name
        </label>
        <input
          className="w-full rounded-md border border-stone-300 bg-white px-3 py-2.5 text-stone-950 outline-emerald-700 focus:border-emerald-700"
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
          <p className="mt-2 text-sm text-rose-700">{errors.name.message}</p>
        ) : null}
      </div>

      <div>
        <label className="mb-2 block font-medium text-stone-900" htmlFor="unit">
          Unit
        </label>
        <select
          className="w-full rounded-md border border-stone-300 bg-white px-3 py-2.5 text-stone-950 outline-emerald-700 focus:border-emerald-700"
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
          className="mb-2 block font-medium text-stone-900"
          htmlFor="calories_per_unit"
        >
          Calories per unit
        </label>
        <input
          className="w-full rounded-md border border-stone-300 bg-white px-3 py-2.5 text-stone-950 outline-emerald-700 focus:border-emerald-700"
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
          <p className="mt-2 text-sm text-rose-700">
            {errors.calories_per_unit.message}
          </p>
        ) : null}
      </div>

      {error ? <p className="m-0 text-sm text-rose-700">{error}</p> : null}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Please wait...' : submitLabel}
      </Button>
    </form>
  )
}
