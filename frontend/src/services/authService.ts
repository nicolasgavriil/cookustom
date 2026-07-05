import { fetchApiJson } from '../api/fetchApi'
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
  return fetchApiJson<User>('/auth/register', {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify(request),
  })
}

export async function login(request: LoginRequest): Promise<TokenResponse> {
  return fetchApiJson<TokenResponse>('/auth/login', {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify(request),
  })
}

export async function getCurrentUser(): Promise<User | null> {
  const token = tokenStorage.getAccessToken()

  if (!token) {
    return null
  }

  return fetchApiJson<User>('/auth/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

export function logout(): void {
  tokenStorage.clearAccessToken()
}
