import { useQuery } from '@tanstack/react-query'

import * as ingredientService from '../services/ingredientService'

export const ingredientsQueryKey = ['ingredients'] as const

export const useIngredientsQuery = () => {
  return useQuery({
    queryKey: ingredientsQueryKey,
    queryFn: ingredientService.listIngredients,
  })
}
