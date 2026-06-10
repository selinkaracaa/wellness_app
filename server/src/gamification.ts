import type { PoolClient } from './db.ts'
import { QUESTION_XP } from './seedData.ts'

export class AlreadyCheckedInError extends Error {
  constructor() {
    super('Already checked in today')
    this.name = 'AlreadyCheckedInError'
  }
}

// --- date helpers (local-time, 'YYYY-MM-DD') -------------------------------

function ymd(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function today(): string {
  return ymd(new Date())
}

function yesterday(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return ymd(d)
}

interface UserRow {
  level: number
  xp: number
  xp_to_next_level: number
  streak: number
  longest_streak: number
  total_check_ins: number
  last_check_in_date: string | null
}

/**
 * Record a check-in for the user: computes earned XP, level-up, streak, and
 * persists the check-in row. Mirrors the original client-side completeCheckIn.
 * Throws AlreadyCheckedInError if the user already checked in today.
 */
export async function processCheckIn(
  client: PoolClient,
  userId: string,
  answers: Record<string, number>,
) {
  const { rows } = await client.query<UserRow>(
    `SELECT level, xp, xp_to_next_level, streak, longest_streak,
            total_check_ins, last_check_in_date
       FROM users WHERE id = $1 FOR UPDATE`,
    [userId],
  )
  const user = rows[0]
  if (!user) throw new Error('User not found')

  const day = today()
  if (user.last_check_in_date === day) {
    throw new AlreadyCheckedInError()
  }

  // XP earned = sum of the per-question XP for every answered question.
  const xpEarned = Object.keys(answers).reduce(
    (sum, key) => sum + (QUESTION_XP[key] ?? 0),
    0,
  )

  // Level-up math (same formula the client used).
  const totalXp = user.xp + xpEarned
  const leveledUp = totalXp >= user.xp_to_next_level
  const newLevel = leveledUp ? user.level + 1 : user.level
  const newXp = leveledUp ? totalXp - user.xp_to_next_level : totalXp
  const newXpToNext = leveledUp ? user.xp_to_next_level + 100 : user.xp_to_next_level

  // Streak: +1 if the previous check-in was yesterday, else restart at 1.
  const continued = user.last_check_in_date === yesterday()
  const newStreak = continued ? user.streak + 1 : 1
  const newLongest = Math.max(user.longest_streak, newStreak)

  await client.query(
    `INSERT INTO check_ins (user_id, date, answers, xp_earned)
     VALUES ($1, $2, $3, $4)`,
    [userId, day, JSON.stringify(answers), xpEarned],
  )

  await client.query(
    `UPDATE users SET
       level = $2, xp = $3, xp_to_next_level = $4,
       streak = $5, longest_streak = $6,
       total_check_ins = total_check_ins + 1,
       last_check_in_date = $7
     WHERE id = $1`,
    [userId, newLevel, newXp, newXpToNext, newStreak, newLongest, day],
  )

  await evaluateBadges(client, userId)

  return { xpEarned, leveledUp, newLevel, newStreak }
}

/** Longest run of consecutive check-ins (date-ordered) where answer[key] >= 4. */
function longestGoodRun(answersByDate: Record<string, number>[], key: string): number {
  let best = 0
  let run = 0
  for (const a of answersByDate) {
    if ((a[key] ?? 0) >= 4) {
      run += 1
      best = Math.max(best, run)
    } else {
      run = 0
    }
  }
  return best
}

/**
 * Recompute which badges the user has earned from their full history and
 * insert any newly-earned ones. Idempotent — never revokes.
 */
export async function evaluateBadges(client: PoolClient, userId: string) {
  const { rows: userRows } = await client.query<UserRow>(
    `SELECT level, xp, xp_to_next_level, streak, longest_streak,
            total_check_ins, last_check_in_date
       FROM users WHERE id = $1`,
    [userId],
  )
  const user = userRows[0]
  if (!user) return

  const { rows: checkInRows } = await client.query<{ answers: Record<string, number> }>(
    `SELECT answers FROM check_ins WHERE user_id = $1 ORDER BY date ASC`,
    [userId],
  )
  const answers = checkInRows.map((r) => r.answers)

  const { rows: likeRows } = await client.query<{ count: string }>(
    `SELECT COUNT(*)::int AS count FROM activity_likes WHERE user_id = $1`,
    [userId],
  )
  const likeCount = Number(likeRows[0]?.count ?? 0)

  const waterDays = answers.filter((a) => (a.water ?? 0) >= 4).length
  const nutritionDays = answers.filter((a) => (a.nutrition ?? 0) >= 4).length

  const earned: Record<string, boolean> = {
    b1: user.total_check_ins >= 1,
    b2: waterDays >= 7,
    b3: user.longest_streak >= 7,
    b4: likeCount >= 10,
    b5: longestGoodRun(answers, 'sleep') >= 5,
    b6: nutritionDays >= 14,
    b7: longestGoodRun(answers, 'screen') >= 10,
    b8: user.longest_streak >= 30,
    // b9 (Social Star) has no mechanic in this mock data — never auto-awarded.
  }

  const toAward = Object.entries(earned)
    .filter(([, ok]) => ok)
    .map(([id]) => id)

  if (toAward.length === 0) return

  // Insert any not-yet-earned badges in one statement.
  const values = toAward.map((_, i) => `($1, $${i + 2})`).join(', ')
  await client.query(
    `INSERT INTO user_badges (user_id, badge_id)
     VALUES ${values}
     ON CONFLICT (user_id, badge_id) DO NOTHING`,
    [userId, ...toAward],
  )
}
