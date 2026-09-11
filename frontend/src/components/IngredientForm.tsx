import { useForm, useWatch } from 'react-hook-form'

import type { IngredientUnit } from '../api/types'
import { calculateCaloriesPerUnit } from '../utils/ingredientFormMappers'
import { Button } from './ui/Button'

export type IngredientFormValues = {
  name: string
  unit: IngredientUnit
  labelQuantity: string
  labelCalories: string
}

type IngredientFormProps = {
  className?: string
  defaultValues?: IngredientFormValues
  submitLabel: string
  error: string | null
  isSubmitting: boolean
  onSubmit: (values: IngredientFormValues) => void
}

const unitOptions: IngredientUnit[] = ['g', 'ml', 'piece']
const decimalPattern = /^\d+(\.\d{1,4})?$/
const unitNames: Record<IngredientUnit, string> = {
  g: 'gram',
  ml: 'milliliter',
  piece: 'piece',
}

export const IngredientForm = ({
  className = 'mt-8 max-w-md rounded-lg border border-stone-200 bg-white/85 p-5 shadow-sm sm:p-6',
  defaultValues,
  submitLabel,
  error,
  isSubmitting,
  onSubmit,
}: IngredientFormProps) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<IngredientFormValues>({
    defaultValues: defaultValues ?? {
      name: '',
      unit: 'g',
      labelQuantity: '1',
      labelCalories: '',
    },
  })
  const [labelQuantity, labelCalories, unit] = useWatch({
    control,
    name: ['labelQuantity', 'labelCalories', 'unit'],
  })
  const caloriesPerUnit = calculateCaloriesPerUnit(labelQuantity, labelCalories)
  const canPreview =
    decimalPattern.test(labelQuantity) &&
    decimalPattern.test(labelCalories) &&
    Number(labelQuantity) > 0 &&
    Number.isFinite(Number(labelQuantity)) &&
    Number.isFinite(Number(caloriesPerUnit))

  return (
    <form
      className={`flex flex-col gap-5 ${className}`}
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

      <div className="flex min-w-0 flex-col gap-5">
        <p className="font-medium text-stone-900">
          Calories from the label
        </p>
        <p id="label-help" className="text-sm text-stone-600">
          Enter the quantity and calories (kcal) shown on the product label.
          We’ll calculate the calories per unit for you. If you already know the
          calories per unit, use a quantity of 1.
        </p>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              className="mb-2 block font-medium text-stone-900"
              htmlFor="labelQuantity"
            >
              Label quantity
            </label>
            <input
              className="w-full rounded-md border border-stone-300 bg-white px-3 py-2.5 text-stone-950 outline-emerald-700 focus:border-emerald-700"
              id="labelQuantity"
              type="text"
              inputMode="decimal"
              aria-describedby={
                errors.labelQuantity ? 'quantity-error label-help' : 'label-help'
              }
              aria-invalid={Boolean(errors.labelQuantity)}
              {...register('labelQuantity', {
                required: 'Label quantity is required',
                pattern: {
                  value: decimalPattern,
                  message: 'Enter a number with up to 4 decimals (e.g. 14 or 2.5)',
                },
                validate: (value) =>
                  (Number.isFinite(Number(value)) && Number(value) > 0) ||
                  'Enter a quantity greater than zero (e.g. 14 or 2.5)',
              })}
            />
            {errors.labelQuantity ? (
              <p id="quantity-error" className="mt-2 text-sm text-rose-700">
                {errors.labelQuantity.message}
              </p>
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
        </div>

        <div>
          <label
            className="mb-2 block font-medium text-stone-900"
            htmlFor="labelCalories"
          >
            Calories (kcal)
          </label>
          <input
            className="w-full rounded-md border border-stone-300 bg-white px-3 py-2.5 text-stone-950 outline-emerald-700 focus:border-emerald-700"
            id="labelCalories"
            inputMode="decimal"
            type="text"
            aria-describedby={
              errors.labelCalories ? 'calories-error label-help' : 'label-help'
            }
            aria-invalid={Boolean(errors.labelCalories)}
            {...register('labelCalories', {
              required: 'Calories are required',
              pattern: {
                value: decimalPattern,
                message:
                  'Enter zero or a positive number with up to 4 decimals (e.g. 1.25)',
              },
            })}
          />
          {errors.labelCalories ? (
            <p id="calories-error" className="mt-2 text-sm text-rose-700">
              {errors.labelCalories.message}
            </p>
          ) : null}
        </div>

        <output
          className="text-sm font-medium text-emerald-800"
          aria-live="polite"
          htmlFor="labelQuantity unit labelCalories"
        >
          {canPreview
            ? `${Number(caloriesPerUnit)} kcal per ${unitNames[unit]}`
            : null}
        </output>
      </div>

      {error ? <p className="m-0 text-sm text-rose-700">{error}</p> : null}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Please wait...' : submitLabel}
      </Button>
    </form>
  )
}
