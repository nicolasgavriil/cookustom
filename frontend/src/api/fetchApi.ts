import { API_BASE_URL } from './config'
import { getApiErrorMessage, getNetworkErrorMessage } from './errors'
import type { TokenResponse } from './types'
import { tokenStorage } from '../utils/tokenStorage'

export class ApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export const apiRequest = async <T>(
  path: string,
  init?: RequestInit,
): Promise<T> => {
  const response = await sendApiRequest(path, init)

  return parseApiResponse<T>(response)
}

export const authenticatedApiRequest = async <T>(
  path: string,
  init?: RequestInit,
): Promise<T> => {
  const accessToken = tokenStorage.getAccessToken()
  const response = await sendApiRequest(
    path,
    withAccessToken(accessToken, init),
  )

  if (response.status !== 401 || accessToken === null) {
    return parseApiResponse<T>(response)
  }

  let refreshedAccessToken: string

  try {
    refreshedAccessToken = await refreshAccessToken()
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      tokenStorage.clearAccessToken()
    }

    throw error
  }

  const retryResponse = await sendApiRequest(
    path,
    withAccessToken(refreshedAccessToken, init),
  )

  if (retryResponse.status === 401) {
    tokenStorage.clearAccessToken()
  }

  return parseApiResponse<T>(retryResponse)
}

const sendApiRequest = async (
  path: string,
  init?: RequestInit,
): Promise<Response> => {
  let response: Response

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      credentials: 'include',
    })
  } catch (error) {
    throw new Error(getNetworkErrorMessage(error), { cause: error })
  }

  return response
}

const parseApiResponse = async <T>(
  response: Response,
): Promise<T> => {
  if (!response.ok) {
    throw new ApiError(await getApiErrorMessage(response), response.status)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

const withAccessToken = (
  accessToken: string | null,
  init?: RequestInit,
): RequestInit => {
  const headers = new Headers(init?.headers)

  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`)
  } else {
    headers.delete('Authorization')
  }

  return { ...init, headers }
}

const refreshAccessToken = async (): Promise<string> => {
  const response = await sendApiRequest('/auth/refresh', {
    method: 'POST',
  })
  const token = await parseApiResponse<TokenResponse>(response)
  tokenStorage.setAccessToken(token.access_token)

  return token.access_token
}
