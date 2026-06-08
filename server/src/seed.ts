import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { pool, withTransaction } from './db.ts'
import { FRIENDS, FRIEND_ACTIVITIES, CHALLENGES, BADGES } from './seedData.ts'

const here = dirname(fileURLToPath(import.meta.url))

async function main() {
  const schema = readFileSync(join(here, 'schema.sql'), 'utf8')

  await withTransaction(async (c) => {
    // 1. Create tables.
    await c.query(schema)

    // 2. Upsert global seed data (idempotent).
    for (const f of FRIENDS) {
      await c.query(
        `INSERT INTO friends (id, name, avatar, streak, level)
         VALUES ($1,$2,$3,$4,$5)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name, avatar = EXCLUDED.avatar,
           streak = EXCLUDED.streak, level = EXCLUDED.level`,
        [f.id, f.name, f.avatar, f.streak, f.level],
      )
    }

    for (let i = 0; i < FRIEND_ACTIVITIES.length; i++) {
      const a = FRIEND_ACTIVITIES[i]
      await c.query(
        `INSERT INTO friend_activities
           (id, friend_id, friend_name, avatar, question_key, question_label,
            answer, answer_emoji, time_ago, base_likes, sort_order)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
         ON CONFLICT (id) DO UPDATE SET
           friend_id = EXCLUDED.friend_id, friend_name = EXCLUDED.friend_name,
           avatar = EXCLUDED.avatar, question_key = EXCLUDED.question_key,
           question_label = EXCLUDED.question_label, answer = EXCLUDED.answer,
           answer_emoji = EXCLUDED.answer_emoji, time_ago = EXCLUDED.time_ago,
           base_likes = EXCLUDED.base_likes, sort_order = EXCLUDED.sort_order`,
        [a.id, a.friendId, a.friendName, a.avatar, a.questionKey, a.questionLabel,
         a.answer, a.answerEmoji, a.timeAgo, a.baseLikes, i],
      )
    }

    for (let i = 0; i < CHALLENGES.length; i++) {
      const c2 = CHALLENGES[i]
      await c.query(
        `INSERT INTO challenges
           (id, title, description, emoji, duration, days_left,
            base_participant_count, color, type, participant_ids, sort_order)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
         ON CONFLICT (id) DO UPDATE SET
           title = EXCLUDED.title, description = EXCLUDED.description,
           emoji = EXCLUDED.emoji, duration = EXCLUDED.duration,
           days_left = EXCLUDED.days_left,
           base_participant_count = EXCLUDED.base_participant_count,
           color = EXCLUDED.color, type = EXCLUDED.type,
           participant_ids = EXCLUDED.participant_ids,
           sort_order = EXCLUDED.sort_order`,
        [c2.id, c2.title, c2.description, c2.emoji, c2.duration, c2.daysLeft,
         c2.baseParticipantCount, c2.color, c2.type, JSON.stringify(c2.participantIds), i],
      )
    }

    for (let i = 0; i < BADGES.length; i++) {
      const b = BADGES[i]
      await c.query(
        `INSERT INTO badges (id, name, description, emoji, rarity, sort_order)
         VALUES ($1,$2,$3,$4,$5,$6)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name, description = EXCLUDED.description,
           emoji = EXCLUDED.emoji, rarity = EXCLUDED.rarity,
           sort_order = EXCLUDED.sort_order`,
        [b.id, b.name, b.description, b.emoji, b.rarity, i],
      )
    }
  })

  console.log('✅ Schema applied and seed data loaded.')
  await pool.end()
}

main().catch((err) => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})
