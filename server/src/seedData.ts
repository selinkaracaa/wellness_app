// Global seed data, mirrored from src/data/mockData.ts so the API returns the
// exact shapes the frontend already renders. Keep keys/ids aligned with the
// client (water/activity/nutrition/sleep/screen/mood, friend ids f1..f5).

export const FRIENDS = [
  { id: 'f1', name: 'Maya', avatar: 'f1', streak: 12, level: 8 },
  { id: 'f2', name: 'Jake', avatar: 'f2', streak: 5, level: 4 },
  { id: 'f3', name: 'Selin', avatar: 'f3', streak: 21, level: 14 },
  { id: 'f4', name: 'Alex', avatar: 'f4', streak: 3, level: 3 },
  { id: 'f5', name: 'Priya', avatar: 'f5', streak: 8, level: 6 },
]

export const FRIEND_ACTIVITIES = [
  { id: 'a1', friendId: 'f3', friendName: 'Selin', avatar: 'f3', questionKey: 'activity', questionLabel: 'Activity level', answer: 'Crushed it', answerEmoji: 'activity', timeAgo: '2m ago', baseLikes: 4 },
  { id: 'a2', friendId: 'f1', friendName: 'Maya', avatar: 'f1', questionKey: 'water', questionLabel: 'Hydration', answer: '8 glasses', answerEmoji: 'water', timeAgo: '15m ago', baseLikes: 2 },
  { id: 'a3', friendId: 'f2', friendName: 'Jake', avatar: 'f2', questionKey: 'mood', questionLabel: 'Mood today', answer: 'Feeling great', answerEmoji: 'mood', timeAgo: '1h ago', baseLikes: 6 },
  { id: 'a4', friendId: 'f5', friendName: 'Priya', avatar: 'f5', questionKey: 'nutrition', questionLabel: 'Eating habits', answer: 'Pretty healthy', answerEmoji: 'nutrition', timeAgo: '2h ago', baseLikes: 3 },
  { id: 'a5', friendId: 'f4', friendName: 'Alex', avatar: 'f4', questionKey: 'screen', questionLabel: 'Screen time', answer: 'Stayed off TikTok', answerEmoji: 'screen', timeAgo: '3h ago', baseLikes: 9 },
  { id: 'a6', friendId: 'f1', friendName: 'Maya', avatar: 'f1', questionKey: 'sleep', questionLabel: 'Sleep quality', answer: 'Slept like a log', answerEmoji: 'sleep', timeAgo: '5h ago', baseLikes: 5 },
]

export const CHALLENGES = [
  { id: 'c1', title: '7-Day Hydration Sprint', description: 'Log 8 glasses of water every day for a week', emoji: '💧', duration: 7, daysLeft: 3, baseParticipantCount: 47, color: '#6366f1', type: 'water', participantIds: ['f1', 'f3', 'f5'] },
  { id: 'c2', title: 'Screen-Free Mornings', description: 'No phone for the first 30 min after waking up', emoji: '🌅', duration: 14, daysLeft: 14, baseParticipantCount: 23, color: '#f59e0b', type: 'screen', participantIds: ['f2', 'f4'] },
  { id: 'c3', title: 'Move Every Day', description: 'Rate your activity 3+ for 10 days straight', emoji: '🏃', duration: 10, daysLeft: 10, baseParticipantCount: 89, color: '#10b981', type: 'steps', participantIds: ['f1', 'f2', 'f3'] },
  { id: 'c4', title: '8-Hour Sleep Club', description: 'Log a good sleep rating for 5 days in a row', emoji: '😴', duration: 5, daysLeft: 2, baseParticipantCount: 34, color: '#8b5cf6', type: 'sleep', participantIds: ['f3', 'f5'] },
  { id: 'c5', title: 'Mindful Eating Week', description: 'Rate your nutrition 4+ every day for 7 days', emoji: '🥗', duration: 7, daysLeft: 7, baseParticipantCount: 56, color: '#ec4899', type: 'nutrition', participantIds: ['f1'] },
]

export const BADGES = [
  { id: 'b1', name: 'First Step', description: 'Completed your first check-in', emoji: '👣', rarity: 'common' },
  { id: 'b2', name: 'Hydration Hero', description: '7 days of hitting water goal', emoji: '💧', rarity: 'rare' },
  { id: 'b3', name: 'On Fire', description: '7-day streak', emoji: '🔥', rarity: 'rare' },
  { id: 'b4', name: 'Social Butterfly', description: "Liked 10 friends' activities", emoji: '🦋', rarity: 'common' },
  { id: 'b5', name: 'Sleep Champion', description: '5 consecutive good sleep ratings', emoji: '😴', rarity: 'epic' },
  { id: 'b6', name: 'Clean Eater', description: 'Rate nutrition 4+ for 14 days', emoji: '🥗', rarity: 'epic' },
  { id: 'b7', name: 'Screen Warrior', description: 'Beat your screen time 10 days in a row', emoji: '📵', rarity: 'rare' },
  { id: 'b8', name: 'Unstoppable', description: '30-day streak', emoji: '⚡', rarity: 'legendary' },
  { id: 'b9', name: 'Social Star', description: 'Have 5 friends join a challenge you started', emoji: '⭐', rarity: 'legendary' },
]

// XP per check-in question, mirrored from CHECK_IN_QUESTIONS in the client.
export const QUESTION_XP: Record<string, number> = {
  water: 15,
  activity: 20,
  nutrition: 20,
  sleep: 15,
  screen: 15,
  mood: 10,
}
