import type { ReactNode } from 'react'
import { Navigate } from 'react-router'

import { useCurrentUserQuery } from '../queries/authQueries'

type RequireAuthProps = {
  children: ReactNode
}

export const RequireAuth = ({ children }: RequireAuthProps) => {
  const currentUserQuery = useCurrentUserQuery()

  if (currentUserQuery.isPending) {
    return <p className="mx-auto max-w-5xl text-gray-600">Loading...</p>
  }

  if (!currentUserQuery.data) {
    return <Navigate to="/login" replace />
  }

  return children
}
