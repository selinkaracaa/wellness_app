export interface Friend {
  id: string
  name: string
  avatar: string
  streak: number
  level: number
}

export interface FriendActivity {
  id: string
  friendId: string
  friendName: string
  avatar: string
  questionKey: string
  questionLabel: string
  answer: string
  answerEmoji: string
  timeAgo: string
  likes: number
  liked: boolean
}

export interface Challenge {
  id: string
  title: string
  description: string
  emoji: string
  duration: number // days
  daysLeft: number
  participants: Friend[]
  participantCount: number
  joined: boolean
  progress: number // 0-100
  color: string
  type: 'water' | 'steps' | 'sleep' | 'screen' | 'mindful' | 'nutrition'
}

export interface Badge {
  id: string
  name: string
  description: string
  emoji: string
  earned: boolean
  earnedDate?: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

export const FRIENDS: Friend[] = [
  { id: 'f1', name: 'Maya', avatar: 'f1', streak: 12, level: 8 },
  { id: 'f2', name: 'Jake', avatar: 'f2', streak: 5, level: 4 },
  { id: 'f3', name: 'Selin', avatar: 'f3', streak: 21, level: 14 },
  { id: 'f4', name: 'Alex', avatar: 'f4', streak: 3, level: 3 },
  { id: 'f5', name: 'Priya', avatar: 'f5', streak: 8, level: 6 },
]

export const FRIEND_ACTIVITIES: FriendActivity[] = [
  {
    id: 'a1',
    friendId: 'f3',
    friendName: 'Selin',
    avatar: 'f3',
    questionKey: 'activity',
    questionLabel: 'Activity level',
    answer: 'Crushed it',
    answerEmoji: 'activity',
    timeAgo: '2m ago',
    likes: 4,
    liked: false,
  },
  {
    id: 'a2',
    friendId: 'f1',
    friendName: 'Maya',
    avatar: 'f1',
    questionKey: 'water',
    questionLabel: 'Hydration',
    answer: '8 glasses',
    answerEmoji: 'water',
    timeAgo: '15m ago',
    likes: 2,
    liked: true,
  },
  {
    id: 'a3',
    friendId: 'f2',
    friendName: 'Jake',
    avatar: 'f2',
    questionKey: 'mood',
    questionLabel: 'Mood today',
    answer: 'Feeling great',
    answerEmoji: 'mood',
    timeAgo: '1h ago',
    likes: 6,
    liked: false,
  },
  {
    id: 'a4',
    friendId: 'f5',
    friendName: 'Priya',
    avatar: 'f5',
    questionKey: 'nutrition',
    questionLabel: 'Eating habits',
    answer: 'Pretty healthy',
    answerEmoji: 'nutrition',
    timeAgo: '2h ago',
    likes: 3,
    liked: false,
  },
  {
    id: 'a5',
    friendId: 'f4',
    friendName: 'Alex',
    avatar: 'f4',
    questionKey: 'screen',
    questionLabel: 'Screen time',
    answer: 'Stayed off TikTok',
    answerEmoji: 'screen',
    timeAgo: '3h ago',
    likes: 9,
    liked: true,
  },
  {
    id: 'a6',
    friendId: 'f1',
    friendName: 'Maya',
    avatar: 'f1',
    questionKey: 'sleep',
    questionLabel: 'Sleep quality',
    answer: 'Slept like a log',
    answerEmoji: 'sleep',
    timeAgo: '5h ago',
    likes: 5,
    liked: false,
  },
]

export const CHALLENGES: Challenge[] = [
  {
    id: 'c1',
    title: '7-Day Hydration Sprint',
    description: 'Log 8 glasses of water every day for a week',
    emoji: '💧',
    duration: 7,
    daysLeft: 3,
    participants: [FRIENDS[0], FRIENDS[2], FRIENDS[4]],
    participantCount: 47,
    joined: true,
    progress: 57,
    color: '#6366f1',
    type: 'water',
  },
  {
    id: 'c2',
    title: 'Screen-Free Mornings',
    description: 'No phone for the first 30 min after waking up',
    emoji: '🌅',
    duration: 14,
    daysLeft: 14,
    participants: [FRIENDS[1], FRIENDS[3]],
    participantCount: 23,
    joined: false,
    progress: 0,
    color: '#f59e0b',
    type: 'screen',
  },
  {
    id: 'c3',
    title: 'Move Every Day',
    description: 'Rate your activity 3+ for 10 days straight',
    emoji: '🏃',
    duration: 10,
    daysLeft: 10,
    participants: [FRIENDS[0], FRIENDS[1], FRIENDS[2]],
    participantCount: 89,
    joined: false,
    progress: 0,
    color: '#10b981',
    type: 'steps',
  },
  {
    id: 'c4',
    title: '8-Hour Sleep Club',
    description: 'Log a good sleep rating for 5 days in a row',
    emoji: '😴',
    duration: 5,
    daysLeft: 2,
    participants: [FRIENDS[2], FRIENDS[4]],
    participantCount: 34,
    joined: true,
    progress: 80,
    color: '#8b5cf6',
    type: 'sleep',
  },
  {
    id: 'c5',
    title: 'Mindful Eating Week',
    description: 'Rate your nutrition 4+ every day for 7 days',
    emoji: '🥗',
    duration: 7,
    daysLeft: 7,
    participants: [FRIENDS[0]],
    participantCount: 56,
    joined: false,
    progress: 0,
    color: '#ec4899',
    type: 'nutrition',
  },
]

export const BADGES: Badge[] = [
  { id: 'b1', name: 'First Step', description: 'Completed your first check-in', emoji: '👣', earned: true, earnedDate: '2 weeks ago', rarity: 'common' },
  { id: 'b2', name: 'Hydration Hero', description: '7 days of hitting water goal', emoji: '💧', earned: true, earnedDate: '1 week ago', rarity: 'rare' },
  { id: 'b3', name: 'On Fire', description: '7-day streak', emoji: '🔥', earned: true, earnedDate: '5 days ago', rarity: 'rare' },
  { id: 'b4', name: 'Social Butterfly', description: 'Liked 10 friends\' activities', emoji: '🦋', earned: true, earnedDate: '3 days ago', rarity: 'common' },
  { id: 'b5', name: 'Sleep Champion', description: '5 consecutive good sleep ratings', emoji: '😴', earned: false, rarity: 'epic' },
  { id: 'b6', name: 'Clean Eater', description: 'Rate nutrition 4+ for 14 days', emoji: '🥗', earned: false, rarity: 'epic' },
  { id: 'b7', name: 'Screen Warrior', description: 'Beat your screen time 10 days in a row', emoji: '📵', earned: false, rarity: 'rare' },
  { id: 'b8', name: 'Unstoppable', description: '30-day streak', emoji: '⚡', earned: false, rarity: 'legendary' },
  { id: 'b9', name: 'Social Star', description: 'Have 5 friends join a challenge you started', emoji: '⭐', earned: false, rarity: 'legendary' },
]

export const CHECK_IN_QUESTIONS = [
  {
    key: 'water',
    label: 'How hydrated were you today?',
    emoji: '💧',
    type: 'water' as const,
    options: [
      { value: 1, label: 'Barely drank', emoji: '🏜️', color: '#ef4444' },
      { value: 2, label: '2-4 glasses', emoji: '😅', color: '#f97316' },
      { value: 3, label: '4-6 glasses', emoji: '😊', color: '#eab308' },
      { value: 4, label: '6-8 glasses', emoji: '💪', color: '#22c55e' },
      { value: 5, label: '8+ glasses', emoji: '🌊', color: '#3b82f6' },
    ],
    xp: 15,
  },
  {
    key: 'activity',
    label: 'How active were you today?',
    emoji: '🏃',
    type: 'rating' as const,
    options: [
      { value: 1, label: 'Full couch mode', emoji: '🛋️', color: '#ef4444' },
      { value: 2, label: 'Light movement', emoji: '🚶', color: '#f97316' },
      { value: 3, label: 'Moderate activity', emoji: '🚴', color: '#eab308' },
      { value: 4, label: 'Good workout', emoji: '🏋️', color: '#22c55e' },
      { value: 5, label: 'Absolutely crushed it', emoji: '🔥', color: '#10b981' },
    ],
    xp: 20,
  },
  {
    key: 'nutrition',
    label: 'How did you eat today?',
    emoji: '🥗',
    type: 'rating' as const,
    options: [
      { value: 1, label: 'Total junk fest', emoji: '🍟', color: '#ef4444' },
      { value: 2, label: 'Mostly meh', emoji: '🤷', color: '#f97316' },
      { value: 3, label: 'Balanced-ish', emoji: '🥙', color: '#eab308' },
      { value: 4, label: 'Proud of it', emoji: '🥗', color: '#22c55e' },
      { value: 5, label: 'Absolutely clean', emoji: '✨', color: '#10b981' },
    ],
    xp: 20,
  },
  {
    key: 'sleep',
    label: 'How was last night\'s sleep?',
    emoji: '😴',
    type: 'rating' as const,
    options: [
      { value: 1, label: 'Barely slept', emoji: '😵', color: '#ef4444' },
      { value: 2, label: 'Pretty rough', emoji: '😪', color: '#f97316' },
      { value: 3, label: 'It was okay', emoji: '😐', color: '#eab308' },
      { value: 4, label: 'Pretty good', emoji: '😊', color: '#22c55e' },
      { value: 5, label: 'Slept like a baby', emoji: '😴', color: '#10b981' },
    ],
    xp: 15,
  },
  {
    key: 'screen',
    label: 'How was your screen time today?',
    emoji: '📱',
    type: 'rating' as const,
    options: [
      { value: 1, label: 'Glued to my phone', emoji: '😬', color: '#ef4444' },
      { value: 2, label: 'More than usual', emoji: '😅', color: '#f97316' },
      { value: 3, label: 'About average', emoji: '📊', color: '#eab308' },
      { value: 4, label: 'Pretty mindful', emoji: '💡', color: '#22c55e' },
      { value: 5, label: 'Phone who? 😎', emoji: '📵', color: '#10b981' },
    ],
    xp: 15,
  },
  {
    key: 'mood',
    label: 'How are you feeling overall?',
    emoji: '😊',
    type: 'rating' as const,
    options: [
      { value: 1, label: 'Pretty rough', emoji: '😔', color: '#ef4444' },
      { value: 2, label: 'A bit off', emoji: '😕', color: '#f97316' },
      { value: 3, label: 'Neutral', emoji: '😐', color: '#eab308' },
      { value: 4, label: 'Good vibes', emoji: '😊', color: '#22c55e' },
      { value: 5, label: 'On top of the world', emoji: '🌟', color: '#10b981' },
    ],
    xp: 10,
  },
]
