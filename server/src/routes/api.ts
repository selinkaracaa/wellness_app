import { Router } from 'express'
import type { Response } from 'express'
import { query, withTransaction } from '../db.ts'
import { requireAuth, type AuthedRequest } from '../auth.ts'
import { buildState } from '../state.ts'
import { processCheckIn, evaluateBadges, AlreadyCheckedInError } from '../gamification.ts'
import { QUESTION_XP } from '../seedData.ts'

export const apiRouter = Router()

apiRouter.use(requireAuth)

async function sendState(userId: string, res: Response, status = 200) {
  const state = await buildState(userId)
  res.status(status).json({ state })
}

// Full current app state for the signed-in user.
apiRouter.get('/me', async (req: AuthedRequest, res, next) => {
  try {
    await sendState(req.userId!, res)
  } catch (err) {
    next(err)
  }
})

// Update profile fields. Body may include any of: name, age, height_cm, weight_kg.
// Numeric fields accept null/'' to clear. Only provided fields are touched.
apiRouter.patch('/me', async (req: AuthedRequest, res, next) => {
  try {
    const body = (req.body ?? {}) as Record<string, unknown>
    const updates: string[] = []
    const values: unknown[] = []
    let i = 1

    if (body.name !== undefined) {
      const name = String(body.name).trim()
      if (!name) return res.status(400).json({ error: 'Name cannot be empty' })
      updates.push(`name = $${i++}`)
      values.push(name)
    }

    // Validate an optional numeric field; null/'' clears it. `integer` rounds to a whole number.
    function addNumber(key: string, label: string, min: number, max: number, integer = false) {
      if (body[key] === undefined) return
      const raw = body[key]
      if (raw === null || raw === '') {
        updates.push(`${key} = $${i++}`)
        values.push(null)
        return
      }
      const n = Number(raw)
      if (!Number.isFinite(n) || n < min || n > max) {
        throw new Error(`${label} must be between ${min} and ${max}`)
      }
      updates.push(`${key} = $${i++}`)
      values.push(integer ? Math.round(n) : Math.round(n * 10) / 10)
    }

    try {
      addNumber('age', 'Age', 13, 120, true)
      addNumber('height_cm', 'Height', 50, 272)
      addNumber('weight_kg', 'Weight', 20, 500)
    } catch (e) {
      return res.status(400).json({ error: (e as Error).message })
    }

    if (updates.length === 0) return res.status(400).json({ error: 'No fields to update' })

    values.push(req.userId!)
    await query(`UPDATE users SET ${updates.join(', ')} WHERE id = $${i}`, values)
    await sendState(req.userId!, res)
  } catch (err) {
    next(err)
  }
})

// Full check-in history (most recent first).
apiRouter.get('/checkins', async (req: AuthedRequest, res, next) => {
  try {
    const { rows } = await query(
      // to_char keeps the calendar date a plain 'YYYY-MM-DD' string; a bare DATE
      // gets serialized to a UTC timestamp downstream and can shift a day.
      `SELECT to_char(date, 'YYYY-MM-DD') AS date, answers, xp_earned, completed_at
         FROM check_ins WHERE user_id = $1 ORDER BY date DESC`,
      [req.userId!],
    )
    res.json({
      checkIns: rows.map((r) => ({
        date: r.date,
        answers: r.answers,
        xpEarned: r.xp_earned,
        completedAt: r.completed_at,
      })),
    })
  } catch (err) {
    next(err)
  }
})

// Submit today's check-in. Body: { answers: { water: 1..5, ... } }
apiRouter.post('/checkins', async (req: AuthedRequest, res, next) => {
  try {
    const raw = req.body?.answers
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
      return res.status(400).json({ error: 'answers object is required' })
    }

    // Validate: known question keys, integer values 1..5.
    const answers: Record<string, number> = {}
    for (const [key, value] of Object.entries(raw)) {
      if (!(key in QUESTION_XP)) {
        return res.status(400).json({ error: `Unknown question: ${key}` })
      }
      const v = Number(value)
      if (!Number.isInteger(v) || v < 1 || v > 5) {
        return res.status(400).json({ error: `Answer for ${key} must be an integer 1-5` })
      }
      answers[key] = v
    }
    if (Object.keys(answers).length === 0) {
      return res.status(400).json({ error: 'At least one answer is required' })
    }

    await withTransaction((c) => processCheckIn(c, req.userId!, answers))
    await sendState(req.userId!, res, 201)
  } catch (err) {
    if (err instanceof AlreadyCheckedInError) {
      return res.status(409).json({ error: 'You already checked in today' })
    }
    next(err)
  }
})

// Toggle a like on a friend activity.
apiRouter.post('/social/activities/:id/like', async (req: AuthedRequest, res, next) => {
  try {
    const activityId = req.params.id
    const exists = await query('SELECT 1 FROM friend_activities WHERE id = $1', [activityId])
    if (!exists.rowCount) return res.status(404).json({ error: 'Activity not found' })

    await withTransaction(async (c) => {
      const liked = await c.query(
        'SELECT 1 FROM activity_likes WHERE user_id = $1 AND activity_id = $2',
        [req.userId!, activityId],
      )
      if (liked.rowCount) {
        await c.query('DELETE FROM activity_likes WHERE user_id = $1 AND activity_id = $2', [
          req.userId!,
          activityId,
        ])
      } else {
        await c.query('INSERT INTO activity_likes (user_id, activity_id) VALUES ($1, $2)', [
          req.userId!,
          activityId,
        ])
      }
      // Liking can unlock the "Social Butterfly" badge.
      await evaluateBadges(c, req.userId!)
    })

    await sendState(req.userId!, res)
  } catch (err) {
    next(err)
  }
})

// Toggle joining a challenge.
apiRouter.post('/challenges/:id/join', async (req: AuthedRequest, res, next) => {
  try {
    const challengeId = req.params.id
    const exists = await query('SELECT 1 FROM challenges WHERE id = $1', [challengeId])
    if (!exists.rowCount) return res.status(404).json({ error: 'Challenge not found' })

    const member = await query(
      'SELECT 1 FROM challenge_members WHERE user_id = $1 AND challenge_id = $2',
      [req.userId!, challengeId],
    )
    if (member.rowCount) {
      await query('DELETE FROM challenge_members WHERE user_id = $1 AND challenge_id = $2', [
        req.userId!,
        challengeId,
      ])
    } else {
      await query('INSERT INTO challenge_members (user_id, challenge_id) VALUES ($1, $2)', [
        req.userId!,
        challengeId,
      ])
    }

    await sendState(req.userId!, res)
  } catch (err) {
    next(err)
  }
})
