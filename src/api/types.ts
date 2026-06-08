import type { FriendActivity, Challenge, Badge } from '../data/mockData'

/** The app-state payload returned by the backend (see server/src/state.ts). */
export interface AppState {
  userName: string
  avatar: string
  level: number
  xp: number
  xpToNextLevel: number
  streak: number
  longestStreak: number
  totalCheckIns: number
  todayCheckedIn: boolean
  todayAnswers: Record<string, number>
  friendActivities: FriendActivity[]
  challenges: Challenge[]
  badges: Badge[]
}

export interface AuthResponse {
  token: string
  state: AppState
}
