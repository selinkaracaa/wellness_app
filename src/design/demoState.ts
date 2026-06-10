import type { AppState } from '../context/AppContext'
import { curateMetricsForGoals } from '../utils/aiRecalibration'
import {
  CYCLES,
  CYCLE_PHOTO_POSTS,
  DAILY_PHOTO_CHALLENGE,
  CYCLE_LEADERBOARD,
  FRIEND_ACTIVITIES,
  BADGES,
} from '../data/mockData'

function generateCheckIns(days: number) {
  const metrics = ['steps', 'protein', 'greens', 'water', 'sports']
  return Array.from({ length: days }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (days - 1 - i))
    const answers = Object.fromEntries(
      metrics.map((k) => [k, 1 + Math.floor(Math.random() * 5)])
    )
    return {
      date: d.toDateString(),
      answers,
      xpEarned: 90,
      completedAt: d.toISOString(),
    }
  })
}

export function createDemoState(): Partial<AppState> {
  const coreMetrics = curateMetricsForGoals(['weight_loss', 'energy'])
  const checkIns = generateCheckIns(21)

  return {
    onboardingComplete: true,
    userName: 'Selin',
    goals: ['weight_loss', 'energy'],
    coreMetrics,
    level: 6,
    xp: 280,
    xpToNextLevel: 500,
    streak: 14,
    longestStreak: 14,
    totalCheckIns: 21,
    checkIns,
    todayCheckedIn: false,
    todayAnswers: {},
    todayPhotoSubmitted: false,
    todayPhotoUrl: null,
    weeklyRecalibrationPending: false,
    activeCycleId: 'cycle-family',
    cycles: CYCLES,
    cyclePosts: CYCLE_PHOTO_POSTS,
    dailyPhotoChallenge: DAILY_PHOTO_CHALLENGE,
    cycleLeaderboard: CYCLE_LEADERBOARD,
    friendActivities: FRIEND_ACTIVITIES,
    badges: BADGES.map((b) => ({ ...b, earned: ['b1', 'b3', 'b5'].includes(b.id) })),
    consistencyPoints: 420,
  }
}

export function isDemoMode(): boolean {
  return new URLSearchParams(window.location.search).has('demo')
}
