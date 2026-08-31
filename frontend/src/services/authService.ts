import {
  ApiError,
  apiRequest,
  authenticatedApiRequest,
} from '../api/fetchApi'
import type {
  LoginRequest,
  TokenResponse,
  User,
  UserCreateRequest,
} from '../api/types'
import { tokenStorage } from '../utils/tokenStorage'

const jsonHeaders = {
  'Content-Type': 'application/json',
}

export async function register(request: UserCreateRequest): Promise<User> {
  return apiRequest<User>('/auth/register', {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify(request),
  })
}

export async function login(request: LoginRequest): Promise<TokenResponse> {
  return apiRequest<TokenResponse>('/auth/login', {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify(request),
  })
}

export async function createDemoSession(): Promise<TokenResponse> {
  return apiRequest<TokenResponse>('/demo', {
    method: 'POST',
  })
}

export async function getCurrentUser(): Promise<User | null> {
  const token = tokenStorage.getAccessToken()

  if (!token) {
    return null
  }

  try {
    return await authenticatedApiRequest<User>('/auth/me')
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      tokenStorage.clearAccessToken()
      return null
    }

    throw error
  }
}

export function logout(): void {
  tokenStorage.clearAccessToken()
}
