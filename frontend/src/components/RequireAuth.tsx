import type { ReactNode } from 'react'
import { Navigate } from 'react-router'

import { useCurrentUserQuery } from '../queries/authQueries'
import { tokenStorage } from '../utils/tokenStorage'
import { StatusMessage } from './ui/StatusMessage'

type RequireAuthProps = {
  children: ReactNode
}

export const RequireAuth = ({ children }: RequireAuthProps) => {
  const currentUserQuery = useCurrentUserQuery()
  const hasToken = tokenStorage.hasAccessToken()

  if (hasToken && currentUserQuery.isPending) {
    return <StatusMessage loading>Loading...</StatusMessage>
  }

  if (!currentUserQuery.data) {
    return <Navigate to="/login" replace />
  }

  return children
}
