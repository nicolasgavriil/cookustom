export type User = {
  id: number
  email: string
  created_at: string
}

export type UserCreateRequest = {
  email: string
  password: string
}

export type LoginRequest = {
  email: string
  password: string
}

export type TokenResponse = {
  access_token: string
  token_type: 'bearer'
}

export type ApiErrorResponse = {
  detail: string
}
