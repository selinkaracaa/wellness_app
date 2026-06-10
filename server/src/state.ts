import { query } from './db.ts'
import { today } from './gamification.ts'

// Assembles the full app-state payload the frontend's AppContext expects.
// Shapes mirror the TypeScript interfaces in src/data/mockData.ts exactly.

interface Friend {
  id: string
  name: string
  avatar: string
  streak: number
  level: number
}

export async function buildState(userId: string) {
  const [userRes, todayRes, friendsRes, activitiesRes, likesRes, challengesRes, membersRes, badgesRes, userBadgesRes] =
    await Promise.all([
      query(
        `SELECT name, avatar, level, xp, xp_to_next_level, streak,
                longest_streak, total_check_ins, last_check_in_date,
                age, height_cm, weight_kg
           FROM users WHERE id = $1`,
        [userId],
      ),
      query(`SELECT answers FROM check_ins WHERE user_id = $1 AND date = $2`, [userId, today()]),
      query(`SELECT id, name, avatar, streak, level FROM friends ORDER BY id`),
      query(
        `SELECT id, friend_id, friend_name, avatar, question_key, question_label,
                answer, answer_emoji, time_ago, base_likes
           FROM friend_activities ORDER BY sort_order`,
      ),
      query(`SELECT activity_id FROM activity_likes WHERE user_id = $1`, [userId]),
      query(
        `SELECT id, title, description, emoji, duration, days_left,
                base_participant_count, color, type, participant_ids
           FROM challenges ORDER BY sort_order`,
      ),
      query(`SELECT challenge_id, progress FROM challenge_members WHERE user_id = $1`, [userId]),
      query(`SELECT id, name, description, emoji, rarity FROM badges ORDER BY sort_order`),
      query(`SELECT badge_id, earned_at FROM user_badges WHERE user_id = $1`, [userId]),
    ])

  const user = userRes.rows[0]
  if (!user) throw new Error('User not found')

  const friendsById = new Map<string, Friend>()
  for (const f of friendsRes.rows as Friend[]) friendsById.set(f.id, f)

  const likedIds = new Set(likesRes.rows.map((r) => r.activity_id))
  const friendActivities = activitiesRes.rows.map((a) => {
    const liked = likedIds.has(a.id)
    return {
      id: a.id,
      friendId: a.friend_id,
      friendName: a.friend_name,
      avatar: a.avatar,
      questionKey: a.question_key,
      questionLabel: a.question_label,
      answer: a.answer,
      answerEmoji: a.answer_emoji,
      timeAgo: a.time_ago,
      likes: a.base_likes + (liked ? 1 : 0),
      liked,
    }
  })

  const memberByChallenge = new Map<string, number>()
  for (const m of membersRes.rows) memberByChallenge.set(m.challenge_id, m.progress)

  const challenges = challengesRes.rows.map((c) => {
    const joined = memberByChallenge.has(c.id)
    const participantIds: string[] = c.participant_ids
    const participants = participantIds
      .map((id) => friendsById.get(id))
      .filter((f): f is Friend => Boolean(f))
    return {
      id: c.id,
      title: c.title,
      description: c.description,
      emoji: c.emoji,
      duration: c.duration,
      daysLeft: c.days_left,
      participants,
      participantCount: c.base_participant_count + (joined ? 1 : 0),
      joined,
      progress: joined ? (memberByChallenge.get(c.id) ?? 0) : 0,
      color: c.color,
      type: c.type,
    }
  })

  const earnedBadges = new Map<string, string>()
  for (const b of userBadgesRes.rows) earnedBadges.set(b.badge_id, b.earned_at)

  const badges = badgesRes.rows.map((b) => {
    const earnedAt = earnedBadges.get(b.id)
    return {
      id: b.id,
      name: b.name,
      description: b.description,
      emoji: b.emoji,
      earned: Boolean(earnedAt),
      earnedDate: earnedAt ?? undefined,
      rarity: b.rarity,
    }
  })

  const todayAnswers: Record<string, number> = todayRes.rows[0]?.answers ?? {}
  const todayCheckedIn = user.last_check_in_date === today()

  return {
    userName: user.name,
    avatar: user.avatar,
    profile: {
      age: user.age ?? null,
      // NUMERIC comes back from pg as a string — coerce to number.
      heightCm: user.height_cm != null ? Number(user.height_cm) : null,
      weightKg: user.weight_kg != null ? Number(user.weight_kg) : null,
    },
    level: user.level,
    xp: user.xp,
    xpToNextLevel: user.xp_to_next_level,
    streak: user.streak,
    longestStreak: user.longest_streak,
    totalCheckIns: user.total_check_ins,
    todayCheckedIn,
    todayAnswers,
    friendActivities,
    challenges,
    badges,
  }
}
