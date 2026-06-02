import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { FRIEND_ACTIVITIES, CHALLENGES, BADGES } from '../data/mockData'
import type { FriendActivity, Challenge, Badge } from '../data/mockData'

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
  challenges: Challenge[]
  badges: Badge[]
  activeCheckInStep: number
}

interface AppContextType {
  state: AppState
  completeCheckIn: (answers: Record<string, number>, xp: number) => void
  likeActivity: (activityId: string) => void
  joinChallenge: (challengeId: string) => void
  tryItYourself: (questionKey: string) => void
  pendingCheckInQuestion: string | null
  clearPendingQuestion: () => void
}

const defaultState: AppState = {
  userName: 'You',
  avatar: '🌿',
  level: 5,
  xp: 340,
  xpToNextLevel: 500,
  streak: 7,
  longestStreak: 12,
  totalCheckIns: 23,
  checkIns: [],
  todayCheckedIn: false,
  todayAnswers: {},
  friendActivities: FRIEND_ACTIVITIES,
  challenges: CHALLENGES,
  badges: BADGES,
  activeCheckInStep: 0,
}

const STORAGE_KEY = 'wellness_app_state'

function loadState(): AppState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      // Check if today's check-in is actually from today
      const today = new Date().toDateString()
      if (parsed.lastCheckInDate !== today) {
        parsed.todayCheckedIn = false
        parsed.todayAnswers = {}
      }
      return { ...defaultState, ...parsed }
    }
  } catch {
    // ignore
  }
  return defaultState
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

  function completeCheckIn(answers: Record<string, number>, xp: number) {
    const entry: CheckInEntry = {
      date: new Date().toDateString(),
      answers,
      xpEarned: xp,
      completedAt: new Date().toISOString(),
    }

    setState(prev => {
      const newXp = prev.xp + xp
      const newLevel = newXp >= prev.xpToNextLevel
        ? prev.level + 1
        : prev.level
      const finalXp = newXp >= prev.xpToNextLevel
        ? newXp - prev.xpToNextLevel
        : newXp
      const newXpToNext = newLevel > prev.level ? prev.xpToNextLevel + 100 : prev.xpToNextLevel

      return {
        ...prev,
        todayCheckedIn: true,
        todayAnswers: answers,
        xp: finalXp,
        level: newLevel,
        xpToNextLevel: newXpToNext,
        streak: prev.streak + 1,
        longestStreak: Math.max(prev.longestStreak, prev.streak + 1),
        totalCheckIns: prev.totalCheckIns + 1,
        checkIns: [...prev.checkIns, entry],
      }
    })
  }

  function likeActivity(activityId: string) {
    setState(prev => ({
      ...prev,
      friendActivities: prev.friendActivities.map(a =>
        a.id === activityId
          ? { ...a, liked: !a.liked, likes: a.liked ? a.likes - 1 : a.likes + 1 }
          : a
      ),
    }))
  }

  function joinChallenge(challengeId: string) {
    setState(prev => ({
      ...prev,
      challenges: prev.challenges.map(c =>
        c.id === challengeId ? { ...c, joined: !c.joined } : c
      ),
    }))
  }

  function tryItYourself(questionKey: string) {
    setPendingCheckInQuestion(questionKey)
  }

  function clearPendingQuestion() {
    setPendingCheckInQuestion(null)
  }

  return (
    <AppContext.Provider value={{
      state,
      completeCheckIn,
      likeActivity,
      joinChallenge,
      tryItYourself,
      pendingCheckInQuestion,
      clearPendingQuestion,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
