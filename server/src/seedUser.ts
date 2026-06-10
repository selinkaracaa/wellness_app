/**
 * Seed a sample user account with a realistic check-in history so the app has
 * data to show (insights, streaks, badges).
 *
 *   npm run db:seed:user
 *   npm run db:seed:user -- --email=me@test.dev --password=hunter2 --name="Sam" --days=30
 *   npm run db:seed:user -- --age=29 --height=168 --weight=63
 *
 * Or via env vars: SEED_EMAIL, SEED_PASSWORD, SEED_NAME, SEED_DAYS,
 * SEED_AGE, SEED_HEIGHT (cm), SEED_WEIGHT (kg).
 *
 * Idempotent: re-running with the same email wipes that user's check-ins and
 * reseeds them. Requires the schema/global seed to exist (run `npm run db:seed`
 * first) — though this script also applies the schema defensively.
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { pool, withTransaction } from './db.ts'
import { hashPassword } from './auth.ts'
import { evaluateBadges } from './gamification.ts'
import { QUESTION_XP } from './seedData.ts'

const here = dirname(fileURLToPath(import.meta.url))

// --- options ---------------------------------------------------------------

function arg(name: string): string | undefined {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`))
  return hit ? hit.slice(name.length + 3) : undefined
}

const email = (arg('email') ?? process.env.SEED_EMAIL ?? 'demo@bloom.app').trim().toLowerCase()
const password = arg('password') ?? process.env.SEED_PASSWORD ?? 'demo1234'
const name = arg('name') ?? process.env.SEED_NAME ?? 'Demo User'
const days = Math.max(1, Math.min(120, Number(arg('days') ?? process.env.SEED_DAYS ?? 21)))
const age = Math.round(Number(arg('age') ?? process.env.SEED_AGE ?? 31))
const heightCm = Math.round(Number(arg('height') ?? process.env.SEED_HEIGHT ?? 175) * 10) / 10
const weightKg = Math.round(Number(arg('weight') ?? process.env.SEED_WEIGHT ?? 72) * 10) / 10

// --- helpers ---------------------------------------------------------------

function ymd(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Per-metric baselines (1-5). Screen tends to run low; water/mood higher. */
const BASELINE: Record<string, number> = {
  water: 4,
  activity: 3,
  nutrition: 3,
  sleep: 3,
  screen: 2,
  mood: 4,
}

function clamp(n: number): number {
  return Math.max(1, Math.min(5, Math.round(n)))
}

/** Realistic-ish answer for a given day: baseline + noise, with a few dips. */
function answersForDay(dayIndex: number, total: number): Record<string, number> {
  const out: Record<string, number> = {}
  // The two most recent days dip a little, so "improve this" advice has signal.
  const recentDip = dayIndex >= total - 2 ? -1 : 0
  for (const key of Object.keys(QUESTION_XP)) {
    const base = BASELINE[key] ?? 3
    const noise = Math.random() < 0.5 ? -1 : Math.random() < 0.5 ? 0 : 1
    out[key] = clamp(base + noise + (key === 'sleep' || key === 'screen' ? recentDip : 0))
  }
  return out
}

interface Progress {
  level: number
  xp: number
  xpToNext: number
}

/** Replay the gamification level formula across a sequence of XP gains. */
function applyXp(p: Progress, xpEarned: number): Progress {
  const totalXp = p.xp + xpEarned
  if (totalXp >= p.xpToNext) {
    return { level: p.level + 1, xp: totalXp - p.xpToNext, xpToNext: p.xpToNext + 100 }
  }
  return { level: p.level, xp: totalXp, xpToNext: p.xpToNext }
}

// --- main ------------------------------------------------------------------

async function main() {
  const schema = readFileSync(join(here, 'schema.sql'), 'utf8')

  await withTransaction(async (c) => {
    await c.query(schema) // defensive: ensure tables exist

    // 1. Upsert the user (reuse the row if the email already exists).
    const passwordHash = await hashPassword(password)
    const { rows } = await c.query<{ id: string }>(
      `INSERT INTO users (name, email, password_hash, age, height_cm, weight_kg)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (email) DO UPDATE SET
         name = EXCLUDED.name, password_hash = EXCLUDED.password_hash,
         age = EXCLUDED.age, height_cm = EXCLUDED.height_cm, weight_kg = EXCLUDED.weight_kg
       RETURNING id`,
      [name, email, passwordHash, age, heightCm, weightKg],
    )
    const userId = rows[0].id

    // 2. Wipe any prior check-ins/badges for a clean reseed.
    await c.query('DELETE FROM check_ins WHERE user_id = $1', [userId])
    await c.query('DELETE FROM user_badges WHERE user_id = $1', [userId])

    // 3. Insert `days` consecutive check-ins ending today.
    let progress: Progress = { level: 1, xp: 0, xpToNext: 500 }
    let lastDate = ''
    const today = new Date()
    for (let i = 0; i < days; i++) {
      const d = new Date(today)
      d.setDate(today.getDate() - (days - 1 - i))
      const date = ymd(d)
      const answers = answersForDay(i, days)
      const xpEarned = Object.keys(answers).reduce((s, k) => s + (QUESTION_XP[k] ?? 0), 0)
      progress = applyXp(progress, xpEarned)
      lastDate = date
      await c.query(
        `INSERT INTO check_ins (user_id, date, answers, xp_earned, completed_at)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (user_id, date) DO UPDATE
           SET answers = EXCLUDED.answers, xp_earned = EXCLUDED.xp_earned`,
        [userId, date, JSON.stringify(answers), xpEarned, d.toISOString()],
      )
    }

    // 4. Persist aggregates (streak = days, since they're consecutive).
    await c.query(
      `UPDATE users SET
         level = $2, xp = $3, xp_to_next_level = $4,
         streak = $5, longest_streak = $5,
         total_check_ins = $5, last_check_in_date = $6
       WHERE id = $1`,
      [userId, progress.level, progress.xp, progress.xpToNext, days, lastDate],
    )

    // 5. Award badges from the seeded history.
    await evaluateBadges(c, userId)

    console.log('✅ Sample user seeded.')
    console.log(`   email:    ${email}`)
    console.log(`   password: ${password}`)
    console.log(`   profile:  age ${age}, ${heightCm}cm, ${weightKg}kg`)
    console.log(`   check-ins: ${days} (streak ${days}, level ${progress.level})`)
  })

  await pool.end()
}

main().catch((err) => {
  console.error('❌ User seed failed:', err)
  process.exit(1)
})
