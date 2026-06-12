import { API_BASE_URL } from '../api/config'
import type {
  ApiErrorResponse,
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
  return fetchJson<User>('/auth/register', {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify(request),
  })
}

export async function login(request: LoginRequest): Promise<TokenResponse> {
  return fetchJson<TokenResponse>('/auth/login', {
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

  return fetchJson<User>('/auth/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

export function logout(): void {
  tokenStorage.clearAccessToken()
}

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, init)

  if (!response.ok) {
    throw new Error(await getErrorMessage(response))
  }

  return response.json() as Promise<T>
}

async function getErrorMessage(response: Response): Promise<string> {
  try {
    const error = (await response.json()) as ApiErrorResponse
    return error.detail || 'Request failed'
  } catch {
    return 'Request failed'
  }
}
