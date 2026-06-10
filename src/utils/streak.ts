import type { CheckInEntry } from '../context/AppContext'

function toDateKey(date: Date): string {
  return date.toDateString()
}

function parseDateKey(key: string): Date {
  return new Date(key)
}

export function calculateConsistencyStreak(checkIns: CheckInEntry[]): {
  streak: number
  longestStreak: number
} {
  if (checkIns.length === 0) return { streak: 0, longestStreak: 0 }

  const uniqueDates = [...new Set(checkIns.map((c) => c.date))].sort(
    (a, b) => parseDateKey(a).getTime() - parseDateKey(b).getTime()
  )

  let longest = 0
  let current = 0
  let prev: Date | null = null

  for (const dateStr of uniqueDates) {
    const d = parseDateKey(dateStr)
    if (prev) {
      const diffDays = Math.round((d.getTime() - prev.getTime()) / 86400000)
      current = diffDays === 1 ? current + 1 : 1
    } else {
      current = 1
    }
    longest = Math.max(longest, current)
    prev = d
  }

  const today = toDateKey(new Date())
  const yesterday = toDateKey(new Date(Date.now() - 86400000))
  const lastDate = uniqueDates[uniqueDates.length - 1]

  let activeStreak = 0
  if (lastDate === today || lastDate === yesterday) {
    activeStreak = current
    if (lastDate === yesterday && today !== lastDate) {
      const checkedInToday = checkIns.some((c) => c.date === today)
      if (!checkedInToday) {
        // streak is alive until end of today
      }
    }
  }

  return { streak: activeStreak, longestStreak: longest }
}

export function getWeekCheckInDays(checkIns: CheckInEntry[], days = 7): boolean[] {
  const checkInSet = new Set(checkIns.map((c) => c.date))
  return Array.from({ length: days }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (days - 1 - i))
    return checkInSet.has(toDateKey(d))
  })
}

export function daysSinceWeekStart(weekStartDate: string): number {
  const start = new Date(weekStartDate)
  const now = new Date()
  return Math.floor((now.getTime() - start.getTime()) / 86400000)
}

export function isWeeklyRecalibrationDue(weekStartDate: string): boolean {
  return daysSinceWeekStart(weekStartDate) >= 7
}
