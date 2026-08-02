import { API_BASE_URL } from './config'
import { getApiErrorMessage, getNetworkErrorMessage } from './errors'

export class ApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export const fetchApi = async (
  path: string,
  init?: RequestInit,
): Promise<Response> => {
  let response: Response

  try {
    response = await fetch(`${API_BASE_URL}${path}`, init)
  } catch (error) {
    throw new Error(getNetworkErrorMessage(error), { cause: error })
  }

  if (!response.ok) {
    throw new ApiError(await getApiErrorMessage(response), response.status)
  }

  return response
}

export const fetchApiJson = async <T>(
  path: string,
  init?: RequestInit,
): Promise<T> => {
  const response = await fetchApi(path, init)
  return response.json() as Promise<T>
}
