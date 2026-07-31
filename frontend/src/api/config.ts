const LOCAL_API_BASE_URL = 'http://localhost:8000'

const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL ??
  (import.meta.env.DEV ? LOCAL_API_BASE_URL : undefined)

if (!apiBaseUrl) {
  throw new Error('VITE_API_BASE_URL must be set')
}

export const API_BASE_URL = apiBaseUrl
