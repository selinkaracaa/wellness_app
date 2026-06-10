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
    'You are a candid but supportive wellness coach inside "Cycles", a daily self-check-in app.',
    'Philosophy: "awareness over perfection" — showing up matters more than perfect scores. Be encouraging overall, but be HONEST and realistic; do not sugar-coat or cheerlead.',
    '',
    `Write exactly 3 short, specific recommendations for ${input.userName || 'the user'} for tomorrow, grounded in their actual data below.`,
    'Tone & balance:',
    '- Aim for a realistic mix that is GENERALLY positive but NOT uniformly upbeat.',
    '- At least one recommendation must candidly name a real weak spot, a declining trend, or something the user genuinely needs to work on — do not praise metrics the data shows are low.',
    '- Roughly one recommendation should reinforce something that is genuinely going well (only if the data supports it).',
    "- It's fine to be direct or mildly challenging when the data warrants it, but never harsh, shaming, or alarmist.",
    'Rules:',
    '- Each "title": at most 4 words, punchy.',
    '- Each "body": ONE sentence, at most 18 words, concrete and actionable.',
    '- Ground every recommendation in the actual numbers/trends below; call out low averages or declines directly and matter-of-factly.',
    '- Tie advice to their stated goals where natural.',
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

/**
 * Per-metric copy used when the API is unavailable. `low` is candid about a real
 * shortfall; `high` reinforces a genuine strength.
 */
const FALLBACK_COPY: Record<string, { low: Recommendation; high: Recommendation }> = {
  steps: {
    low: { title: 'Steps are low', body: 'Your step counts are genuinely low lately — commit to one real 15-minute walk tomorrow.', metricKey: 'steps' },
    high: { title: 'Keep stepping', body: 'Your movement is strong — protect it with one walk you already enjoy.', metricKey: 'steps' },
  },
  protein: {
    low: { title: 'Protein falling short', body: 'Protein keeps missing your target — lock in a protein source at breakfast tomorrow.', metricKey: 'protein' },
    high: { title: 'Solid protein', body: 'Protein is on track — keep your easiest go-to meal in rotation.', metricKey: 'protein' },
  },
  greens: {
    low: { title: 'Greens are thin', body: 'Greens have been near zero — get at least one real serving in tomorrow.', metricKey: 'greens' },
    high: { title: 'Greens on point', body: 'Your veggie intake is great — repeat the meal that made it easy.', metricKey: 'greens' },
  },
  water: {
    low: { title: 'Underhydrated', body: "You're short on water most days — set a midday refill so it actually happens.", metricKey: 'water' },
    high: { title: 'Stay hydrated', body: 'Water intake looks healthy — keep your bottle within reach tomorrow.', metricKey: 'water' },
  },
  sports: {
    low: { title: 'Workouts stalled', body: 'Your sessions have dropped off — even a short workout beats another skipped day.', metricKey: 'sports' },
    high: { title: 'Great movement', body: 'Your sessions are strong — schedule tomorrow\'s now so it actually happens.', metricKey: 'sports' },
  },
  sleep: {
    low: { title: 'Sleep is suffering', body: "Sleep is consistently rough and it's costing you — protect a real bedtime tonight.", metricKey: 'sleep' },
    high: { title: 'Sleep is steady', body: 'Your rest is paying off — guard the bedtime that\'s working for you.', metricKey: 'sleep' },
  },
  mindfulness: {
    low: { title: 'Scattered week', body: "You've been scattered most days — carve out one honest mindful minute tomorrow.", metricKey: 'mindfulness' },
    high: { title: 'Stay present', body: 'Your mindfulness is strong — keep the small habit that grounds your day.', metricKey: 'mindfulness' },
  },
  screen: {
    low: { title: 'Screen time up', body: 'Screen time is creeping up — pick one hour tomorrow with the phone out of reach.', metricKey: 'screen' },
    high: { title: 'Mindful with screens', body: 'You\'re managing screens well — keep your phone out of the bedroom.', metricKey: 'screen' },
  },
  mood: {
    low: { title: 'Mood is low', body: "Your mood's been down for a while — name one thing that helps and actually do it.", metricKey: 'mood' },
    high: { title: 'Ride the good vibes', body: 'Your mood is bright — notice what fueled it and lean in tomorrow.', metricKey: 'mood' },
  },
  recovery: {
    low: { title: 'Running on empty', body: "Recovery is lagging and it'll catch up with you — earlier night, lighter load tomorrow.", metricKey: 'recovery' },
    high: { title: 'Well recovered', body: 'Recovery looks great — you\'ve earned room for a slightly harder session.', metricKey: 'recovery' },
  },
}

/**
 * Deterministic, offline recommendation generator used as a graceful fallback.
 * Aims for a realistic-but-generally-positive mix: lead with the weakest metric
 * candidly, reinforce a genuine strength, and only add a second criticism when
 * the data is clearly poor.
 */
export function heuristicRecommendations(input: RecommendationInput): Recommendation[] {
  const summaries = summarizeMetrics(input)
  const logged = summaries.filter((s) => s.avg != null)
  const recs: Recommendation[] = []
  const usedKeys = new Set<string>()
  const byLowest = [...logged].sort((a, b) => (a.avg ?? 5) - (b.avg ?? 5))
  const byHighest = [...logged].sort((a, b) => (b.avg ?? 0) - (a.avg ?? 0))

  // 1) Candidly address the single weakest metric (praise it only if even the
  //    weakest is genuinely strong — i.e. everything is going well).
  const weakest = byLowest[0]
  if (weakest && FALLBACK_COPY[weakest.key]) {
    const copy = FALLBACK_COPY[weakest.key]
    recs.push((weakest.avg ?? 3) < 3.5 ? copy.low : copy.high)
    usedKeys.add(weakest.key)
  }

  // 2) Reinforce something genuinely going well (stay honest if it isn't).
  const strongest = byHighest.find((s) => !usedKeys.has(s.key))
  if (strongest && FALLBACK_COPY[strongest.key]) {
    const copy = FALLBACK_COPY[strongest.key]
    recs.push((strongest.avg ?? 0) >= 3.5 ? copy.high : copy.low)
    usedKeys.add(strongest.key)
  }

  // 3) Add a second candid note only if the next-weakest metric is clearly low;
  //    otherwise fall through to a generally-positive consistency/goal nudge.
  const nextWeak = byLowest.find((s) => !usedKeys.has(s.key))
  if (nextWeak && (nextWeak.avg ?? 5) < 3 && FALLBACK_COPY[nextWeak.key]) {
    recs.push(FALLBACK_COPY[nextWeak.key].low)
    usedKeys.add(nextWeak.key)
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
