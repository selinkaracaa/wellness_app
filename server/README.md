# Bloom Backend

A real REST API for the Bloom wellness app: multi-user accounts (JWT auth) with
per-user check-ins, XP/level/streak gamification, badges, social likes, and
challenge participation — all persisted in Postgres.

## Stack

- **Express** (TypeScript, run with `tsx`)
- **Postgres 16** (via Docker Compose), accessed with `pg`
- **JWT** auth (`jsonwebtoken`) + `bcryptjs` password hashing

## Setup

```bash
cp .env.example .env          # adjust DATABASE_URL / JWT_SECRET if needed
npm install
npm run db:up                 # start Postgres in Docker
npm run db:seed               # create tables + load global seed data (idempotent)
npm run dev:all               # run Vite (5173) + API (4000) together
```

Vite proxies `/api/*` to `http://localhost:4000` (see `vite.config.ts`), so the
frontend just calls `/api/...`.

Individual scripts: `npm run server` (API only), `npm run dev` (web only),
`npm run db:down` (stop Postgres).

## Data model

| Table | Purpose |
|-------|---------|
| `users` | account + gamification stats (level, xp, streak, …) |
| `check_ins` | one row per user per day (`UNIQUE(user_id, date)`), answers as JSONB |
| `friends`, `friend_activities`, `challenges`, `badges` | global seed data |
| `activity_likes`, `challenge_members`, `user_badges` | per-user join tables |

## API

All `/api` routes except `/auth/*` and `/health` require `Authorization: Bearer <token>`.

| Method | Path | Description |
|--------|------|-------------|
| `GET`  | `/api/health` | DB connectivity check |
| `POST` | `/api/auth/signup` | `{name,email,password}` → `{token,state}` |
| `POST` | `/api/auth/login` | `{email,password}` → `{token,state}` |
| `GET`  | `/api/me` | full app state for the signed-in user |
| `GET`  | `/api/checkins` | check-in history |
| `POST` | `/api/checkins` | `{answers:{water:1-5,…}}` → updated `{state}`; 409 if already done today |
| `POST` | `/api/social/activities/:id/like` | toggle like → `{state}` |
| `POST` | `/api/challenges/:id/join` | toggle join → `{state}` |

The `state` payload matches the frontend's `AppState` shape exactly, so the
client renders it without transformation.

## Gamification & badges

XP/level/streak math lives in `server/src/gamification.ts` (mirrors the original
client logic). Badges are evaluated from real history after each check-in/like:
First Step, Hydration Hero, On Fire, Social Butterfly, Sleep Champion, Clean
Eater, Screen Warrior, and Unstoppable are all earnable. (Social Star has no
mechanic in the mock social data and is never auto-awarded.)
