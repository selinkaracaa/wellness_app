import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft } from 'lucide-react'
import { useApp } from '../context/AppContext'
import CheckInHero from '../components/ui/CheckInHero'
import GlassCard from '../components/ui/GlassCard'
import OptionSymbol from '../components/ui/OptionSymbol'
import DecorativeOrb from '../components/ui/DecorativeOrb'

export default function CheckIn() {
  const { state, completeCheckIn, pendingCheckInQuestion, clearPendingQuestion } = useApp()
  const navigate = useNavigate()
  const metrics = state.coreMetrics
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [direction, setDirection] = useState(1)
  const [showComplete, setShowComplete] = useState(false)
  const [selected, setSelected] = useState<number | null>(null)
  const [animating, setAnimating] = useState(false)

  useEffect(() => {
    if (!state.onboardingComplete) navigate('/onboarding')
  }, [state.onboardingComplete, navigate])

  useEffect(() => {
    if (pendingCheckInQuestion && metrics.length > 0) {
      const idx = metrics.findIndex((q) => q.key === pendingCheckInQuestion)
      if (idx !== -1) setStep(idx)
      clearPendingQuestion()
    }
  }, [pendingCheckInQuestion, clearPendingQuestion, metrics])

  if (metrics.length === 0) return null

  if (state.todayCheckedIn && !showComplete) {
    return (
      <div className="min-h-screen page-canvas flex flex-col items-center justify-center px-6 pb-32">
        <DecorativeOrb size={100} className="mb-6" />
        <p className="text-3xl font-bold text-ink text-center">Already complete</p>
        <p className="text-muted text-sm mt-3 text-center max-w-xs leading-relaxed">
          Today&apos;s self-assessment is done. Your streak is protected — see you tomorrow.
        </p>
        <button onClick={() => navigate('/')} className="btn-dark mt-10 px-10 py-3.5 text-sm">
          Home
        </button>
      </div>
    )
  }

  const q = metrics[step]
  const totalXP = metrics.reduce((s, m) => s + m.xp, 0)
  const earnedXP = metrics.slice(0, step).reduce((s, m) => s + m.xp, 0)
  const progress = ((step + 1) / metrics.length) * 100

  function handleSelect(value: number) {
    if (animating) return
    setSelected(value)
    setAnimating(true)
    setTimeout(() => {
      const newAnswers = { ...answers, [q.key]: value }
      setAnswers(newAnswers)
      setSelected(null)
      setAnimating(false)
      if (step < metrics.length - 1) {
        setDirection(1)
        setStep((s) => s + 1)
      } else {
        completeCheckIn(newAnswers, metrics.reduce((s, m) => s + m.xp, 0))
        setShowComplete(true)
      }
    }, 350)
  }

  function handleBack() {
    if (step === 0) navigate('/')
    else {
      setDirection(-1)
      setStep((s) => s - 1)
    }
  }

  if (showComplete) {
    const allOnes = Object.values(answers).every((v) => v === 1)
    return (
      <div className="min-h-screen page-canvas flex flex-col px-6 pt-16 pb-32">
        <GlassCard className="gradient-hero-purple p-6 text-white relative overflow-hidden">
          <p className="text-sm font-semibold text-white/80">Self-assessment complete</p>
          <h1 className="text-3xl font-bold mt-1">{allOnes ? 'Streak saved' : 'Awareness logged'}</h1>
          <p className="text-sm text-white/75 mt-2">
            {allOnes
              ? 'Five 1s still count. You showed up — that\'s the win.'
              : `+${totalXP} XP · Consistency streak protected`}
          </p>
          <DecorativeOrb size={72} className="absolute -right-4 top-2 opacity-75" />
        </GlassCard>

        <div className="grid grid-cols-3 gap-3 mt-8">
          {metrics.map((question) => {
            const val = answers[question.key]
            if (!val) return null
            return (
              <GlassCard key={question.key} className="card-tint-sage p-3 flex flex-col items-center gap-2">
                <OptionSymbol questionKey={question.key} value={val} size="sm" />
                <p className="text-[10px] text-muted capitalize font-semibold">{question.key}</p>
                <p className="text-xs font-bold text-ink">{val}/5</p>
              </GlassCard>
            )
          })}
        </div>

        <button type="button" onClick={() => navigate('/')} className="btn-dark w-full mt-auto py-4">
          Continue
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen page-canvas flex flex-col pb-32">
      <CheckInHero questionKey={q.key} label={q.label}>
        <div className="flex items-center justify-between">
          <button onClick={handleBack} className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center tap-scale" aria-label="Back">
            <ChevronLeft size={22} />
          </button>
          <span className="text-xs font-bold text-ink/60 bg-white/70 px-3 py-1 rounded-full">
            {step + 1} / {metrics.length}
          </span>
          <button onClick={() => navigate('/')} className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center tap-scale" aria-label="Close">
            <X size={20} />
          </button>
        </div>
        <div className="mt-4 h-2 rounded-full bg-white/60 overflow-hidden">
          <motion.div className="h-full gradient-xp rounded-full" animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
        </div>
        <p className="text-xs font-semibold text-ink/60 mt-2">+{earnedXP} XP · Rate honestly, any score counts</p>
      </CheckInHero>

      <div className="flex-1 px-5 pt-8">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={step}
            initial={{ opacity: 0, y: direction * 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: direction * -12 }}
            transition={{ duration: 0.28 }}
          >
            <h2 className="text-2xl font-bold text-ink leading-snug">{q.label}</h2>
            <p className="text-sm text-muted mt-2 mb-6 font-medium">Rate yourself 1–5</p>

            <div className="space-y-3">
              {q.options.map((option) => {
                const isSelected = selected === option.value
                return (
                  <button
                    key={option.value}
                    onClick={() => handleSelect(option.value)}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl text-left transition-all tap-scale card-float ${
                      isSelected ? 'bg-ink text-white' : 'card-tint-white'
                    }`}
                  >
                    <OptionSymbol questionKey={q.key} value={option.value} size="md" />
                    <span className={`flex-1 text-sm font-semibold ${isSelected ? 'text-white' : 'text-ink'}`}>{option.label}</span>
                    <span className={`text-xs font-bold tabular-nums ${isSelected ? 'text-white/70' : 'text-muted'}`}>{option.value}</span>
                  </button>
                )
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
