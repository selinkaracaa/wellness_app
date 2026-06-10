import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useApp } from '../context/AppContext'
import StreakHero from '../components/ui/StreakHero'
import MetricSlider from '../components/ui/MetricSlider'

export default function CheckIn() {
  const { state, completeCheckIn, updateTodayCheckIn, pendingCheckInQuestion, clearPendingQuestion } = useApp()
  const navigate = useNavigate()
  const metrics = state.coreMetrics
  const [answers, setAnswers] = useState<Record<string, number>>(state.todayAnswers)
  const [justCompleted, setJustCompleted] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    if (!state.onboardingComplete) navigate('/onboarding')
  }, [state.onboardingComplete, navigate])

  // Social "try it yourself" deep-links here — clear the intent on arrival.
  useEffect(() => {
    if (pendingCheckInQuestion) clearPendingQuestion()
  }, [pendingCheckInQuestion, clearPendingQuestion])

  useEffect(() => {
    setAnswers(state.todayAnswers)
  }, [state.todayAnswers])

  const filledCount = metrics.filter((m) => answers[m.key] != null).length
  const allFilled = metrics.length > 0 && filledCount === metrics.length

  useEffect(() => {
    if (allFilled && !state.todayCheckedIn) {
      const timer = setTimeout(() => {
        completeCheckIn(answers, metrics.reduce((s, m) => s + m.xp, 0))
        setJustCompleted(true)
      }, 700)
      return () => clearTimeout(timer)
    }
  }, [allFilled, state.todayCheckedIn, answers, metrics, completeCheckIn])

  // After logging, send the user back to their (now updated) insights home.
  useEffect(() => {
    if (justCompleted) {
      const timer = setTimeout(() => navigate('/'), 1100)
      return () => clearTimeout(timer)
    }
  }, [justCompleted, navigate])

  if (metrics.length === 0) return null

  if (state.todayCheckedIn && !justCompleted) {
    const editFilled = metrics.every((m) => answers[m.key] != null)
    const dirty = metrics.some((m) => answers[m.key] !== state.todayAnswers[m.key])

    const handleSave = () => {
      updateTodayCheckIn(answers)
      setIsEditing(false)
    }
    const handleCancel = () => {
      setAnswers(state.todayAnswers)
      setIsEditing(false)
    }

    return (
      <div className="min-h-screen page-canvas pb-36">
        <header className="px-5 pt-12 pb-1">
          <div className="flex items-center justify-between mb-8">
            <span className="font-display text-[1.35rem] tracking-tight text-ink">Cycles</span>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="w-9 h-9 rounded-full card-premium flex items-center justify-center tap-scale"
              aria-label="Close check-in"
            >
              <X size={18} />
            </button>
          </div>
          <p className="label-caps mb-2">Daily ritual</p>
          <h1 className="font-display text-[1.75rem] leading-[1.15] text-ink tracking-tight">
            {isEditing ? 'Edit your check-in' : 'Your check-in today'}
          </h1>
          <p className="text-sm text-muted mt-2 leading-relaxed max-w-[28ch]">
            {isEditing
              ? 'Adjust any rating, then save your changes.'
              : 'What you logged today. Tap edit to adjust any rating.'}
          </p>
        </header>

        <div className="mt-2">
          <StreakHero
            streak={state.streak}
            glowLevel={1}
            progress={metrics.length}
            total={metrics.length}
            status={isEditing ? 'Editing your log' : 'Streak protected for today'}
          />
        </div>

        <div className="px-5 mt-8 space-y-4">
          {metrics.map((m, i) => (
            <MetricSlider
              key={m.key}
              metricKey={m.key}
              label={m.label}
              index={i}
              total={metrics.length}
              value={answers[m.key] ?? null}
              onChange={(v) => setAnswers((prev) => ({ ...prev, [m.key]: v }))}
              readOnly={!isEditing}
            />
          ))}
        </div>

        <div className="px-5 mt-8 space-y-3">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={handleSave}
                disabled={!editFilled || !dirty}
                className="btn-dark w-full py-3.5 text-sm tap-scale disabled:opacity-40"
              >
                Save changes
              </button>
              <button type="button" onClick={handleCancel} className="btn-ghost w-full py-3 text-sm tap-scale">
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="btn-dark w-full py-3.5 text-sm tap-scale"
              >
                Edit answers
              </button>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="btn-ghost w-full py-3 text-sm tap-scale"
              >
                Back to insights
              </button>
            </>
          )}
        </div>
      </div>
    )
  }

  const glowLevel = state.todayCheckedIn ? 1 : filledCount / metrics.length

  return (
    <div className="min-h-screen page-canvas pb-36">
      <header className="px-5 pt-12 pb-1">
        <div className="flex items-center justify-between mb-8">
          <span className="font-display text-[1.35rem] tracking-tight text-ink">Cycles</span>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="w-9 h-9 rounded-full card-premium flex items-center justify-center tap-scale"
            aria-label="Close check-in"
          >
            <X size={18} />
          </button>
        </div>
        <p className="label-caps mb-2">Daily ritual</p>
        <h1 className="font-display text-[1.75rem] leading-[1.15] text-ink tracking-tight">
          {justCompleted ? 'Logged for today' : 'Rate your evening'}
        </h1>
        <p className="text-sm text-muted mt-2 leading-relaxed max-w-[28ch]">
          {justCompleted
            ? 'Streak protected. Taking you back to your insights…'
            : 'Five honest self-ratings. A streak of 1s still counts.'}
        </p>
      </header>

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
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
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
