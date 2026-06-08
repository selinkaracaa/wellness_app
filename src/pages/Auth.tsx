import { useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AppContext'
import DecorativeOrb from '../components/ui/DecorativeOrb'

export default function Auth() {
  const { login, signup, authError, authPending } = useAuth()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const isSignup = mode === 'signup'

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (authPending) return
    if (isSignup) await signup(name.trim(), email.trim(), password)
    else await login(email.trim(), password)
  }

  const fieldClass =
    'w-full rounded-2xl bg-white/80 border border-black/5 px-4 py-3.5 text-sm font-medium text-ink placeholder:text-muted/70 outline-none focus:ring-2 focus:ring-sage card-float'

  return (
    <div className="max-w-md mx-auto min-h-screen page-canvas flex flex-col justify-center px-6 py-16 relative overflow-hidden">
      <DecorativeOrb size={140} className="absolute -right-10 -top-4 opacity-70" />
      <DecorativeOrb size={90} className="absolute -left-8 bottom-10 opacity-50" />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10"
      >
        <p className="label-caps mb-2">Bloom</p>
        <h1 className="text-3xl font-bold text-ink leading-tight">
          {isSignup ? 'Create your account' : 'Welcome back'}
        </h1>
        <p className="text-muted text-sm mt-2 font-medium">
          {isSignup ? 'Start your daily wellness journey.' : 'Sign in to continue your streak.'}
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-3">
          {isSignup && (
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              required
              className={fieldClass}
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
            className={fieldClass}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={isSignup ? 'new-password' : 'current-password'}
            required
            minLength={6}
            className={fieldClass}
          />

          {authError && (
            <p className="text-sm font-semibold text-red-500 px-1">{authError}</p>
          )}

          <button type="submit" disabled={authPending} className="btn-dark w-full py-4 disabled:opacity-60">
            {authPending ? 'Please wait…' : isSignup ? 'Create account' : 'Sign in'}
          </button>
        </form>

        <p className="text-center text-sm text-muted mt-6">
          {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            type="button"
            onClick={() => setMode(isSignup ? 'login' : 'signup')}
            className="text-link font-semibold tap-scale"
          >
            {isSignup ? 'Sign in' : 'Sign up'}
          </button>
        </p>
      </motion.div>
    </div>
  )
}
