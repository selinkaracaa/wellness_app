import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { categoryPillLabel } from '../design/categoryTags'

const OPTIONS = [
  { value: 1, label: 'Far from my goals' },
  { value: 2, label: 'Making slow progress' },
  { value: 3, label: 'Somewhere in the middle' },
  { value: 4, label: 'Getting closer' },
  { value: 5, label: 'Very close to my goals' },
]

interface WeeklyModalProps {
  open: boolean
  onClose: () => void
}

export default function WeeklyModal({ open, onClose }: WeeklyModalProps) {
  const { state, completeWeeklyRecalibration } = useApp()
  const [score, setScore] = useState<number | null>(null)
  const [phase, setPhase] = useState<'question' | 'analyzing' | 'done'>('question')

  function handleSubmit() {
    if (score == null) return
    setPhase('analyzing')
    setTimeout(() => {
      completeWeeklyRecalibration(score)
      setPhase('done')
      setTimeout(onClose, 2200)
    }, 1800)
  }

  function handleClose() {
    setScore(null)
    setPhase('question')
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] bg-ink/50 backdrop-blur-md flex items-end sm:items-center justify-center p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ y: 48, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 48, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md card-premium rounded-[1.75rem] p-6 max-h-[85vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <p className="label-caps">Weekly AI portal</p>
              <button type="button" onClick={handleClose} className="w-8 h-8 rounded-full bg-cream flex items-center justify-center tap-scale">
                <X size={16} />
              </button>
            </div>

            {phase === 'question' && (
              <>
                <h2 className="font-display text-[1.5rem] text-ink leading-snug">How close do you feel to your goals?</h2>
                <p className="text-sm text-muted mt-2 mb-6">We cross-reference this with your 1–5 logs to recalibrate next week.</p>
                <div className="space-y-2">
                  {OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setScore(opt.value)}
                      className={`w-full flex items-center gap-3 p-3.5 rounded-xl text-left tap-scale transition-all ${
                        score === opt.value ? 'bg-ink text-white' : 'bg-cream/80 text-ink'
                      }`}
                    >
                      <span className={`font-display text-xl tabular-nums ${score === opt.value ? 'text-lime' : 'text-sage'}`}>
                        {opt.value}
                      </span>
                      <span className="text-sm font-medium">{opt.label}</span>
                    </button>
                  ))}
                </div>
                <button type="button" disabled={score == null} onClick={handleSubmit} className="btn-lime w-full mt-6 py-3.5 disabled:opacity-40">
                  Recalibrate metrics
                </button>
              </>
            )}

            {phase === 'analyzing' && (
              <div className="py-12 text-center">
                <motion.div
                  className="w-11 h-11 rounded-full border-2 border-sage/40 border-t-sage mx-auto"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
                <p className="text-sm font-semibold text-ink mt-6">Analyzing variance</p>
                <p className="text-xs text-muted mt-2">Subjective feeling vs. objective logs</p>
              </div>
            )}

            {phase === 'done' && (
              <div className="py-4">
                <p className="font-display text-[1.35rem] text-ink">Metrics evolved</p>
                <p className="text-sm text-muted mt-2 mb-5">Next week&apos;s five habit cards:</p>
                <div className="space-y-2">
                  {state.coreMetrics.map((m, i) => (
                    <motion.div
                      key={m.key}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="flex items-center justify-between p-3.5 rounded-xl bg-cream/80"
                    >
                      <span className="text-sm font-semibold text-ink">{categoryPillLabel(m.key)}</span>
                      <span className="text-[10px] font-bold text-sage uppercase tracking-wider">Active</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
