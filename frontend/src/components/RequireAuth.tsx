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

  if (currentUserQuery.data) {
    return children
  }

  if (!hasToken) {
    return <Navigate to="/login" replace />
  }

  if (currentUserQuery.isPending) {
    return <StatusMessage loading>Loading...</StatusMessage>
  }

  if (currentUserQuery.isError) {
    return (
      <StatusMessage tone="danger">
        Unable to verify your session. Try again in a moment.
      </StatusMessage>
    )
  }

  return <Navigate to="/login" replace />
}
