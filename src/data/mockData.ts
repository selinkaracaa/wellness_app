import type { CoreMetric } from './habitPool'

export interface Friend {
  id: string
  name: string
  avatar: string
  streak: number
  level: number
}

export interface Cycle {
  id: string
  name: string
  memberIds: string[]
  powerScore: number
  globalRank: number
  color: string
}

export interface CyclePhotoPost {
  id: string
  cycleId: string
  friendId: string
  friendName: string
  avatar: string
  imageUrl: string
  prompt: string
  timeAgo: string
  verified: boolean
}

export interface DailyPhotoChallenge {
  id: string
  prompt: string
  cvCategory: 'hydration' | 'nutrition' | 'movement' | 'general'
  expiresIn: string
}

export interface CycleLeaderboardEntry {
  rank: number
  cycleId: string
  cycleName: string
  powerScore: number
  memberCount: number
  isUserCycle: boolean
  trend: 'up' | 'down' | 'same'
}

export interface FriendActivity {
  id: string
  friendId: string
  friendName: string
  avatar: string
  questionKey: string
  questionLabel: string
  answer: string
  timeAgo: string
  likes: number
  liked: boolean
}

export interface Badge {
  id: string
  name: string
  description: string
  earned: boolean
  earnedDate?: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

const photo = (id: string) =>
  `https://images.unsplash.com/${id}?w=600&q=90&auto=format&fit=crop`

export const FRIENDS: Friend[] = [
  { id: 'f1', name: 'Maya', avatar: 'f1', streak: 12, level: 8 },
  { id: 'f2', name: 'Jake', avatar: 'f2', streak: 5, level: 4 },
  { id: 'f3', name: 'Selin', avatar: 'f3', streak: 21, level: 14 },
  { id: 'f4', name: 'Alex', avatar: 'f4', streak: 3, level: 3 },
  { id: 'f5', name: 'Priya', avatar: 'f5', streak: 8, level: 6 },
]

export const CYCLES: Cycle[] = [
  {
    id: 'cycle-family',
    name: 'Family',
    memberIds: ['f1', 'f3', 'f5', 'you'],
    powerScore: 2840,
    globalRank: 3,
    color: '#FF9A56',
  },
  {
    id: 'cycle-college',
    name: 'College Friends',
    memberIds: ['f2', 'f4', 'you'],
    powerScore: 1920,
    globalRank: 7,
    color: '#6B5CE8',
  },
  {
    id: 'cycle-gym',
    name: 'Gym Crew',
    memberIds: ['f1', 'f2', 'you'],
    powerScore: 2150,
    globalRank: 5,
    color: '#10b981',
  },
]

export const DAILY_PHOTO_CHALLENGE: DailyPhotoChallenge = {
  id: 'daily-1',
  prompt: 'Show your current walking view',
  cvCategory: 'movement',
  expiresIn: '4h 22m',
}

export const CYCLE_PHOTO_POSTS: CyclePhotoPost[] = [
  {
    id: 'p1',
    cycleId: 'cycle-family',
    friendId: 'f3',
    friendName: 'Selin',
    avatar: 'f3',
    imageUrl: photo('photo-1541802648775-11ad4f7e9869'),
    prompt: 'Show your current walking view',
    timeAgo: '12m ago',
    verified: true,
  },
  {
    id: 'p2',
    cycleId: 'cycle-family',
    friendId: 'f1',
    friendName: 'Maya',
    avatar: 'f1',
    imageUrl: photo('photo-1491438580894-9f0e163e01a9'),
    prompt: 'Show your current walking view',
    timeAgo: '34m ago',
    verified: true,
  },
  {
    id: 'p3',
    cycleId: 'cycle-family',
    friendId: 'f5',
    friendName: 'Priya',
    avatar: 'f5',
    imageUrl: photo('photo-1520977617325-aa7d64d91c0e'),
    prompt: 'Show your current walking view',
    timeAgo: '1h ago',
    verified: true,
  },
  {
    id: 'p4',
    cycleId: 'cycle-college',
    friendId: 'f2',
    friendName: 'Jake',
    avatar: 'f2',
    imageUrl: photo('photo-1519338244931-91975bbce2f9'),
    prompt: 'Show your current walking view',
    timeAgo: '28m ago',
    verified: true,
  },
  {
    id: 'p5',
    cycleId: 'cycle-college',
    friendId: 'f4',
    friendName: 'Alex',
    avatar: 'f4',
    imageUrl: photo('photo-1464226184883-fa1668232a38'),
    prompt: 'Show your current walking view',
    timeAgo: '45m ago',
    verified: true,
  },
  {
    id: 'p6',
    cycleId: 'cycle-gym',
    friendId: 'f1',
    friendName: 'Maya',
    avatar: 'f1',
    imageUrl: photo('photo-1476480862128-209bfaa8edc8'),
    prompt: 'Show your current walking view',
    timeAgo: '18m ago',
    verified: true,
  },
]

export const CYCLE_LEADERBOARD: CycleLeaderboardEntry[] = [
  { rank: 1, cycleId: 'c-ext-1', cycleName: 'Brooklyn Run Club', powerScore: 4120, memberCount: 8, isUserCycle: false, trend: 'up' },
  { rank: 2, cycleId: 'c-ext-2', cycleName: 'Wellness Warriors', powerScore: 3680, memberCount: 6, isUserCycle: false, trend: 'same' },
  { rank: 3, cycleId: 'cycle-family', cycleName: 'Family', powerScore: 2840, memberCount: 4, isUserCycle: true, trend: 'up' },
  { rank: 4, cycleId: 'c-ext-3', cycleName: 'Morning Crew', powerScore: 2650, memberCount: 5, isUserCycle: false, trend: 'down' },
  { rank: 5, cycleId: 'cycle-gym', cycleName: 'Gym Crew', powerScore: 2150, memberCount: 3, isUserCycle: true, trend: 'up' },
  { rank: 6, cycleId: 'c-ext-4', cycleName: 'Plant Parents', powerScore: 2010, memberCount: 7, isUserCycle: false, trend: 'up' },
  { rank: 7, cycleId: 'cycle-college', cycleName: 'College Friends', powerScore: 1920, memberCount: 3, isUserCycle: true, trend: 'down' },
]

export const FRIEND_ACTIVITIES: FriendActivity[] = []

export const BADGES: Badge[] = [
  { id: 'b1', name: 'First Awareness', description: 'Completed your first self-assessment', earned: false, rarity: 'common' },
  { id: 'b2', name: 'Honest Logger', description: 'Logged a 1/5 and kept your streak', earned: false, rarity: 'rare' },
  { id: 'b3', name: 'Awareness Streak', description: '7-day consistency streak', earned: false, rarity: 'rare' },
  { id: 'b4', name: 'Cycle Unlocked', description: 'Submitted your first daily photo', earned: false, rarity: 'common' },
  { id: 'b5', name: 'Team Player', description: 'Contributed to your Cycle Power Score', earned: false, rarity: 'epic' },
  { id: 'b6', name: 'Weekly Tune-Up', description: 'Completed AI recalibration check-in', earned: false, rarity: 'epic' },
  { id: 'b7', name: 'Cycle Champion', description: 'Your Cycle reached top 3 globally', earned: false, rarity: 'legendary' },
  { id: 'b8', name: 'Unstoppable', description: '30-day awareness streak', earned: false, rarity: 'legendary' },
]

export const CHECK_IN_QUESTIONS: CoreMetric[] = []
