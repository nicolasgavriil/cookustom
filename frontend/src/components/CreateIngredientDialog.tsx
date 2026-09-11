import { useEffect, useRef } from 'react'

import type { Ingredient } from '../api/types'
import { useCreateIngredientMutation } from '../queries/ingredientQueries'
import { toIngredientCreateRequest } from '../utils/ingredientFormMappers'
import { IngredientForm } from './IngredientForm'
import type { IngredientFormValues } from './IngredientForm'
import { Button } from './ui/Button'

type CreateIngredientDialogProps = {
  onCreated: (ingredient: Ingredient) => void
  onClose: () => void
}

export const CreateIngredientDialog = ({
  onCreated,
  onClose,
}: CreateIngredientDialogProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const createIngredientMutation = useCreateIngredientMutation()
  const error =
    createIngredientMutation.error instanceof Error
      ? createIngredientMutation.error.message
      : null

  useEffect(() => {
    const dialog = dialogRef.current
    dialog?.showModal()
    return () => dialog?.close()
  }, [])

  const closeDialog = () => {
    dialogRef.current?.close()
    onClose()
  }

  const handleSubmit = (values: IngredientFormValues) => {
    createIngredientMutation.mutate(toIngredientCreateRequest(values), {
      onSuccess: (ingredient) => {
        dialogRef.current?.close()
        onCreated(ingredient)
      },
    })
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="create-ingredient-title"
      aria-describedby="create-ingredient-description"
      className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-xl border border-stone-200 bg-white p-5 text-stone-950 shadow-xl backdrop:bg-stone-950/40 sm:p-6"
      onCancel={(event) => {
        event.preventDefault()
        if (!createIngredientMutation.isPending) {
          closeDialog()
        }
      }}
    >
      <h2 id="create-ingredient-title" className="text-xl font-bold">
        Create ingredient
      </h2>
      <p id="create-ingredient-description" className="mt-2 text-sm text-stone-600">
        Save an ingredient to your library and select it for this recipe.
      </p>
      <IngredientForm
        className="mt-5"
        submitLabel="Create ingredient"
        error={error}
        isSubmitting={createIngredientMutation.isPending}
        onSubmit={handleSubmit}
      />
      <div className="mt-3 flex justify-end">
        <Button
          type="button"
          variant="ghost"
          disabled={createIngredientMutation.isPending}
          onClick={closeDialog}
        >
          Cancel
        </Button>
      </div>
    </dialog>
  )
}
