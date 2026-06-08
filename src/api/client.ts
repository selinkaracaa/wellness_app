import type { AppState, AuthResponse } from './types'

const TOKEN_KEY = 'wellness_token'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}
export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
}
export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  const res = await fetch(`/api${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
  const data = res.status === 204 ? null : await res.json().catch(() => null)
  if (!res.ok) {
    throw new ApiError(res.status, data?.error ?? `Request failed (${res.status})`)
  }
  return data as T
}

export const api = {
  signup: (name: string, email: string, password: string) =>
    request<AuthResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),

  login: (email: string, password: string) =>
    request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  me: () => request<{ state: AppState }>('/me'),

  submitCheckIn: (answers: Record<string, number>) =>
    request<{ state: AppState }>('/checkins', {
      method: 'POST',
      body: JSON.stringify({ answers }),
    }),

  likeActivity: (activityId: string) =>
    request<{ state: AppState }>(`/social/activities/${activityId}/like`, { method: 'POST' }),

  joinChallenge: (challengeId: string) =>
    request<{ state: AppState }>(`/challenges/${challengeId}/join`, { method: 'POST' }),
}
