const fallbackErrorMessage = 'Request failed'

type ApiErrorResponse = {
  detail?: unknown
}

export const getApiErrorMessage = async (
  response: Response,
): Promise<string> => {
  try {
    const error = (await response.json()) as ApiErrorResponse
    return typeof error.detail === 'string' && error.detail
      ? error.detail
      : fallbackErrorMessage
  } catch {
    return fallbackErrorMessage
  }
}

export const getNetworkErrorMessage = (error: unknown): string => {
  if (error instanceof TypeError) {
    return 'Unable to reach the server'
  }

  if (error instanceof Error) {
    return error.message
  }

  return fallbackErrorMessage
}
