import { useFieldArray, useForm } from 'react-hook-form'

import type { Ingredient } from '../api/types'

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
      className="mt-8 flex max-w-3xl flex-col gap-5"
      onSubmit={handleSubmit(submitForm)}
    >
      <div>
        <label className="mb-2 block font-medium text-gray-900" htmlFor="title">
          Title
        </label>
        <input
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-blue-600"
          id="title"
          type="text"
          {...register('title', {
            required: 'Title is required',
            validate: (value) => value.trim().length > 0 || 'Title is required',
            maxLength: {
              value: 255,
              message: 'Title must be 255 characters or fewer',
            },
          })}
        />
        {errors.title ? (
          <p className="mt-2 text-sm text-red-600">{errors.title.message}</p>
        ) : null}
      </div>

      <div>
        <label
          className="mb-2 block font-medium text-gray-900"
          htmlFor="description"
        >
          Description
        </label>
        <textarea
          className="min-h-24 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-blue-600"
          id="description"
          {...register('description')}
        />
      </div>

      <div>
        <label
          className="mb-2 block font-medium text-gray-900"
          htmlFor="base_servings"
        >
          Base servings
        </label>
        <input
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-blue-600"
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
              Number.isInteger(value) || 'Base servings must be a whole number',
            valueAsNumber: true,
          })}
        />
        {errors.base_servings ? (
          <p className="mt-2 text-sm text-red-600">
            {errors.base_servings.message}
          </p>
        ) : null}
      </div>

      <div>
        <label
          className="mb-2 block font-medium text-gray-900"
          htmlFor="instructions"
        >
          Instructions
        </label>
        <textarea
          className="min-h-40 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-blue-600"
          id="instructions"
          {...register('instructions', {
            required: 'Instructions are required',
            validate: (value) =>
              value.trim().length > 0 || 'Instructions are required',
          })}
        />
        {errors.instructions ? (
          <p className="mt-2 text-sm text-red-600">
            {errors.instructions.message}
          </p>
        ) : null}
      </div>

      <div>
        <div className="flex items-center justify-between gap-4">
          <h2 className="m-0 text-2xl text-gray-900">Ingredients</h2>
          <button
            className="rounded-md bg-gray-900 px-3 py-2 text-sm font-semibold text-white"
            type="button"
            onClick={() => append(emptyIngredientRow)}
          >
            Add ingredient
          </button>
        </div>

        <div className="mt-4 flex flex-col gap-4">
          {fields.map((field, index) => (
            <div
              className="grid gap-3 border-b border-gray-200 pb-4 sm:grid-cols-[1fr_12rem_auto]"
              key={field.id}
            >
              <div>
                <label
                  className="mb-2 block font-medium text-gray-900"
                  htmlFor={`ingredients.${index}.ingredient_id`}
                >
                  Ingredient
                </label>
                <select
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-blue-600"
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
                  <p className="mt-2 text-sm text-red-600">
                    {errors.ingredients[index]?.ingredient_id?.message}
                  </p>
                ) : null}
              </div>

              <div>
                <label
                  className="mb-2 block font-medium text-gray-900"
                  htmlFor={`ingredients.${index}.quantity`}
                >
                  Quantity
                </label>
                <input
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-blue-600"
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
                  <p className="mt-2 text-sm text-red-600">
                    {errors.ingredients[index]?.quantity?.message}
                  </p>
                ) : null}
              </div>

              <button
                className="self-end rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-red-300"
                type="button"
                disabled={fields.length === 1}
                onClick={() => remove(index)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {errors.root?.duplicateIngredients ? (
          <p className="mt-2 text-sm text-red-600">
            {errors.root.duplicateIngredients.message}
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
