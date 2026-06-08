import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { api, getToken, setToken, clearToken, ApiError } from '../api/client'
import type { AppState } from '../api/types'

export type { AppState } from '../api/types'

type AuthStatus = 'loading' | 'unauthenticated' | 'authenticated'

interface AppContextType {
  state: AppState | null
  status: AuthStatus
  authError: string | null
  authPending: boolean
  login: (email: string, password: string) => Promise<boolean>
  signup: (name: string, email: string, password: string) => Promise<boolean>
  logout: () => void
  completeCheckIn: (answers: Record<string, number>, xp: number) => void
  likeActivity: (activityId: string) => void
  joinChallenge: (challengeId: string) => void
  tryItYourself: (questionKey: string) => void
  pendingCheckInQuestion: string | null
  clearPendingQuestion: () => void
}

const AppContext = createContext<AppContextType | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState | null>(null)
  const [status, setStatus] = useState<AuthStatus>(() => (getToken() ? 'loading' : 'unauthenticated'))
  const [authError, setAuthError] = useState<string | null>(null)
  const [authPending, setAuthPending] = useState(false)
  const [pendingCheckInQuestion, setPendingCheckInQuestion] = useState<string | null>(null)

  // On mount, if we have a token, hydrate state from the backend.
  useEffect(() => {
    if (!getToken()) return
    let cancelled = false
    api
      .me()
      .then((res) => {
        if (cancelled) return
        setState(res.state)
        setStatus('authenticated')
      })
      .catch(() => {
        if (cancelled) return
        clearToken()
        setState(null)
        setStatus('unauthenticated')
      })
    return () => {
      cancelled = true
    }
  }, [])

  const runAuth = useCallback(
    async (fn: () => Promise<{ token: string; state: AppState }>): Promise<boolean> => {
      setAuthPending(true)
      setAuthError(null)
      try {
        const { token, state: nextState } = await fn()
        setToken(token)
        setState(nextState)
        setStatus('authenticated')
        return true
      } catch (err) {
        setAuthError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.')
        return false
      } finally {
        setAuthPending(false)
      }
    },
    [],
  )

  const login = useCallback(
    (email: string, password: string) => runAuth(() => api.login(email, password)),
    [runAuth],
  )

  const signup = useCallback(
    (name: string, email: string, password: string) => runAuth(() => api.signup(name, email, password)),
    [runAuth],
  )

  const logout = useCallback(() => {
    clearToken()
    setState(null)
    setStatus('unauthenticated')
    setAuthError(null)
    setPendingCheckInQuestion(null)
  }, [])

  const completeCheckIn = useCallback((answers: Record<string, number>, _xp: number) => {
    // XP/level/streak are computed authoritatively on the server.
    api
      .submitCheckIn(answers)
      .then((res) => setState(res.state))
      .catch(() => {
        // e.g. already checked in today — resync from server.
        api.me().then((res) => setState(res.state)).catch(() => {})
      })
  }, [])

  const likeActivity = useCallback((activityId: string) => {
    // Optimistic toggle for snappy UI, reconciled with the server response.
    setState((prev) =>
      prev
        ? {
            ...prev,
            friendActivities: prev.friendActivities.map((a) =>
              a.id === activityId
                ? { ...a, liked: !a.liked, likes: a.liked ? a.likes - 1 : a.likes + 1 }
                : a,
            ),
          }
        : prev,
    )
    api
      .likeActivity(activityId)
      .then((res) => setState(res.state))
      .catch(() => {
        api.me().then((res) => setState(res.state)).catch(() => {})
      })
  }, [])

  const joinChallenge = useCallback((challengeId: string) => {
    setState((prev) =>
      prev
        ? {
            ...prev,
            challenges: prev.challenges.map((c) =>
              c.id === challengeId
                ? {
                    ...c,
                    joined: !c.joined,
                    participantCount: c.joined ? c.participantCount - 1 : c.participantCount + 1,
                  }
                : c,
            ),
          }
        : prev,
    )
    api
      .joinChallenge(challengeId)
      .then((res) => setState(res.state))
      .catch(() => {
        api.me().then((res) => setState(res.state)).catch(() => {})
      })
  }, [])

  const tryItYourself = useCallback((questionKey: string) => setPendingCheckInQuestion(questionKey), [])
  const clearPendingQuestion = useCallback(() => setPendingCheckInQuestion(null), [])

  return (
    <AppContext.Provider
      value={{
        state,
        status,
        authError,
        authPending,
        login,
        signup,
        logout,
        completeCheckIn,
        likeActivity,
        joinChallenge,
        tryItYourself,
        pendingCheckInQuestion,
        clearPendingQuestion,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

function useCtx(): AppContextType {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}

/** For auth screens and the route gate — state may be null. */
export function useAuth() {
  return useCtx()
}

/**
 * For pages rendered inside the authenticated tree, where state is guaranteed
 * to be loaded. Narrows `state` to non-null.
 */
export function useApp(): AppContextType & { state: AppState } {
  const ctx = useCtx()
  if (!ctx.state) throw new Error('useApp used before app state was loaded')
  return ctx as AppContextType & { state: AppState }
}
