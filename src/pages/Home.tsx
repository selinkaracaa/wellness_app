import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useApp } from '../context/AppContext'
import PageHeader from '../components/ui/PageHeader'
import StreakHero from '../components/ui/StreakHero'
import MetricSlider from '../components/ui/MetricSlider'

export default function Home() {
  const { state, completeCheckIn } = useApp()
  const navigate = useNavigate()
  const metrics = state.coreMetrics
  const [answers, setAnswers] = useState<Record<string, number>>(state.todayAnswers)

  useEffect(() => {
    if (!state.onboardingComplete) navigate('/onboarding')
  }, [state.onboardingComplete, navigate])

  useEffect(() => {
    setAnswers(state.todayAnswers)
  }, [state.todayAnswers])

  const filledCount = metrics.filter((m) => answers[m.key] != null).length
  const allFilled = metrics.length > 0 && filledCount === metrics.length

  useEffect(() => {
    if (allFilled && !state.todayCheckedIn) {
      const timer = setTimeout(() => {
        completeCheckIn(answers, metrics.reduce((s, m) => s + m.xp, 0))
      }, 700)
      return () => clearTimeout(timer)
    }
  }, [allFilled, state.todayCheckedIn, answers, metrics, completeCheckIn])

  if (metrics.length === 0) return null

  const glowLevel = state.todayCheckedIn ? 1 : filledCount / metrics.length

  return (
    <div className="min-h-screen page-canvas pb-36">
      <PageHeader
        kicker="Daily ritual"
        title={state.todayCheckedIn ? "Today's reflection" : 'Rate your evening'}
        subtitle={
          state.todayCheckedIn
            ? 'Locked until tomorrow. Consistency — not performance — drives retention.'
            : 'Five honest self-ratings. A streak of 1s still counts.'
        }
      />

      <div className="mt-2">
        <StreakHero
          streak={state.streak}
          glowLevel={glowLevel}
          progress={state.todayCheckedIn ? metrics.length : filledCount}
          total={metrics.length}
          status={
            state.todayCheckedIn
              ? 'Streak protected for today'
              : allFilled
                ? 'Saving your log…'
                : `${metrics.length - filledCount} remaining`
          }
        />
      </div>

      <div className="px-5 mt-8 space-y-4">
        {metrics.map((m, i) => (
          <motion.div
            key={m.key}
            initial={state.todayCheckedIn ? { opacity: 0, y: 10 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: state.todayCheckedIn ? i * 0.07 : 0, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <MetricSlider
              metricKey={m.key}
              label={m.label}
              index={i}
              total={metrics.length}
              value={answers[m.key] ?? null}
              onChange={(v) => setAnswers((prev) => ({ ...prev, [m.key]: v }))}
              readOnly={state.todayCheckedIn}
            />
          </motion.div>
        ))}
      </div>
    </div>
  )
}
