# 🌿 Bloom

A daily wellness check-in app. Log how you slept, ate, moved, and felt; earn
XP, level up, keep a streak, unlock badges, and compare with friends.

Full-stack: a **React 19 + Vite** frontend and an **Express + Postgres** REST API
with multi-user JWT authentication. Each user has their own check-ins, XP,
streaks, and badges, all persisted in Postgres.

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React 19, Vite 8, TypeScript, Tailwind v4, React Router 7, framer-motion |
| Backend | Express (run with `tsx`), Postgres 16 (`pg`) |
| Auth | JWT (`jsonwebtoken`) + bcrypt (`bcryptjs`) |
| Infra | Docker Compose (Postgres) |

## Prerequisites

- Node 18+ and npm
- Docker (for Postgres) — Docker Desktop running

## Getting started

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env          # tweak DATABASE_URL / JWT_SECRET if you like

# 3. Start the database
npm run db:up                 # Postgres in Docker on :5432
npm run db:seed               # create tables + load seed data (idempotent)

# 4. Run the app (frontend + API together)
npm run dev:all
```

Then open the URL Vite prints (default **http://localhost:5173**). Sign up to
create an account and start checking in.

## Scripts

| Script | What it does |
|--------|--------------|
| `npm run dev:all` | Run Vite (web) **and** the API together |
| `npm run dev` | Vite dev server only (`:5173`) |
| `npm run server` | API only, with watch (`:4000`) |
| `npm run db:up` / `db:down` | Start / stop the Postgres container |
| `npm run db:seed` | Apply schema + load global seed data (safe to re-run) |
| `npm run build` | Typecheck (`tsc -b`) and build the frontend |
| `npm run lint` | ESLint over the repo |
| `npm run preview` | Serve the production build |

Vite proxies `/api/*` → `http://localhost:4000` (see `vite.config.ts`), so the
frontend simply calls `/api/...` with no CORS or base-URL config.

## Architecture

### Frontend (`src/`)
- `src/context/AppContext.tsx` — single source of truth. On load it hydrates
  from `GET /api/me`; mutators (`completeCheckIn`, `likeActivity`,
  `joinChallenge`) call the API and update state from the response (with
  optimistic updates for likes/joins). `useAuth()` exposes `login`/`signup`/
  `logout`; `useApp()` is for pages inside the authenticated tree.
- `src/api/` — `client.ts` (fetch wrapper + JWT token storage in `localStorage`)
  and `types.ts` (the `AppState` shape, matched 1:1 by the server).
- `src/pages/Auth.tsx` — login / signup screen. `src/App.tsx` gates the routes:
  unauthenticated → Auth, loading → spinner, authenticated → the tabbed app.
- `src/data/mockData.ts` — `CHECK_IN_QUESTIONS` and static reference data
  (friend list, question definitions) still live client-side.

### Backend (`server/`)
See [`server/README.md`](server/README.md) for full details. In short:

```
server/src/
  index.ts          Express bootstrap (CORS, JSON, error handler)
  config.ts, db.ts  env + Postgres pool / transaction helper
  auth.ts           JWT sign/verify, bcrypt, requireAuth middleware
  gamification.ts   XP / level / streak math + badge evaluation
  state.ts          assembles the GET /me payload (= frontend AppState)
  schema.sql        Postgres DDL
  seed.ts/seedData.ts  schema runner + global seed data
  routes/auth.ts    /signup, /login
  routes/api.ts     /me, /checkins, social like, challenge join
```

### Data model
Per-user rows in `users` and `check_ins` (one per day, `UNIQUE(user_id, date)`);
global seed tables `friends`, `friend_activities`, `challenges`, `badges`; and
per-user join tables `activity_likes`, `challenge_members`, `user_badges`.

## API

All `/api` routes except `/auth/*` and `/health` require
`Authorization: Bearer <token>`.

| Method | Path | Description |
|--------|------|-------------|
| `GET`  | `/api/health` | DB connectivity check |
| `POST` | `/api/auth/signup` | `{name,email,password}` → `{token, state}` |
| `POST` | `/api/auth/login` | `{email,password}` → `{token, state}` |
| `GET`  | `/api/me` | full app state for the signed-in user |
| `GET`  | `/api/checkins` | check-in history |
| `POST` | `/api/checkins` | `{answers:{water:1-5,…}}` → `{state}`; 409 if already done today |
| `POST` | `/api/social/activities/:id/like` | toggle like → `{state}` |
| `POST` | `/api/challenges/:id/join` | toggle join → `{state}` |

### Quick API test

```bash
B=http://localhost:4000/api
TOKEN=$(curl -s -X POST $B/auth/signup -H 'Content-Type: application/json' \
  -d '{"name":"Test","email":"t@e.com","password":"hunter2"}' \
  | python3 -c "import sys,json;print(json.load(sys.stdin)['token'])")

curl -s -X POST $B/checkins -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"answers":{"water":5,"activity":4,"nutrition":3,"sleep":5,"screen":4,"mood":4}}'
```

## Gamification

A full check-in awards **95 XP** (water 15, activity 20, nutrition 20, sleep 15,
screen 15, mood 10). Leveling, streak increment/reset, and badge unlocks
(First Step, Hydration Hero, On Fire, Social Butterfly, Sleep Champion, Clean
Eater, Screen Warrior, Unstoppable) are all computed server-side from real
history — see `server/src/gamification.ts`.

## Design system

`docs/BRAND.md` is the authoritative brand spec (color tokens, typography,
component rules). The `/brand` route renders a live design reference and is the
one page that works without signing in.
