import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { HABIT_POOL } from '../data/habitPool'

interface SettingsModalProps {
  open: boolean
  onClose: () => void
}

const inputClass =
  'w-full px-4 py-3 rounded-[1.25rem] card-premium text-sm font-semibold text-ink outline-none focus:ring-2 focus:ring-sage/30 placeholder:text-muted/70'

const MIN_QUESTIONS = 1
const MAX_QUESTIONS = 8

/** Stringify a stored profile number for an input (empty when unset). */
function toField(n: number | null | undefined): string {
  return n == null ? '' : String(n)
}

export default function SettingsModal({ open, onClose }: SettingsModalProps) {
  const { state, updateProfile, updateSelectedMetrics } = useApp()

  const [name, setName] = useState(state.userName)
  const [age, setAge] = useState(toField(state.profile?.age))
  const [height, setHeight] = useState(toField(state.profile?.heightCm))
  const [weight, setWeight] = useState(toField(state.profile?.weightKg))
  const [selectedKeys, setSelectedKeys] = useState<string[]>(state.coreMetrics.map((m) => m.key))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Re-seed the form from current state each time the sheet opens.
  useEffect(() => {
    if (!open) return
    setName(state.userName)
    setAge(toField(state.profile?.age))
    setHeight(toField(state.profile?.heightCm))
    setWeight(toField(state.profile?.weightKg))
    setSelectedKeys(state.coreMetrics.map((m) => m.key))
    setError(null)
    setSaving(false)
  }, [open, state.userName, state.profile, state.coreMetrics])

  function toggleQuestion(key: string) {
    setSelectedKeys((prev) =>
      prev.includes(key)
        ? prev.filter((k) => k !== key)
        : prev.length < MAX_QUESTIONS
          ? [...prev, key]
          : prev
    )
  }

  /** Validate a profile number input. Returns the number, null (blank), or throws. */
  function parseField(raw: string, label: string, min: number, max: number): number | null {
    const trimmed = raw.trim()
    if (!trimmed) return null
    const n = Number(trimmed)
    if (!Number.isFinite(n) || n < min || n > max) {
      throw new Error(`${label} must be between ${min} and ${max}.`)
    }
    return n
  }

  async function handleSave() {
    setError(null)
    if (!name.trim()) {
      setError('Name cannot be empty.')
      return
    }
    if (selectedKeys.length < MIN_QUESTIONS) {
      setError('Pick at least one question to track.')
      return
    }

    let ageN: number | null, heightN: number | null, weightN: number | null
    try {
      ageN = parseField(age, 'Age', 13, 120)
      heightN = parseField(height, 'Height', 50, 272)
      weightN = parseField(weight, 'Weight', 20, 500)
    } catch (e) {
      setError((e as Error).message)
      return
    }

    setSaving(true)
    try {
      await updateProfile({
        name: name.trim(),
        age: ageN,
        heightCm: heightN,
        weightKg: weightN,
      })
      // Keep the selection in HABIT_POOL order for a stable check-in layout.
      const metrics = HABIT_POOL.filter((m) => selectedKeys.includes(m.key))
      updateSelectedMetrics(metrics)
      onClose()
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] bg-ink/50 backdrop-blur-md flex items-end sm:items-center justify-center p-4"
          onClick={onClose}
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
              <p className="label-caps">Settings</p>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-cream flex items-center justify-center tap-scale"
                aria-label="Close settings"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <p className="label-caps mb-3">Your details</p>
                <div className="space-y-2.5">
                  <label className="block">
                    <span className="text-xs font-semibold text-muted">Name</span>
                    <input
                      className={`${inputClass} mt-1`}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                    />
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    <label className="block">
                      <span className="text-xs font-semibold text-muted">Age</span>
                      <input
                        className={`${inputClass} mt-1`}
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        inputMode="numeric"
                        placeholder="—"
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs font-semibold text-muted">Height (cm)</span>
                      <input
                        className={`${inputClass} mt-1`}
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                        inputMode="decimal"
                        placeholder="—"
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs font-semibold text-muted">Weight (kg)</span>
                      <input
                        className={`${inputClass} mt-1`}
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        inputMode="decimal"
                        placeholder="—"
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="label-caps">Tracked questions</p>
                  <span className="text-[10px] font-semibold text-muted">
                    {selectedKeys.length}/{MAX_QUESTIONS}
                  </span>
                </div>
                <div className="space-y-2">
                  {HABIT_POOL.map((m) => {
                    const selected = selectedKeys.includes(m.key)
                    return (
                      <button
                        type="button"
                        key={m.key}
                        onClick={() => toggleQuestion(m.key)}
                        className={`w-full text-left px-4 py-3 rounded-[1.25rem] flex items-center justify-between gap-3 tap-scale transition-colors ${
                          selected ? 'bg-ink text-white' : 'card-premium text-ink'
                        }`}
                      >
                        <span className="text-sm font-semibold leading-snug">{m.label}</span>
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border ${
                            selected ? 'bg-white border-white' : 'border-ink/20'
                          }`}
                        >
                          {selected && <Check size={13} className="text-ink" />}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {error && <p className="text-xs font-semibold text-red-500">{error}</p>}

              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="btn-dark w-full py-3.5 text-sm tap-scale disabled:opacity-40"
              >
                {saving ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
