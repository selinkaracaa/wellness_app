import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, Check } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { GOALS, type GoalId } from '../data/habitPool'
import { curateMetricsForGoals } from '../utils/aiRecalibration'
import { categoryPillLabel } from '../design/categoryTags'

export default function Onboarding() {
  const { completeOnboarding, loadDemo } = useApp()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [selectedGoals, setSelectedGoals] = useState<GoalId[]>([])
  const [userName, setUserName] = useState('')
  const [previewMetrics, setPreviewMetrics] = useState<ReturnType<typeof curateMetricsForGoals>>([])

  function toggleGoal(id: GoalId) {
    setSelectedGoals((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : prev.length < 3 ? [...prev, id] : prev
    )
  }

  function handleCurate() {
    setStep(2)
    setTimeout(() => {
      setPreviewMetrics(curateMetricsForGoals(selectedGoals))
      setStep(3)
    }, 1400)
  }

  function handleFinish() {
    completeOnboarding(selectedGoals, userName || 'You')
    navigate('/')
  }

  function handleDemo() {
    loadDemo()
    navigate('/')
  }

  return (
    <div className="min-h-screen page-canvas flex flex-col px-5 pt-12 pb-10">
      <div className="flex items-center justify-between mb-10">
        <span className="font-display text-[1.5rem] tracking-tight text-ink">Cycles</span>
        <button type="button" onClick={handleDemo} className="text-xs font-semibold text-link tap-scale">
          VC demo
        </button>
      </div>

      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div key="welcome" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col">
            <p className="label-caps">Mindful self-assessment</p>
            <h1 className="font-display text-[2rem] leading-[1.12] text-ink mt-3 tracking-tight">
              Awareness over perfection
            </h1>
            <p className="text-sm text-muted mt-5 leading-relaxed max-w-[32ch]">
              Five honest ratings every evening. Streaks reward showing up — not flawless execution.
            </p>
            <div className="card-premium rounded-[1.25rem] p-5 mt-8">
              <p className="text-xs text-ink-soft leading-relaxed">
                Logging five straight 1s still protects your streak. The product insight VCs care about: guilt is the
                number-one churn driver in health apps.
              </p>
            </div>
            <button type="button" onClick={() => setStep(1)} className="btn-dark w-full mt-auto py-4 flex items-center justify-center gap-2">
              Begin setup
              <ChevronRight size={18} />
            </button>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div key="goals" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col">
            <h1 className="font-display text-[1.65rem] text-ink tracking-tight">Your goals</h1>
            <p className="text-sm text-muted mt-2">Select up to three. AI curates five daily metrics.</p>

            <input
              type="text"
              placeholder="Your name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="mt-6 w-full px-4 py-3.5 rounded-[1.25rem] card-premium text-sm font-semibold text-ink outline-none focus:ring-2 focus:ring-sage/30"
            />

            <div className="space-y-2 mt-5 flex-1">
              {GOALS.map((goal) => {
                const selected = selectedGoals.includes(goal.id)
                return (
                  <button
                    key={goal.id}
                    type="button"
                    onClick={() => toggleGoal(goal.id)}
                    className={`w-full flex items-center gap-3 p-4 rounded-[1.25rem] text-left tap-scale transition-all ${
                      selected ? 'bg-ink text-white' : 'card-premium'
                    }`}
                  >
                    <div className="flex-1">
                      <p className={`text-sm font-semibold ${selected ? 'text-white' : 'text-ink'}`}>{goal.label}</p>
                      <p className={`text-xs mt-0.5 ${selected ? 'text-white/55' : 'text-muted'}`}>{goal.description}</p>
                    </div>
                    {selected && <Check size={16} />}
                  </button>
                )
              })}
            </div>

            <button type="button" disabled={selectedGoals.length === 0} onClick={handleCurate} className="btn-lime w-full mt-6 py-4 disabled:opacity-40">
              Curate metrics
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="curating" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <motion.div
                className="w-10 h-10 rounded-full border-2 border-sage border-t-transparent mx-auto"
                animate={{ rotate: 360 }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
              />
              <p className="text-sm font-semibold text-muted mt-5">Building your assessment canvas</p>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col">
            <h1 className="font-display text-[1.65rem] text-ink tracking-tight">Five core metrics</h1>
            <p className="text-sm text-muted mt-2">Recalibrated weekly from your subjective check-in.</p>

            <div className="space-y-2 mt-6 flex-1">
              {previewMetrics.map((m, i) => (
                <div key={m.key} className="card-premium rounded-[1.25rem] p-4 flex items-center gap-4">
                  <span className="label-caps w-8">{String(i + 1).padStart(2, '0')}</span>
                  <div>
                    <p className="text-sm font-semibold text-ink">{categoryPillLabel(m.key)}</p>
                    <p className="text-xs text-muted mt-0.5 line-clamp-1">{m.label}</p>
                  </div>
                </div>
              ))}
            </div>

            <button type="button" onClick={handleFinish} className="btn-dark w-full mt-6 py-4">
              Enter Cycles
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
