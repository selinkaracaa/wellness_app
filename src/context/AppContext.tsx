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

export interface CheckInEntry {
  date: string
  answers: Record<string, number>
  xpEarned: number
  completedAt: string
}

export interface AppState {
  userName: string
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
  resetExperience: () => void
}

function getWeekStart(): string {
  const d = new Date()
  d.setDate(d.getDate() - d.getDay())
  return d.toDateString()
}

const defaultState: AppState = {
  userName: 'You',
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

  function resetExperience() {
    localStorage.removeItem(STORAGE_KEY)
    setState({ ...defaultState, weekStartDate: getWeekStart() })
    setPendingCheckInQuestion(null)
  }

  return (
    <AppContext.Provider
      value={{
        state,
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
