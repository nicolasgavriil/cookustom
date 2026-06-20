import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type { LoginRequest, UserCreateRequest } from '../api/types'
import * as authService from '../services/authService'
import { tokenStorage } from '../utils/tokenStorage'

export const currentUserQueryKey = ['currentUser'] as const

export const useCurrentUserQuery = () => {
  const hasToken = tokenStorage.getAccessToken() !== null

  return useQuery({
    queryKey: currentUserQueryKey,
    queryFn: authService.getCurrentUser,
    enabled: hasToken,
    initialData: null,
    retry: false,
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
      queryClient.setQueryData(currentUserQueryKey, user)
    },
  })
}

export const useLogout = () => {
  const queryClient = useQueryClient()

  return () => {
    authService.logout()
    queryClient.setQueryData(currentUserQueryKey, null)
  }
}
