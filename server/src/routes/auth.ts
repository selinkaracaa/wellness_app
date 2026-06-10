import { Router } from 'express'
import { query } from '../db.ts'
import { hashPassword, verifyPassword, signToken } from '../auth.ts'
import { buildState } from '../state.ts'

export const authRouter = Router()

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Parse an optional numeric profile field. Returns the rounded number, or null
 * when blank/absent. Throws a message string for out-of-range or non-numeric
 * input so the caller can surface a 400.
 */
function parseProfileNumber(raw: unknown, label: string, min: number, max: number): number | null {
  if (raw === undefined || raw === null || raw === '') return null
  const n = Number(raw)
  if (!Number.isFinite(n)) throw new Error(`${label} must be a number`)
  if (n < min || n > max) throw new Error(`${label} must be between ${min} and ${max}`)
  return Math.round(n * 10) / 10
}

authRouter.post('/signup', async (req, res, next) => {
  try {
    const name = String(req.body?.name ?? '').trim()
    const email = String(req.body?.email ?? '').trim().toLowerCase()
    const password = String(req.body?.password ?? '')

    if (!name) return res.status(400).json({ error: 'Name is required' })
    if (!EMAIL_RE.test(email)) return res.status(400).json({ error: 'A valid email is required' })
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' })

    let age: number | null, heightCm: number | null, weightKg: number | null
    try {
      age = parseProfileNumber(req.body?.age, 'Age', 13, 120)
      heightCm = parseProfileNumber(req.body?.height_cm, 'Height', 50, 272)
      weightKg = parseProfileNumber(req.body?.weight_kg, 'Weight', 20, 500)
    } catch (e) {
      return res.status(400).json({ error: (e as Error).message })
    }

    const existing = await query('SELECT 1 FROM users WHERE email = $1', [email])
    if (existing.rowCount) return res.status(409).json({ error: 'An account with that email already exists' })

    const passwordHash = await hashPassword(password)
    const { rows } = await query<{ id: string }>(
      `INSERT INTO users (name, email, password_hash, age, height_cm, weight_kg)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [name, email, passwordHash, age, heightCm, weightKg],
    )
    const userId = rows[0].id
    const token = signToken(userId)
    const state = await buildState(userId)
    res.status(201).json({ token, state })
  } catch (err) {
    next(err)
  }
})

authRouter.post('/login', async (req, res, next) => {
  try {
    const email = String(req.body?.email ?? '').trim().toLowerCase()
    const password = String(req.body?.password ?? '')

    const { rows } = await query<{ id: string; password_hash: string }>(
      `SELECT id, password_hash FROM users WHERE email = $1`,
      [email],
    )
    const user = rows[0]
    if (!user || !(await verifyPassword(password, user.password_hash))) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const token = signToken(user.id)
    const state = await buildState(user.id)
    res.json({ token, state })
  } catch (err) {
    next(err)
  }
})
