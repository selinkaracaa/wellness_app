import type { CoreMetric, GoalId } from '../data/habitPool'
import { GOALS } from '../data/habitPool'
import type { CheckInEntry } from '../context/AppContext'
import { categoryPillLabel } from '../design/categoryTags'

export interface Recommendation {
  title: string
  body: string
  /** Optional related metric key, used to pick an accent/icon in the UI. */
  metricKey?: string
}

export interface RecommendationResult {
  recs: Recommendation[]
  /** Where the recommendations came from — surfaced subtly in the UI. */
  source: 'gemini' | 'fallback'
}

export interface RecommendationInput {
  userName: string
  goals: GoalId[]
  metrics: CoreMetric[]
  checkIns: CheckInEntry[]
  streak: number
  totalCheckIns: number
  todayCheckedIn: boolean
}

interface MetricSummary {
  key: string
  label: string
  /** Average over the recent window (1-5), or null if never logged. */
  avg: number | null
  latest: number | null
  trend: 'up' | 'down' | 'flat' | 'none'
}

const RECENT_WINDOW = 7

function round1(n: number): number {
  return Math.round(n * 10) / 10
}

/** Build a compact behavioral summary per tracked metric from recent check-ins. */
function summarizeMetrics(input: RecommendationInput): MetricSummary[] {
  const window = input.checkIns.slice(-RECENT_WINDOW)
  return input.metrics.map((m) => {
    const values = window.map((c) => c.answers[m.key]).filter((v): v is number => v != null)
    if (values.length === 0) {
      return { key: m.key, label: categoryPillLabel(m.key), avg: null, latest: null, trend: 'none' as const }
    }
    const avg = values.reduce((s, v) => s + v, 0) / values.length
    const latest = values[values.length - 1]
    let trend: MetricSummary['trend'] = 'flat'
    if (values.length >= 4) {
      const half = Math.floor(values.length / 2)
      const firstAvg = values.slice(0, half).reduce((s, v) => s + v, 0) / half
      const secondAvg = values.slice(half).reduce((s, v) => s + v, 0) / (values.length - half)
      const delta = secondAvg - firstAvg
      trend = delta > 0.4 ? 'up' : delta < -0.4 ? 'down' : 'flat'
    }
    return { key: m.key, label: categoryPillLabel(m.key), avg: round1(avg), latest, trend }
  })
}

function goalLabels(goals: GoalId[]): string[] {
  return goals.map((g) => GOALS.find((x) => x.id === g)?.label ?? g)
}

function buildPrompt(input: RecommendationInput, summaries: MetricSummary[]): string {
  const goals = goalLabels(input.goals)
  const metricLines = summaries
    .map((s) =>
      s.avg == null
        ? `- ${s.label}: not logged yet`
        : `- ${s.label}: avg ${s.avg}/5, latest ${s.latest}/5, trend ${s.trend}`
    )
    .join('\n')

  return [
    'You are a warm, concise wellness coach inside "Cycles", a daily self-check-in app.',
    'The app\'s core philosophy is "awareness over perfection": consistently showing up matters more than perfect scores. Never shame the user.',
    '',
    `Write exactly 3 short, specific, encouraging recommendations for ${input.userName || 'the user'} for tomorrow, grounded in their actual data below.`,
    'Rules:',
    '- Each "title": at most 4 words, punchy.',
    '- Each "body": ONE sentence, at most 18 words, concrete and actionable.',
    '- Reference real trends (e.g. a low or falling metric to nudge, or a strong one to reinforce).',
    '- Tie advice to their stated goals where natural. Stay kind and non-judgmental.',
    '- Set "metricKey" to the single most relevant key from this list, or omit it: ' +
      summaries.map((s) => s.key).join(', ') + '.',
    '',
    `Goals: ${goals.length ? goals.join(', ') : 'general wellbeing'}`,
    `Logging streak: ${input.streak} days. Total check-ins: ${input.totalCheckIns}. Checked in today: ${input.todayCheckedIn ? 'yes' : 'not yet'}.`,
    'Recent self-ratings (1 worst – 5 best):',
    metricLines || '- no check-ins yet',
    '',
    'Return ONLY a JSON array of exactly 3 objects with keys "title", "body", and optional "metricKey".',
  ].join('\n')
}

const GEMINI_SCHEMA = {
  type: 'ARRAY',
  items: {
    type: 'OBJECT',
    properties: {
      title: { type: 'STRING' },
      body: { type: 'STRING' },
      metricKey: { type: 'STRING' },
    },
    required: ['title', 'body'],
  },
}

function sanitize(recs: unknown, validKeys: Set<string>): Recommendation[] {
  if (!Array.isArray(recs)) return []
  return recs
    .filter((r): r is Record<string, unknown> => !!r && typeof r === 'object')
    .map((r) => {
      const title = typeof r.title === 'string' ? r.title.trim() : ''
      const body = typeof r.body === 'string' ? r.body.trim() : ''
      const metricKey =
        typeof r.metricKey === 'string' && validKeys.has(r.metricKey) ? r.metricKey : undefined
      return { title, body, metricKey }
    })
    .filter((r) => r.title && r.body)
    .slice(0, 3)
}

async function callGemini(input: RecommendationInput, summaries: MetricSummary[]): Promise<Recommendation[]> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined
  if (!apiKey) throw new Error('VITE_GEMINI_API_KEY is not set')
  const model = (import.meta.env.VITE_GEMINI_MODEL as string | undefined) || 'gemini-2.5-flash'

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: buildPrompt(input, summaries) }] }],
        generationConfig: {
          temperature: 0.8,
          responseMimeType: 'application/json',
          responseSchema: GEMINI_SCHEMA,
        },
      }),
    }
  )

  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(`Gemini request failed (${res.status}): ${detail.slice(0, 200)}`)
  }

  const data = await res.json()
  const text: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) throw new Error('Gemini returned no content')

  const parsed = JSON.parse(text)
  const validKeys = new Set(summaries.map((s) => s.key))
  const recs = sanitize(parsed, validKeys)
  if (recs.length < 3) throw new Error('Gemini returned fewer than 3 valid recommendations')
  return recs
}

/** Per-metric copy used when the API is unavailable. */
const FALLBACK_COPY: Record<string, { low: Recommendation; high: Recommendation }> = {
  steps: {
    low: { title: 'Take a short walk', body: 'Your step counts dipped — a 10-minute walk tomorrow keeps momentum without pressure.', metricKey: 'steps' },
    high: { title: 'Keep stepping', body: 'Your movement is strong — protect it with one walk you already enjoy.', metricKey: 'steps' },
  },
  protein: {
    low: { title: 'Anchor your protein', body: 'Add one protein source to your first meal to steady energy toward your goal.', metricKey: 'protein' },
    high: { title: 'Solid protein', body: 'Protein is on track — keep your easiest go-to meal in rotation.', metricKey: 'protein' },
  },
  greens: {
    low: { title: 'One handful of greens', body: 'Greens have been light — add a single serving to any meal tomorrow.', metricKey: 'greens' },
    high: { title: 'Greens on point', body: 'Your veggie intake is great — repeat the meal that made it easy.', metricKey: 'greens' },
  },
  water: {
    low: { title: 'Hydrate early', body: 'Hydration ran low — keep a glass at your desk and refill before lunch.', metricKey: 'water' },
    high: { title: 'Stay hydrated', body: 'Water intake looks healthy — keep your bottle within reach tomorrow.', metricKey: 'water' },
  },
  sports: {
    low: { title: 'Move gently', body: 'No need for beast mode — a short stretch session still counts and rebuilds rhythm.', metricKey: 'sports' },
    high: { title: 'Great movement', body: 'Your sessions are strong — schedule tomorrow\'s now so it actually happens.', metricKey: 'sports' },
  },
  sleep: {
    low: { title: 'Protect your sleep', body: 'Sleep has been rough — try a fixed wind-down time tonight, even 15 minutes earlier.', metricKey: 'sleep' },
    high: { title: 'Sleep is steady', body: 'Your rest is paying off — guard the bedtime that\'s working for you.', metricKey: 'sleep' },
  },
  mindfulness: {
    low: { title: 'One calm minute', body: 'Take a single mindful minute tomorrow — awareness counts more than a long session.', metricKey: 'mindfulness' },
    high: { title: 'Stay present', body: 'Your mindfulness is strong — keep the small habit that grounds your day.', metricKey: 'mindfulness' },
  },
  screen: {
    low: { title: 'Trim screen time', body: 'Screens crept up — pick one hour tomorrow to put the phone out of reach.', metricKey: 'screen' },
    high: { title: 'Mindful with screens', body: 'You\'re managing screens well — keep your phone out of the bedroom.', metricKey: 'screen' },
  },
  mood: {
    low: { title: 'Be kind to yourself', body: 'Mood\'s been low — one small thing you enjoy tomorrow matters more than productivity.', metricKey: 'mood' },
    high: { title: 'Ride the good vibes', body: 'Your mood is bright — notice what fueled it and lean in tomorrow.', metricKey: 'mood' },
  },
  recovery: {
    low: { title: 'Prioritize recovery', body: 'Recovery is lagging — add light mobility and an earlier night to bounce back.', metricKey: 'recovery' },
    high: { title: 'Well recovered', body: 'Recovery looks great — you\'ve earned room for a slightly harder session.', metricKey: 'recovery' },
  },
}

/** Deterministic, offline recommendation generator used as a graceful fallback. */
export function heuristicRecommendations(input: RecommendationInput): Recommendation[] {
  const summaries = summarizeMetrics(input)
  const logged = summaries.filter((s) => s.avg != null)
  const recs: Recommendation[] = []
  const usedKeys = new Set<string>()

  // Target the two lowest-scoring tracked metrics first.
  const lowest = [...logged].sort((a, b) => (a.avg ?? 5) - (b.avg ?? 5))
  for (const s of lowest) {
    if (recs.length >= 2) break
    const copy = FALLBACK_COPY[s.key]
    if (copy && !usedKeys.has(s.key)) {
      recs.push((s.avg ?? 3) < 3.5 ? copy.low : copy.high)
      usedKeys.add(s.key)
    }
  }

  // Reinforce the strongest metric.
  const strongest = [...logged].sort((a, b) => (b.avg ?? 0) - (a.avg ?? 0))[0]
  if (strongest && !usedKeys.has(strongest.key) && FALLBACK_COPY[strongest.key]) {
    recs.push(FALLBACK_COPY[strongest.key].high)
    usedKeys.add(strongest.key)
  }

  // Fill any remaining slots with goal/consistency-oriented copy.
  const goals = goalLabels(input.goals)
  const filler: Recommendation[] = [
    {
      title: 'Show up tomorrow',
      body: input.streak > 0
        ? `You're on a ${input.streak}-day streak — a quick check-in keeps it alive, any score counts.`
        : 'Start a streak with one honest check-in tomorrow — showing up is the whole win.',
    },
    {
      title: 'Mind your goal',
      body: goals.length
        ? `Keep ${goals[0].toLowerCase()} front of mind with one small, repeatable choice tomorrow.`
        : 'Pick one small, repeatable choice tomorrow and let consistency do the rest.',
    },
    {
      title: 'Notice the patterns',
      body: 'Glance at your trends tonight — awareness of what shifted is half the progress.',
    },
  ]
  for (const f of filler) {
    if (recs.length >= 3) break
    recs.push(f)
  }

  return recs.slice(0, 3)
}

/** Fetch 3 recommendations from Gemini, falling back to on-device heuristics on any failure. */
export async function getRecommendations(input: RecommendationInput): Promise<RecommendationResult> {
  const summaries = summarizeMetrics(input)
  try {
    const recs = await callGemini(input, summaries)
    return { recs, source: 'gemini' }
  } catch (err) {
    if (import.meta.env.DEV) console.warn('[recommendations] falling back to heuristic:', err)
    return { recs: heuristicRecommendations(input), source: 'fallback' }
  }
}
