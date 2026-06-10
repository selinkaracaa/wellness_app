import express from 'express'
import type { NextFunction, Request, Response } from 'express'
import cors from 'cors'
import { config } from './config.ts'
import { pool } from './db.ts'
import { authRouter } from './routes/auth.ts'
import { apiRouter } from './routes/api.ts'

const app = express()

app.use(cors())
app.use(express.json())

app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1')
    res.json({ ok: true })
  } catch {
    res.status(503).json({ ok: false, error: 'database unavailable' })
  }
})

app.use('/api/auth', authRouter)
app.use('/api', apiRouter)

// 404 for unknown API routes.
app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'Not found' })
})

// Centralized error handler.
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled error:', err)
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(config.port, () => {
  console.log(`🌿 Bloom API listening on http://localhost:${config.port}`)
})
