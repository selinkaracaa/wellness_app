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

export interface AuthState {
  userName?: string
  profile?: UserProfile
  level?: number
  xp?: number
  xpToNextLevel?: number
  streak?: number
  longestStreak?: number
  totalCheckIns?: number
  todayCheckedIn?: boolean
  todayAnswers?: Record<string, number>
  [key: string]: unknown
}

export interface AuthResult {
  token: string
  state: AuthState
}

/** One persisted check-in as returned by GET /api/checkins (date is 'YYYY-MM-DD'). */
export interface CheckInRecord {
  date: string
  answers: Record<string, number>
  xpEarned: number
  completedAt: string
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

export interface ProfileUpdate {
  name?: string
  age?: number | null
  heightCm?: number | null
  weightKg?: number | null
}

/**
 * Persist profile edits (name/age/height/weight) for the signed-in user and
 * return the refreshed server state. Requires a stored token.
 */
export async function updateProfileRequest(update: ProfileUpdate): Promise<AuthState> {
  const token = getToken()
  const body: Record<string, unknown> = {}
  if (update.name !== undefined) body.name = update.name
  if (update.age !== undefined) body.age = update.age
  if (update.heightCm !== undefined) body.height_cm = update.heightCm
  if (update.weightKg !== undefined) body.weight_kg = update.weightKg

  let res: Response
  try {
    res = await fetch(`${BASE}/api/me`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    })
  } catch {
    throw new Error('Could not reach the server. Is the API running (npm run server)?')
  }

  const data = (await res.json().catch(() => ({}))) as { error?: string; state?: AuthState }
  if (!res.ok) {
    throw new Error(typeof data?.error === 'string' ? data.error : `Request failed (${res.status})`)
  }
  return data.state ?? {}
}

/**
 * Fetch the signed-in user's full check-in history (most recent first).
 * Requires a token to already be stored (call after signup/login set it).
 */
export async function checkInsRequest(): Promise<CheckInRecord[]> {
  const token = getToken()
  let res: Response
  try {
    res = await fetch(`${BASE}/api/checkins`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
  } catch {
    throw new Error('Could not reach the server. Is the API running (npm run server)?')
  }

  const data = (await res.json().catch(() => ({}))) as { error?: string; checkIns?: CheckInRecord[] }
  if (!res.ok) {
    throw new Error(typeof data?.error === 'string' ? data.error : `Request failed (${res.status})`)
  }
  return Array.isArray(data.checkIns) ? data.checkIns : []
}
