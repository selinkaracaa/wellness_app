/**
 * Thin client for the Bloom/Cycles auth API. The rest of the app is
 * localStorage-backed; only authentication talks to the Express backend.
 *
 * Requests go to `/api/...` and are proxied to http://localhost:4000 by Vite in
 * dev (see vite.config.ts). Override the origin in other environments with
 * VITE_API_BASE (e.g. "https://api.example.com").
 */

/** Body metrics captured at sign-up and used to tailor recommendations. */
export interface UserProfile {
  age: number | null
  heightCm: number | null
  weightKg: number | null
}

interface AuthState {
  userName?: string
  profile?: UserProfile
  [key: string]: unknown
}

export interface AuthResult {
  token: string
  state: AuthState
}

export interface SignupInput {
  name: string
  email: string
  password: string
  age: number | null
  heightCm: number | null
  weightKg: number | null
}

const BASE = (import.meta.env.VITE_API_BASE as string | undefined)?.replace(/\/$/, '') ?? ''
const TOKEN_KEY = 'wellness_token'

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token)
  } catch {
    // ignore storage quota / privacy-mode errors
  }
}

export function clearToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY)
  } catch {
    // ignore
  }
}

async function postAuth(path: string, body: unknown): Promise<AuthResult> {
  let res: Response
  try {
    res = await fetch(`${BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  } catch {
    throw new Error('Could not reach the server. Is the API running (npm run server)?')
  }

  const data = (await res.json().catch(() => ({}))) as { error?: string } & AuthResult
  if (!res.ok) {
    throw new Error(typeof data?.error === 'string' ? data.error : `Request failed (${res.status})`)
  }
  return data
}

export function signupRequest(input: SignupInput): Promise<AuthResult> {
  return postAuth('/api/auth/signup', {
    name: input.name,
    email: input.email,
    password: input.password,
    age: input.age,
    height_cm: input.heightCm,
    weight_kg: input.weightKg,
  })
}

export function loginRequest(email: string, password: string): Promise<AuthResult> {
  return postAuth('/api/auth/login', { email, password })
}
