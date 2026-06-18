import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type { IngredientCreateRequest } from '../api/types'
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
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ingredientsQueryKey })
    },
  })
}
