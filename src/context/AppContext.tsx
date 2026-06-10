import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import {
  FRIEND_ACTIVITIES,
  BADGES,
  CYCLES,
  CYCLE_PHOTO_POSTS,
  DAILY_PHOTO_CHALLENGE,
  CYCLE_LEADERBOARD,
} from '../data/mockData'
import type { FriendActivity, Badge, Cycle, CyclePhotoPost, DailyPhotoChallenge, CycleLeaderboardEntry } from '../data/mockData'
import type { CoreMetric, GoalId } from '../data/habitPool'
import { curateMetricsForGoals, recalibrateMetrics } from '../utils/aiRecalibration'
import { calculateConsistencyStreak, isWeeklyRecalibrationDue } from '../utils/streak'
import { classifyImage } from '../utils/cvClassifier'
import { createDemoState, isDemoMode } from '../design/demoState'
import {
  signupRequest,
  loginRequest,
  checkInsRequest,
  setToken,
  clearToken,
  type SignupInput,
  type UserProfile,
} from '../utils/api'

export interface CheckInEntry {
  date: string
  answers: Record<string, number>
  xpEarned: number
  completedAt: string
}

export interface AppState {
  userName: string
  profile: UserProfile | null
  avatar: string
  level: number
  xp: number
  xpToNextLevel: number
  streak: number
  longestStreak: number
  totalCheckIns: number
  checkIns: CheckInEntry[]
  todayCheckedIn: boolean
  todayAnswers: Record<string, number>
  friendActivities: FriendActivity[]
  badges: Badge[]
  activeCheckInStep: number
  onboardingComplete: boolean
  goals: GoalId[]
  coreMetrics: CoreMetric[]
  weekStartDate: string
  weeklyRecalibrationPending: boolean
  activeCycleId: string
  cycles: Cycle[]
  cyclePosts: CyclePhotoPost[]
  dailyPhotoChallenge: DailyPhotoChallenge
  todayPhotoSubmitted: boolean
  todayPhotoUrl: string | null
  cycleLeaderboard: CycleLeaderboardEntry[]
  consistencyPoints: number
}

interface AppContextType {
  state: AppState
  signup: (input: SignupInput) => Promise<void>
  login: (email: string, password: string) => Promise<void>
  completeCheckIn: (answers: Record<string, number>, xp: number) => void
  completeOnboarding: (goals: GoalId[], userName: string) => void
  completeWeeklyRecalibration: (subjectiveScore: number) => void
  submitPhotoChallenge: (imageDataUrl: string) => Promise<{ verified: boolean; message: string }>
  setActiveCycle: (cycleId: string) => void
  likeActivity: (activityId: string) => void
  nudgeMember: (friendId: string) => void
  tryItYourself: (questionKey: string) => void
  pendingCheckInQuestion: string | null
  clearPendingQuestion: () => void
  loadDemo: () => void
  logout: () => void
  resetExperience: () => void
}

function getWeekStart(): string {
  const d = new Date()
  d.setDate(d.getDate() - d.getDay())
  return d.toDateString()
}

/** Coerce a server profile payload into a clean UserProfile, with fallbacks. */
function normalizeProfile(raw: unknown, fallback: UserProfile | null): UserProfile {
  const p = (raw ?? {}) as Partial<UserProfile>
  const num = (v: unknown, fb: number | null): number | null =>
    typeof v === 'number' && Number.isFinite(v) ? v : fb
  return {
    age: num(p.age, fallback?.age ?? null),
    heightCm: num(p.heightCm, fallback?.heightCm ?? null),
    weightKg: num(p.weightKg, fallback?.weightKg ?? null),
  }
}

/** Pull a finite number off an untyped payload, else fall back. */
function numOr(v: unknown, fallback: number): number {
  return typeof v === 'number' && Number.isFinite(v) ? v : fallback
}

/**
 * Server check-ins carry a 'YYYY-MM-DD' date, but the app's streak/week utils
 * key off `Date.toDateString()`. Convert via local-midnight so the calendar day
 * is preserved regardless of timezone (never `new Date('YYYY-MM-DD')`, which is UTC).
 */
function serverDateToKey(raw: string): string {
  const [y, m, d] = raw.slice(0, 10).split('-').map(Number)
  return new Date(y, m - 1, d).toDateString()
}

const defaultState: AppState = {
  userName: 'You',
  profile: null,
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=85&auto=format&fit=crop',
  level: 1,
  xp: 0,
  xpToNextLevel: 500,
  streak: 0,
  longestStreak: 0,
  totalCheckIns: 0,
  checkIns: [],
  todayCheckedIn: false,
  todayAnswers: {},
  friendActivities: FRIEND_ACTIVITIES,
  badges: BADGES,
  activeCheckInStep: 0,
  onboardingComplete: false,
  goals: [],
  coreMetrics: [],
  weekStartDate: getWeekStart(),
  weeklyRecalibrationPending: false,
  activeCycleId: 'cycle-family',
  cycles: CYCLES,
  cyclePosts: CYCLE_PHOTO_POSTS,
  dailyPhotoChallenge: DAILY_PHOTO_CHALLENGE,
  todayPhotoSubmitted: false,
  todayPhotoUrl: null,
  cycleLeaderboard: CYCLE_LEADERBOARD,
  consistencyPoints: 0,
}

const STORAGE_KEY = 'wellness_app_state_v2'

function loadState(): AppState {
  if (isDemoMode()) {
    const demo = createDemoState()
    const merged = { ...defaultState, ...demo }
    const { streak, longestStreak } = calculateConsistencyStreak(merged.checkIns)
    merged.streak = streak
    merged.longestStreak = Math.max(merged.longestStreak, longestStreak)
    return merged
  }

  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved) as Partial<AppState> & { lastCheckInDate?: string }
      const today = new Date().toDateString()
      if (parsed.lastCheckInDate !== today) {
        parsed.todayCheckedIn = false
        parsed.todayAnswers = {}
        parsed.todayPhotoSubmitted = false
        parsed.todayPhotoUrl = null
      }
      const merged = { ...defaultState, ...parsed }
      const { streak, longestStreak } = calculateConsistencyStreak(merged.checkIns)
      merged.streak = streak
      merged.longestStreak = Math.max(merged.longestStreak, longestStreak)
      if (merged.onboardingComplete && isWeeklyRecalibrationDue(merged.weekStartDate)) {
        merged.weeklyRecalibrationPending = true
      }
      return merged
    }
  } catch {
    // ignore
  }
  return defaultState
}

function updateBadges(prev: Badge[], ctx: { totalCheckIns: number; streak: number; todayPhotoSubmitted: boolean; weeklyDone: boolean }): Badge[] {
  return prev.map((b) => {
    if (b.earned) return b
    let earned = false
    if (b.id === 'b1' && ctx.totalCheckIns >= 1) earned = true
    if (b.id === 'b3' && ctx.streak >= 7) earned = true
    if (b.id === 'b4' && ctx.todayPhotoSubmitted) earned = true
    if (b.id === 'b6' && ctx.weeklyDone) earned = true
    if (b.id === 'b8' && ctx.streak >= 30) earned = true
    return earned ? { ...b, earned: true, earnedDate: 'Today' } : b
  })
}

const AppContext = createContext<AppContextType | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(loadState)
  const [pendingCheckInQuestion, setPendingCheckInQuestion] = useState<string | null>(null)

  useEffect(() => {
    const toSave = {
      ...state,
      lastCheckInDate: new Date().toDateString(),
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
  }, [state])

  /**
   * Create an account on the backend and stash the token + profile locally.
   * Does NOT finish onboarding — the caller continues into the goals flow.
   */
  async function signup(input: SignupInput) {
    const result = await signupRequest(input)
    setToken(result.token)
    const profile = normalizeProfile(result.state?.profile, {
      age: input.age,
      heightCm: input.heightCm,
      weightKg: input.weightKg,
    })
    setState((prev) => ({
      ...prev,
      userName: input.name || prev.userName,
      profile,
    }))
  }

  /**
   * Authenticate a returning user. Pulls their name + profile from the server,
   * marks onboarding complete, and ensures a usable set of core metrics exists
   * (the goal/metric layer is device-local, so seed defaults if this device has
   * none yet).
   */
  async function login(email: string, password: string) {
    const result = await loginRequest(email, password)
    setToken(result.token)
    const s = result.state ?? {}
    const serverName = typeof s.userName === 'string' ? s.userName : null

    // Pull the persisted check-in history so insights/streaks have data. Best
    // effort: if it fails we still render the aggregates from the login payload.
    let checkIns: CheckInEntry[] = []
    let historyLoaded = false
    try {
      const records = await checkInsRequest()
      checkIns = records.map((r) => ({ ...r, date: serverDateToKey(r.date) }))
      historyLoaded = true
    } catch {
      // history endpoint unreachable — fall back to server-reported aggregates
    }

    setState((prev) => {
      const goals = prev.goals.length ? prev.goals : (['weight_loss', 'energy'] as GoalId[])
      const coreMetrics = prev.coreMetrics.length ? prev.coreMetrics : curateMetricsForGoals(goals)

      // Recompute streak from history when we have it (matches how the rest of
      // the app derives streaks); otherwise trust the server's value.
      const derived = historyLoaded ? calculateConsistencyStreak(checkIns) : null
      const streak = derived ? derived.streak : numOr(s.streak, prev.streak)
      const longestStreak = Math.max(
        numOr(s.longestStreak, prev.longestStreak),
        derived ? derived.longestStreak : 0,
      )

      return {
        ...prev,
        userName: serverName || prev.userName,
        profile: normalizeProfile(s.profile, prev.profile),
        level: numOr(s.level, prev.level),
        xp: numOr(s.xp, prev.xp),
        xpToNextLevel: numOr(s.xpToNextLevel, prev.xpToNextLevel),
        totalCheckIns: numOr(s.totalCheckIns, prev.totalCheckIns),
        streak,
        longestStreak,
        checkIns,
        todayCheckedIn: Boolean(s.todayCheckedIn),
        todayAnswers: (s.todayAnswers as Record<string, number>) ?? {},
        goals,
        coreMetrics,
        weekStartDate: prev.coreMetrics.length ? prev.weekStartDate : getWeekStart(),
        onboardingComplete: true,
      }
    })
  }

  function completeOnboarding(goals: GoalId[], userName: string) {
    const coreMetrics = curateMetricsForGoals(goals)
    setState((prev) => ({
      ...prev,
      onboardingComplete: true,
      goals,
      userName,
      coreMetrics,
      weekStartDate: getWeekStart(),
    }))
  }

  function completeCheckIn(answers: Record<string, number>, xp: number) {
    const entry: CheckInEntry = {
      date: new Date().toDateString(),
      answers,
      xpEarned: xp,
      completedAt: new Date().toISOString(),
    }

    setState((prev) => {
      const newCheckIns = [...prev.checkIns, entry]
      const { streak, longestStreak } = calculateConsistencyStreak(newCheckIns)
      const newXp = prev.xp + xp
      const newLevel = newXp >= prev.xpToNextLevel ? prev.level + 1 : prev.level
      const finalXp = newXp >= prev.xpToNextLevel ? newXp - prev.xpToNextLevel : newXp
      const newXpToNext = newLevel > prev.level ? prev.xpToNextLevel + 100 : prev.xpToNextLevel
      const consistencyPoints = prev.consistencyPoints + 10
      const updatedCycles = prev.cycles.map((c) =>
        c.id === prev.activeCycleId ? { ...c, powerScore: c.powerScore + 10 } : c
      )

      const hasLowScore = Object.values(answers).some((v) => v === 1)
      const badges = updateBadges(prev.badges, {
        totalCheckIns: prev.totalCheckIns + 1,
        streak,
        todayPhotoSubmitted: prev.todayPhotoSubmitted,
        weeklyDone: false,
      }).map((b) =>
        b.id === 'b2' && hasLowScore && !b.earned
          ? { ...b, earned: true, earnedDate: 'Today' }
          : b
      )

      return {
        ...prev,
        todayCheckedIn: true,
        todayAnswers: answers,
        xp: finalXp,
        level: newLevel,
        xpToNextLevel: newXpToNext,
        streak,
        longestStreak: Math.max(prev.longestStreak, longestStreak),
        totalCheckIns: prev.totalCheckIns + 1,
        checkIns: newCheckIns,
        consistencyPoints,
        cycles: updatedCycles,
        badges,
      }
    })
  }

  function completeWeeklyRecalibration(subjectiveScore: number) {
    setState((prev) => {
      const result = recalibrateMetrics(prev.coreMetrics, prev.checkIns, subjectiveScore, prev.goals)
      const badges = updateBadges(prev.badges, {
        totalCheckIns: prev.totalCheckIns,
        streak: prev.streak,
        todayPhotoSubmitted: prev.todayPhotoSubmitted,
        weeklyDone: true,
      })
      return {
        ...prev,
        coreMetrics: result.newMetrics,
        weekStartDate: new Date().toDateString(),
        weeklyRecalibrationPending: false,
        badges,
      }
    })
  }

  async function submitPhotoChallenge(imageDataUrl: string) {
    const result = await classifyImage(imageDataUrl, state.dailyPhotoChallenge.cvCategory)
    if (result.verified) {
      setState((prev) => {
        const newPost: CyclePhotoPost = {
          id: `user-${Date.now()}`,
          cycleId: prev.activeCycleId,
          friendId: 'you',
          friendName: prev.userName,
          avatar: prev.avatar,
          imageUrl: imageDataUrl,
          prompt: prev.dailyPhotoChallenge.prompt,
          timeAgo: 'Just now',
          verified: true,
        }
        const badges = updateBadges(prev.badges, {
          totalCheckIns: prev.totalCheckIns,
          streak: prev.streak,
          todayPhotoSubmitted: true,
          weeklyDone: false,
        })
        const updatedCycles = prev.cycles.map((c) =>
          c.id === prev.activeCycleId ? { ...c, powerScore: c.powerScore + 15 } : c
        )
        return {
          ...prev,
          todayPhotoSubmitted: true,
          todayPhotoUrl: imageDataUrl,
          cyclePosts: [newPost, ...prev.cyclePosts],
          consistencyPoints: prev.consistencyPoints + 15,
          cycles: updatedCycles,
          badges,
        }
      })
    }
    return { verified: result.verified, message: result.message }
  }

  function setActiveCycle(cycleId: string) {
    setState((prev) => ({ ...prev, activeCycleId: cycleId }))
  }

  function nudgeMember(_friendId: string) {
    // Push notification would fire here in production
  }

  function likeActivity(activityId: string) {
    setState((prev) => ({
      ...prev,
      friendActivities: prev.friendActivities.map((a) =>
        a.id === activityId
          ? { ...a, liked: !a.liked, likes: a.liked ? a.likes - 1 : a.likes + 1 }
          : a
      ),
    }))
  }

  function tryItYourself(questionKey: string) {
    setPendingCheckInQuestion(questionKey)
  }

  function clearPendingQuestion() {
    setPendingCheckInQuestion(null)
  }

  function loadDemo() {
    const demo = createDemoState()
    const merged = { ...defaultState, ...demo }
    const { streak, longestStreak } = calculateConsistencyStreak(merged.checkIns)
    merged.streak = streak
    merged.longestStreak = Math.max(merged.longestStreak, longestStreak)
    setState(merged)
  }

  /**
   * End the session: drop the auth token and clear locally-cached state so the
   * next user starts clean and lands back on the auth screen (onboardingComplete
   * goes false → OnboardingGuard redirects to /onboarding).
   */
  function logout() {
    clearToken()
    localStorage.removeItem(STORAGE_KEY)
    setState({ ...defaultState, weekStartDate: getWeekStart() })
    setPendingCheckInQuestion(null)
  }

  function resetExperience() {
    localStorage.removeItem(STORAGE_KEY)
    clearToken()
    setState({ ...defaultState, weekStartDate: getWeekStart() })
    setPendingCheckInQuestion(null)
  }

  return (
    <AppContext.Provider
      value={{
        state,
        signup,
        login,
        completeCheckIn,
        completeOnboarding,
        completeWeeklyRecalibration,
        submitPhotoChallenge,
        setActiveCycle,
        likeActivity,
        nudgeMember,
        tryItYourself,
        pendingCheckInQuestion,
        clearPendingQuestion,
        loadDemo,
        logout,
        resetExperience,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
