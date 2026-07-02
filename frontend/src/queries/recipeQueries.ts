import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type { RecipeCreateRequest, RecipeUpdateRequest } from '../api/types'
import * as recipeService from '../services/recipeService'

export const recipesQueryKey = ['recipes'] as const

export const recipeQueryKey = (recipeId: number) =>
  [...recipesQueryKey, recipeId] as const

export const useRecipesQuery = () => {
  return useQuery({
    queryKey: recipesQueryKey,
    queryFn: recipeService.listRecipes,
  })
}

export const useRecipeQuery = (recipeId: number) => {
  return useQuery({
    queryKey: recipeQueryKey(recipeId),
    queryFn: () => recipeService.getRecipe(recipeId),
  })
}

export const useCreateRecipeMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: RecipeCreateRequest) =>
      recipeService.createRecipe(request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: recipesQueryKey })
    },
  })
}

export const useUpdateRecipeMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      recipeId,
      request,
    }: {
      recipeId: number
      request: RecipeUpdateRequest
    }) => recipeService.updateRecipe(recipeId, request),
    onSuccess: (recipe) => {
      queryClient.setQueryData(recipeQueryKey(recipe.id), recipe)
      void queryClient.invalidateQueries({ queryKey: recipesQueryKey })
    },
  })
}

export const useDeleteRecipeMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (recipeId: number) => recipeService.deleteRecipe(recipeId),
    onSuccess: (_data, recipeId) => {
      queryClient.removeQueries({ queryKey: recipeQueryKey(recipeId) })
      void queryClient.invalidateQueries({ queryKey: recipesQueryKey })
    },
  })
}
