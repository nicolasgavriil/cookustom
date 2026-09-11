import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type {
  Ingredient,
  IngredientCreateRequest,
  IngredientUpdateRequest,
} from '../api/types'
import * as ingredientService from '../services/ingredientService'

export const ingredientsQueryKey = ['ingredients'] as const

export const useIngredientsQuery = () => {
  return useQuery({
    queryKey: ingredientsQueryKey,
    queryFn: ingredientService.listIngredients,
  })
}

export const useCreateIngredientMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: IngredientCreateRequest) =>
      ingredientService.createIngredient(request),
    onSuccess: (createdIngredient) => {
      queryClient.setQueryData<Ingredient[]>(
        ingredientsQueryKey,
        (cachedIngredients) => {
          if (cachedIngredients === undefined) {
            return undefined
          }

          const otherIngredients = cachedIngredients.filter(
            (existing) => existing.id !== createdIngredient.id,
          )

          return [...otherIngredients, createdIngredient].sort((left, right) =>
            left.name.localeCompare(right.name),
          )
        },
      )
      void queryClient.invalidateQueries({ queryKey: ingredientsQueryKey })
    },
  })
}

export const useUpdateIngredientMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      ingredientId,
      request,
    }: {
      ingredientId: number
      request: IngredientUpdateRequest
    }) => ingredientService.updateIngredient(ingredientId, request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ingredientsQueryKey })
    },
  })
}

export const useDeleteIngredientMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (ingredientId: number) =>
      ingredientService.deleteIngredient(ingredientId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ingredientsQueryKey })
    },
  })
}
