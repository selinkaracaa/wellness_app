import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, Check } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { GOALS, type GoalId } from '../data/habitPool'
import { curateMetricsForGoals } from '../utils/aiRecalibration'
import { categoryPillLabel } from '../design/categoryTags'

type AuthMode = 'login' | 'signup'

const inputClass =
  'w-full px-4 py-3.5 rounded-[1.25rem] card-premium text-sm font-semibold text-ink outline-none focus:ring-2 focus:ring-sage/30 placeholder:text-muted/70'

export default function Onboarding() {
  const { signup, login, completeOnboarding } = useApp()
  const navigate = useNavigate()

  // step 0 = auth, 1 = goals, 2 = curating, 3 = metric preview
  const [step, setStep] = useState(0)
  const [selectedGoals, setSelectedGoals] = useState<GoalId[]>([])
  const [userName, setUserName] = useState('')
  const [previewMetrics, setPreviewMetrics] = useState<ReturnType<typeof curateMetricsForGoals>>([])

  // --- auth form state ---
  const [mode, setMode] = useState<AuthMode>('signup')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [age, setAge] = useState('')
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  async function handleAuthSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (mode === 'login') {
      if (!email.trim() || !password) {
        setError('Enter your email and password.')
        return
      }
      setSubmitting(true)
      try {
        await login(email.trim(), password)
        navigate('/')
      } catch (err) {
        setError((err as Error).message)
      } finally {
        setSubmitting(false)
      }
      return
    }

    // signup
    if (!name.trim() || !email.trim() || !password) {
      setError('Name, email, and password are required.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (!age || !height || !weight) {
      setError('Please add your age, height, and weight.')
      return
    }

    setSubmitting(true)
    try {
      await signup({
        name: name.trim(),
        email: email.trim(),
        password,
        age: Number(age),
        heightCm: Number(height),
        weightKg: Number(weight),
      })
      setUserName(name.trim())
      setStep(1)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen page-canvas flex flex-col px-5 pt-12 pb-10">
      <div className="mb-10">
        <span className="font-display text-[1.5rem] tracking-tight text-ink">Cycles</span>
      </div>

      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div key="auth" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col">
            <p className="label-caps">Mindful self-assessment</p>
            <h1 className="font-display text-[2rem] leading-[1.12] text-ink mt-3 tracking-tight">
              {mode === 'signup' ? 'Create your account' : 'Welcome back'}
            </h1>
            <p className="text-sm text-muted mt-3 leading-relaxed max-w-[34ch]">
              {mode === 'signup'
                ? 'A few basics so your check-ins and recommendations are tailored to you.'
                : 'Log in to pick up your streak where you left off.'}
            </p>

            <div className="flex gap-1 mt-6 p-1 rounded-full card-premium w-fit">
              {(['signup', 'login'] as AuthMode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    setMode(m)
                    setError(null)
                  }}
                  className={`px-5 py-2 rounded-full text-xs font-semibold tap-scale transition-all ${
                    mode === m ? 'bg-ink text-white' : 'text-muted'
                  }`}
                >
                  {m === 'signup' ? 'Sign up' : 'Log in'}
                </button>
              ))}
            </div>

            <form onSubmit={handleAuthSubmit} className="flex flex-col flex-1 mt-5">
              <div className="space-y-2.5">
                {mode === 'signup' && (
                  <input className={inputClass} type="text" placeholder="Your name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
                )}
                <input className={inputClass} type="email" placeholder="Email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <input
                  className={inputClass}
                  type="password"
                  placeholder="Password"
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                {mode === 'signup' && (
                  <div className="grid grid-cols-3 gap-2.5">
                    <input className={inputClass} type="number" inputMode="numeric" placeholder="Age" min={13} max={120} value={age} onChange={(e) => setAge(e.target.value)} />
                    <input className={inputClass} type="number" inputMode="decimal" placeholder="Height cm" min={50} max={272} value={height} onChange={(e) => setHeight(e.target.value)} />
                    <input className={inputClass} type="number" inputMode="decimal" placeholder="Weight kg" min={20} max={500} value={weight} onChange={(e) => setWeight(e.target.value)} />
                  </div>
                )}
              </div>

              {error && <p className="text-xs text-red-500 mt-3 font-medium">{error}</p>}

              <button type="submit" disabled={submitting} className="btn-dark w-full mt-auto py-4 flex items-center justify-center gap-2 disabled:opacity-50">
                {submitting ? 'One moment…' : mode === 'signup' ? 'Create account' : 'Log in'}
                {!submitting && <ChevronRight size={18} />}
              </button>
            </form>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div key="goals" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col">
            <h1 className="font-display text-[1.65rem] text-ink tracking-tight">
              {userName ? `Your goals, ${userName.split(' ')[0]}` : 'Your goals'}
            </h1>
            <p className="text-sm text-muted mt-2">Select up to three. AI curates five daily metrics.</p>

            <div className="space-y-2 mt-6 flex-1">
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
