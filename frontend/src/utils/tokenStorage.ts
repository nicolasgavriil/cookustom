const ACCESS_TOKEN_KEY = 'recipe_app_access_token'

export const tokenStorage = {
  getAccessToken: () => localStorage.getItem(ACCESS_TOKEN_KEY),
  hasAccessToken: () => localStorage.getItem(ACCESS_TOKEN_KEY) !== null,
  setAccessToken: (token: string) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, token)
  },
  clearAccessToken: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
  },
}
