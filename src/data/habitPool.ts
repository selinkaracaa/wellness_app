export type GoalId = 'weight_loss' | 'muscle_gain' | 'energy' | 'stress' | 'sleep'

export interface MetricOption {
  value: number
  label: string
  color: string
}

export interface CoreMetric {
  key: string
  label: string
  type: 'water' | 'activity' | 'nutrition' | 'sleep' | 'screen' | 'mindful' | 'steps' | 'rating'
  options: MetricOption[]
  xp: number
  goalTags: GoalId[]
  cvCategory?: 'hydration' | 'nutrition' | 'movement' | 'general'
}

export const GOALS: { id: GoalId; label: string; description: string }[] = [
  { id: 'weight_loss', label: 'Weight loss', description: 'Body composition and metabolic health' },
  { id: 'muscle_gain', label: 'Muscle gain', description: 'Strength and protein optimization' },
  { id: 'energy', label: 'More energy', description: 'Sustained vitality throughout the day' },
  { id: 'stress', label: 'Stress reduction', description: 'Calm mind and emotional balance' },
  { id: 'sleep', label: 'Better sleep', description: 'Sleep structure and recovery' },
]

const RATING_OPTIONS = (labels: [string, string, string, string, string]): MetricOption[] =>
  labels.map((label, i) => ({
    value: i + 1,
    label,
    color: ['#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981'][i],
  }))

export const HABIT_POOL: CoreMetric[] = [
  {
    key: 'steps',
    label: 'How were your steps today?',
    type: 'steps',
    goalTags: ['weight_loss', 'energy', 'muscle_gain'],
    cvCategory: 'movement',
    xp: 20,
    options: RATING_OPTIONS([
      'Barely moved',
      'Under 3k steps',
      'Moderate pace',
      'Hit my goal',
      'Crushed it',
    ]),
  },
  {
    key: 'protein',
    label: 'How was your protein intake?',
    type: 'nutrition',
    goalTags: ['weight_loss', 'muscle_gain'],
    cvCategory: 'nutrition',
    xp: 20,
    options: RATING_OPTIONS([
      'Almost none',
      'A little',
      'Half my target',
      'Mostly there',
      'Hit my target',
    ]),
  },
  {
    key: 'greens',
    label: 'How much green intake did you get?',
    type: 'nutrition',
    goalTags: ['weight_loss', 'energy'],
    cvCategory: 'nutrition',
    xp: 20,
    options: RATING_OPTIONS([
      'No veggies',
      'A few bites',
      'One serving',
      'Good variety',
      'Loaded with greens',
    ]),
  },
  {
    key: 'water',
    label: 'How hydrated were you today?',
    type: 'water',
    goalTags: ['weight_loss', 'energy', 'muscle_gain', 'sleep'],
    cvCategory: 'hydration',
    xp: 15,
    options: RATING_OPTIONS([
      'Barely drank',
      '2-4 glasses',
      '4-6 glasses',
      '6-8 glasses',
      '8+ glasses',
    ]),
  },
  {
    key: 'sports',
    label: 'How was your movement session?',
    type: 'activity',
    goalTags: ['weight_loss', 'muscle_gain', 'energy'],
    cvCategory: 'movement',
    xp: 20,
    options: RATING_OPTIONS([
      'No workout',
      'Light stretch',
      'Short session',
      'Solid workout',
      'Beast mode',
    ]),
  },
  {
    key: 'sleep',
    label: 'How was last night\'s sleep?',
    type: 'sleep',
    goalTags: ['sleep', 'energy', 'stress'],
    xp: 15,
    options: RATING_OPTIONS([
      'Barely slept',
      'Pretty rough',
      'It was okay',
      'Pretty good',
      'Slept like a baby',
    ]),
  },
  {
    key: 'mindfulness',
    label: 'How mindful were you today?',
    type: 'mindful',
    goalTags: ['stress', 'sleep'],
    xp: 15,
    options: RATING_OPTIONS([
      'Completely scattered',
      'A bit anxious',
      'Neutral',
      'Mostly calm',
      'Deeply present',
    ]),
  },
  {
    key: 'screen',
    label: 'How was your screen time today?',
    type: 'screen',
    goalTags: ['sleep', 'stress', 'energy'],
    xp: 15,
    options: RATING_OPTIONS([
      'Glued to my phone',
      'More than usual',
      'About average',
      'Pretty mindful',
      'Phone who?',
    ]),
  },
  {
    key: 'mood',
    label: 'How are you feeling overall?',
    type: 'rating',
    goalTags: ['stress', 'energy'],
    xp: 10,
    options: RATING_OPTIONS([
      'Pretty rough',
      'A bit off',
      'Neutral',
      'Good vibes',
      'On top of the world',
    ]),
  },
  {
    key: 'recovery',
    label: 'How well did you recover today?',
    type: 'rating',
    goalTags: ['muscle_gain', 'sleep'],
    xp: 15,
    options: RATING_OPTIONS([
      'Still sore & tired',
      'Below average',
      'Average',
      'Feeling refreshed',
      'Fully recovered',
    ]),
  },
]
