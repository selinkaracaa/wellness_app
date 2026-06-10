import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Sparkles, RefreshCw, ChevronRight, Check,
  Droplets, Footprints, Drumstick, Leaf, Dumbbell, Moon, Brain, Smartphone, Smile, HeartPulse,
  type LucideIcon,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import PageHeader from '../components/ui/PageHeader'
import WellnessScoreRing from '../components/ui/WellnessScoreRing'
import { wellnessScore } from '../utils/wellnessScore'
import { getRecommendations, type Recommendation } from '../utils/geminiRecommendations'

const METRIC_ICONS: Record<string, LucideIcon> = {
  water: Droplets,
  steps: Footprints,
  protein: Drumstick,
  greens: Leaf,
  sports: Dumbbell,
  sleep: Moon,
  mindfulness: Brain,
  screen: Smartphone,
  mood: Smile,
  recovery: HeartPulse,
}

const CACHE_KEY = 'cycles_reco_cache_v1'

interface CachedRecos {
  sig: string
  recs: Recommendation[]
  source: 'gemini' | 'fallback'
}

export default function Home() {
  const { state } = useApp()
  const navigate = useNavigate()

  useEffect(() => {
    if (!state.onboardingComplete) navigate('/onboarding')
  }, [state.onboardingComplete, navigate])

  const score = wellnessScore(state.todayCheckedIn, state.todayAnswers, state.coreMetrics.length)

  // Signature changes whenever the inputs that should refresh advice change.
  const sig = `${state.goals.join(',')}|${state.checkIns.length}|${state.todayCheckedIn}|${
    state.checkIns[state.checkIns.length - 1]?.date ?? 'none'
  }`

  const [recs, setRecs] = useState<Recommendation[]>([])
  const [source, setSource] = useState<'gemini' | 'fallback'>('fallback')
  const [loading, setLoading] = useState(true)

  const load = useCallback(
    async (force: boolean) => {
      if (!force) {
        try {
          const cached = JSON.parse(sessionStorage.getItem(CACHE_KEY) ?? 'null') as CachedRecos | null
          if (cached && cached.sig === sig && cached.recs.length === 3) {
            setRecs(cached.recs)
            setSource(cached.source)
            setLoading(false)
            return
          }
        } catch {
          // ignore malformed cache
        }
      }

      setLoading(true)
      const result = await getRecommendations({
        userName: state.userName,
        goals: state.goals,
        metrics: state.coreMetrics,
        checkIns: state.checkIns,
        streak: state.streak,
        totalCheckIns: state.totalCheckIns,
        todayCheckedIn: state.todayCheckedIn,
      })
      setRecs(result.recs)
      setSource(result.source)
      setLoading(false)
      try {
        sessionStorage.setItem(CACHE_KEY, JSON.stringify({ sig, recs: result.recs, source: result.source }))
      } catch {
        // ignore quota errors
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sig]
  )

  useEffect(() => {
    load(false)
  }, [load])

  // Last 14 days as a consistency strip.
  const loggedDates = new Set(state.checkIns.map((c) => c.date))
  const today = new Date()
  const strip = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - (13 - i))
    return loggedDates.has(d.toDateString())
  })

  const firstName = state.userName.split(' ')[0]

  return (
    <div className="min-h-screen page-canvas pb-36">
      <PageHeader
        kicker={`Welcome back, ${firstName}`}
        title="Today's insights"
        subtitle="A read on your week, and three small things to focus on next."
      />

      {/* Snapshot: score + consistency */}
      <div className="px-5 mt-2">
        <div className="card-premium rounded-[1.5rem] p-5 flex items-center gap-5">
          <WellnessScoreRing value={score} size={104} />
          <div className="flex-1">
            <p className="label-caps">
              {state.todayCheckedIn ? "Today's score" : 'Last logged'}
            </p>
            <p className="text-sm text-ink-soft mt-1 leading-relaxed">
              {state.todayCheckedIn
                ? 'Nice — today is logged. Awareness over perfection.'
                : "You haven't checked in today yet."}
            </p>
            <div className="flex gap-4 mt-3">
              <div>
                <p className="font-display text-xl text-ink tabular-nums leading-none">{state.streak}</p>
                <p className="text-[10px] font-semibold text-muted mt-1 uppercase tracking-wider">Streak</p>
              </div>
              <div>
                <p className="font-display text-xl text-ink tabular-nums leading-none">{state.totalCheckIns}</p>
                <p className="text-[10px] font-semibold text-muted mt-1 uppercase tracking-wider">Logs</p>
              </div>
            </div>
          </div>
        </div>

        {/* Consistency strip */}
        <div className="card-premium rounded-[1.5rem] p-5 mt-3">
          <div className="flex items-center justify-between mb-3">
            <p className="label-caps">Last 14 days</p>
            <span className="text-[11px] text-muted">{strip.filter(Boolean).length}/14 logged</span>
          </div>
          <div className="flex gap-[5px]">
            {strip.map((logged, i) => (
              <div
                key={i}
                className="flex-1 aspect-square rounded-[5px]"
                style={{ background: logged ? 'var(--color-sage)' : 'rgba(18,18,18,0.06)' }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* AI recommendations */}
      <div className="px-5 mt-8">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <Sparkles size={14} className="text-ink" />
            <p className="label-caps">Recommended for you</p>
          </div>
          <button
            type="button"
            onClick={() => load(true)}
            disabled={loading}
            className="flex items-center gap-1 text-xs font-semibold text-link tap-scale disabled:opacity-40"
            aria-label="Refresh recommendations"
          >
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="space-y-2.5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="card-premium rounded-[1.25rem] p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-ink/5 animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-1/3 rounded-full bg-ink/5 animate-pulse" />
                  <div className="h-2.5 w-4/5 rounded-full bg-ink/5 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2.5">
            {recs.map((rec, i) => {
              const Icon = (rec.metricKey && METRIC_ICONS[rec.metricKey]) || Sparkles
              return (
                <motion.div
                  key={`${rec.title}-${i}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="card-premium rounded-[1.25rem] p-4 flex items-start gap-3.5"
                >
                  <div className="w-10 h-10 rounded-xl bg-sage/15 flex items-center justify-center shrink-0">
                    <Icon size={18} className="text-sage" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-ink">{rec.title}</p>
                    <p className="text-xs text-muted mt-0.5 leading-relaxed">{rec.body}</p>
                  </div>
                </motion.div>
              )
            })}
            <p className="text-[10px] text-muted/70 text-center pt-1">
              {source === 'gemini' ? 'Personalized by Gemini' : 'Based on your recent patterns'}
            </p>
          </div>
        )}
      </div>

      {/* Check-in CTA */}
      <div className="px-5 mt-8">
        {state.todayCheckedIn ? (
          <button
            type="button"
            onClick={() => navigate('/checkin')}
            className="card-premium rounded-[1.25rem] w-full p-4 flex items-center gap-3 tap-scale text-left"
          >
            <div className="w-9 h-9 rounded-full bg-sage/15 flex items-center justify-center shrink-0">
              <Check size={18} className="text-sage" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-ink">Today&apos;s check-in is done</p>
              <p className="text-xs text-muted mt-0.5">Tap to review your ratings</p>
            </div>
            <ChevronRight size={18} className="text-muted" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => navigate('/checkin')}
            className="btn-lime w-full py-4 flex items-center justify-center gap-2 tap-scale"
          >
            Start today&apos;s check-in
            <ChevronRight size={18} />
          </button>
        )}
      </div>
    </div>
  )
}
