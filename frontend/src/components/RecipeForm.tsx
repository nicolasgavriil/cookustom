import { Plus, Trash2 } from 'lucide-react'
import { useFieldArray, useForm } from 'react-hook-form'

import type { Ingredient } from '../api/types'
import { Button } from './ui/Button'

type RecipeIngredientFormValues = {
  ingredient_id: number
  quantity: string
}

export type RecipeFormValues = {
  title: string
  description: string
  base_servings: number
  instructions: string
  ingredients: RecipeIngredientFormValues[]
}

type RecipeFormProps = {
  availableIngredients: Ingredient[]
  defaultValues?: RecipeFormValues
  submitLabel: string
  error: string | null
  isSubmitting: boolean
  onSubmit: (values: RecipeFormValues) => void
}

const emptyIngredientRow: RecipeIngredientFormValues = {
  ingredient_id: 0,
  quantity: '',
}

const quantityPattern = /^(?=.*[1-9])\d+(\.\d{1,4})?$/

export const RecipeForm = ({
  availableIngredients,
  defaultValues,
  submitLabel,
  error,
  isSubmitting,
  onSubmit,
}: RecipeFormProps) => {
  const {
    control,
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<RecipeFormValues>({
    defaultValues: defaultValues ?? {
      title: '',
      description: '',
      base_servings: 1,
      instructions: '',
      ingredients: [emptyIngredientRow],
    },
  })
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'ingredients',
  })

  const submitForm = (values: RecipeFormValues) => {
    const ingredientIds = values.ingredients.map(
      (ingredient) => ingredient.ingredient_id,
    )

    if (ingredientIds.length !== new Set(ingredientIds).size) {
      setError('root.duplicateIngredients', {
        type: 'validate',
        message: 'Use each ingredient only once',
      })
      return
    }

    clearErrors('root.duplicateIngredients')
    onSubmit(values)
  }

  return (
    <form
      className="mt-8 flex max-w-4xl flex-col gap-6 rounded-lg border border-stone-200 bg-white/85 p-5 shadow-sm sm:p-6"
      onSubmit={handleSubmit(submitForm)}
    >
      <div className="grid gap-5 sm:grid-cols-[1fr_12rem]">
        <div>
          <label
            className="mb-2 block font-medium text-stone-900"
            htmlFor="title"
          >
            Title
          </label>
          <input
            className="w-full rounded-md border border-stone-300 bg-white px-3 py-2.5 text-stone-950 outline-emerald-700 focus:border-emerald-700"
            id="title"
            type="text"
            {...register('title', {
              required: 'Title is required',
              validate: (value) =>
                value.trim().length > 0 || 'Title is required',
              maxLength: {
                value: 255,
                message: 'Title must be 255 characters or fewer',
              },
            })}
          />
          {errors.title ? (
            <p className="mt-2 text-sm text-rose-700">
              {errors.title.message}
            </p>
          ) : null}
        </div>

        <div>
          <label
            className="mb-2 block font-medium text-stone-900"
            htmlFor="base_servings"
          >
            Base servings
          </label>
          <input
            className="w-full rounded-md border border-stone-300 bg-white px-3 py-2.5 text-stone-950 outline-emerald-700 focus:border-emerald-700"
            id="base_servings"
            min={1}
            step={1}
            type="number"
            {...register('base_servings', {
              required: 'Base servings is required',
              min: {
                value: 1,
                message: 'Base servings must be at least 1',
              },
              validate: (value) =>
                Number.isInteger(value) ||
                'Base servings must be a whole number',
              valueAsNumber: true,
            })}
          />
          {errors.base_servings ? (
            <p className="mt-2 text-sm text-rose-700">
              {errors.base_servings.message}
            </p>
          ) : null}
        </div>
      </div>

      <div>
        <label
          className="mb-2 block font-medium text-stone-900"
          htmlFor="description"
        >
          Description
        </label>
        <textarea
          className="min-h-24 w-full rounded-md border border-stone-300 bg-white px-3 py-2.5 text-stone-950 outline-emerald-700 focus:border-emerald-700"
          id="description"
          {...register('description')}
        />
      </div>

      <div>
        <label
          className="mb-2 block font-medium text-stone-900"
          htmlFor="instructions"
        >
          Instructions
        </label>
        <textarea
          className="min-h-40 w-full rounded-md border border-stone-300 bg-white px-3 py-2.5 text-stone-950 outline-emerald-700 focus:border-emerald-700"
          id="instructions"
          {...register('instructions', {
            required: 'Instructions are required',
            validate: (value) =>
              value.trim().length > 0 || 'Instructions are required',
          })}
        />
        {errors.instructions ? (
          <p className="mt-2 text-sm text-rose-700">
            {errors.instructions.message}
          </p>
        ) : null}
      </div>

      <div className="border-t border-stone-200 pt-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="m-0 text-xl font-bold text-stone-950">Ingredients</h2>
          <Button
            icon={<Plus className="size-4" aria-hidden="true" />}
            variant="secondary"
            type="button"
            onClick={() => append(emptyIngredientRow)}
          >
            Add ingredient
          </Button>
        </div>

        <div className="mt-4 flex flex-col">
          {fields.map((field, index) => (
            <div
              className="grid gap-3 border-b border-stone-200 py-4 first:pt-0 last:border-b-0 sm:grid-cols-[1fr_12rem_auto]"
              key={field.id}
            >
              <div>
                <label
                  className="mb-2 block font-medium text-stone-900"
                  htmlFor={`ingredients.${index}.ingredient_id`}
                >
                  Ingredient
                </label>
                <select
                  className="w-full rounded-md border border-stone-300 bg-white px-3 py-2.5 text-stone-950 outline-emerald-700 focus:border-emerald-700"
                  id={`ingredients.${index}.ingredient_id`}
                  {...register(`ingredients.${index}.ingredient_id`, {
                    valueAsNumber: true,
                    validate: (value) =>
                      value > 0 || 'Ingredient is required',
                  })}
                >
                  <option value={0}>Select ingredient</option>
                  {availableIngredients.map((ingredient) => (
                    <option key={ingredient.id} value={ingredient.id}>
                      {ingredient.name} ({ingredient.unit})
                    </option>
                  ))}
                </select>
                {errors.ingredients?.[index]?.ingredient_id ? (
                  <p className="mt-2 text-sm text-rose-700">
                    {errors.ingredients[index]?.ingredient_id?.message}
                  </p>
                ) : null}
              </div>

              <div>
                <label
                  className="mb-2 block font-medium text-stone-900"
                  htmlFor={`ingredients.${index}.quantity`}
                >
                  Quantity
                </label>
                <input
                  className="w-full rounded-md border border-stone-300 bg-white px-3 py-2.5 text-stone-950 outline-emerald-700 focus:border-emerald-700"
                  id={`ingredients.${index}.quantity`}
                  inputMode="decimal"
                  type="text"
                  {...register(`ingredients.${index}.quantity`, {
                    required: 'Quantity is required',
                    pattern: {
                      value: quantityPattern,
                      message:
                        'Enter a positive number with up to 4 decimals (e.g. 100.5)',
                    },
                  })}
                />
                {errors.ingredients?.[index]?.quantity ? (
                  <p className="mt-2 text-sm text-rose-700">
                    {errors.ingredients[index]?.quantity?.message}
                  </p>
                ) : null}
              </div>

              <Button
                className="self-end"
                icon={<Trash2 className="size-4" aria-hidden="true" />}
                variant="danger"
                type="button"
                disabled={fields.length === 1}
                onClick={() => remove(index)}
              >
                Remove
              </Button>
            </div>
          ))}
        </div>

        {errors.root?.duplicateIngredients ? (
          <p className="mt-2 text-sm text-rose-700">
            {errors.root.duplicateIngredients.message}
          </p>
        ) : null}
      </div>

      {error ? <p className="m-0 text-sm text-rose-700">{error}</p> : null}

      <div className="flex justify-end border-t border-stone-200 pt-6">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Please wait...' : submitLabel}
        </Button>
      </div>
    </form>
  )
}
