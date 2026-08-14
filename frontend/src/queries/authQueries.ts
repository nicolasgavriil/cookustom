import {
  type QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import type { LoginRequest, UserCreateRequest } from '../api/types'
import * as authService from '../services/authService'
import { tokenStorage } from '../utils/tokenStorage'
import { ingredientsQueryKey } from './ingredientQueries'
import { recipesQueryKey } from './recipeQueries'

export const currentUserQueryKey = ['currentUser'] as const

const clearUserScopedQueryData = (queryClient: QueryClient) => {
  queryClient.removeQueries({ queryKey: ingredientsQueryKey })
  queryClient.removeQueries({ queryKey: recipesQueryKey })
}

export const useCurrentUserQuery = () => {
  const hasToken = tokenStorage.hasAccessToken()

  return useQuery({
    queryKey: currentUserQueryKey,
    queryFn: authService.getCurrentUser,
    enabled: hasToken,
  })
}

export const useLoginMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (request: LoginRequest) => {
      const token = await authService.login(request)
      tokenStorage.setAccessToken(token.access_token)

      return authService.getCurrentUser()
    },
    onSuccess: (user) => {
      clearUserScopedQueryData(queryClient)
      queryClient.setQueryData(currentUserQueryKey, user)
    },
  })
}

export const useRegisterMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (request: UserCreateRequest) => {
      await authService.register(request)

      const token = await authService.login(request)
      tokenStorage.setAccessToken(token.access_token)

      return authService.getCurrentUser()
    },
    onSuccess: (user) => {
      clearUserScopedQueryData(queryClient)
      queryClient.setQueryData(currentUserQueryKey, user)
    },
  })
}

export const useDemoSessionMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const token = await authService.createDemoSession()
      tokenStorage.setAccessToken(token.access_token)

      return authService.getCurrentUser()
    },
    onSuccess: (user) => {
      clearUserScopedQueryData(queryClient)
      queryClient.setQueryData(currentUserQueryKey, user)
    },
  })
}

export const useLogout = () => {
  const queryClient = useQueryClient()

  return () => {
    authService.logout()
    clearUserScopedQueryData(queryClient)
    queryClient.setQueryData(currentUserQueryKey, null)
  }
}
