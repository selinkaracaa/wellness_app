-- Bloom wellness app — Postgres schema.
-- Run via `npm run db:seed` (idempotent: safe to re-run).

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name             TEXT NOT NULL,
  email            TEXT NOT NULL UNIQUE,
  password_hash    TEXT NOT NULL,
  age              INT,
  height_cm        NUMERIC(5,1),
  weight_kg        NUMERIC(5,1),
  avatar           TEXT NOT NULL DEFAULT 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=85&auto=format&fit=crop',
  level            INT NOT NULL DEFAULT 1,
  xp               INT NOT NULL DEFAULT 0,
  xp_to_next_level INT NOT NULL DEFAULT 500,
  streak           INT NOT NULL DEFAULT 0,
  longest_streak   INT NOT NULL DEFAULT 0,
  total_check_ins  INT NOT NULL DEFAULT 0,
  last_check_in_date DATE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Profile fields added after v1; ALTERs keep already-provisioned DBs in sync.
ALTER TABLE users ADD COLUMN IF NOT EXISTS age       INT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS height_cm NUMERIC(5,1);
ALTER TABLE users ADD COLUMN IF NOT EXISTS weight_kg NUMERIC(5,1);

CREATE TABLE IF NOT EXISTS check_ins (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date         DATE NOT NULL,
  answers      JSONB NOT NULL,
  xp_earned    INT NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, date)
);
CREATE INDEX IF NOT EXISTS check_ins_user_date_idx ON check_ins (user_id, date);

-- Global seed data (shared across all users) ---------------------------------

CREATE TABLE IF NOT EXISTS friends (
  id     TEXT PRIMARY KEY,
  name   TEXT NOT NULL,
  avatar TEXT NOT NULL,
  streak INT NOT NULL,
  level  INT NOT NULL
);

CREATE TABLE IF NOT EXISTS friend_activities (
  id             TEXT PRIMARY KEY,
  friend_id      TEXT NOT NULL REFERENCES friends(id),
  friend_name    TEXT NOT NULL,
  avatar         TEXT NOT NULL,
  question_key   TEXT NOT NULL,
  question_label TEXT NOT NULL,
  answer         TEXT NOT NULL,
  answer_emoji   TEXT NOT NULL,
  time_ago       TEXT NOT NULL,
  base_likes     INT NOT NULL,
  sort_order     INT NOT NULL
);

CREATE TABLE IF NOT EXISTS challenges (
  id                    TEXT PRIMARY KEY,
  title                 TEXT NOT NULL,
  description           TEXT NOT NULL,
  emoji                 TEXT NOT NULL,
  duration              INT NOT NULL,
  days_left             INT NOT NULL,
  base_participant_count INT NOT NULL,
  color                 TEXT NOT NULL,
  type                  TEXT NOT NULL,
  participant_ids       JSONB NOT NULL,
  sort_order            INT NOT NULL
);

CREATE TABLE IF NOT EXISTS badges (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  description TEXT NOT NULL,
  emoji       TEXT NOT NULL,
  rarity      TEXT NOT NULL,
  sort_order  INT NOT NULL
);

-- Per-user join tables -------------------------------------------------------

CREATE TABLE IF NOT EXISTS activity_likes (
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  activity_id TEXT NOT NULL REFERENCES friend_activities(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, activity_id)
);

CREATE TABLE IF NOT EXISTS challenge_members (
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  challenge_id TEXT NOT NULL REFERENCES challenges(id),
  progress     INT NOT NULL DEFAULT 0,
  joined_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, challenge_id)
);

CREATE TABLE IF NOT EXISTS user_badges (
  user_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_id  TEXT NOT NULL REFERENCES badges(id),
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, badge_id)
);
