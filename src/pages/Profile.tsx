import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogOut, Settings } from 'lucide-react'
import { useApp } from '../context/AppContext'
import PageHeader from '../components/ui/PageHeader'
import UserAvatar from '../components/ui/UserAvatar'
import WeeklyModal from '../components/WeeklyModal'
import SettingsModal from '../components/SettingsModal'
import { categoryPillLabel } from '../design/categoryTags'
import { GOALS } from '../data/habitPool'

export default function Profile() {
  const { state, resetExperience, logout } = useApp()
  const navigate = useNavigate()
  const [showWeekly, setShowWeekly] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  function handleStartOver() {
    resetExperience()
    if (window.location.search.includes('demo')) {
      window.history.replaceState({}, '', window.location.pathname)
    }
    navigate('/onboarding')
  }

  function handleLogout() {
    logout()
    navigate('/onboarding')
  }
  const metrics = state.coreMetrics

  useEffect(() => {
    if (state.weeklyRecalibrationPending) setShowWeekly(true)
  }, [state.weeklyRecalibrationPending])

  const today = new Date()
  const checkInDates = new Set(state.checkIns.map((c) => c.date))
  const weeks = 16
  const cells = Array.from({ length: weeks * 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - (weeks * 7 - 1 - i))
    return { date: d.toDateString(), logged: checkInDates.has(d.toDateString()) }
  })

  return (
    <div className="min-h-screen page-canvas pb-36">
      <PageHeader
        kicker="Your profile"
        title="Personal"
        subtitle="Who you are here — your goals, what you track, and your history."
      />

      <div className="px-5 -mt-2 flex items-center gap-4 mb-6">
        <UserAvatar avatar={state.avatar} name={state.userName} size="lg" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-ink">{state.userName}</p>
          <p className="text-xs text-muted mt-0.5">
            {state.streak} day streak · Level {state.level}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowSettings(true)}
          className="w-10 h-10 rounded-full card-premium flex items-center justify-center tap-scale shrink-0"
          aria-label="Open settings"
        >
          <Settings size={18} className="text-ink" />
        </button>
      </div>

      <div className="px-5 grid grid-cols-3 gap-3 mb-8">
        {[
          { v: state.streak, l: 'Streak' },
          { v: state.longestStreak, l: 'Best' },
          { v: state.totalCheckIns, l: 'Logs' },
        ].map(({ v, l }) => (
          <div key={l} className="card-premium rounded-[1.25rem] p-4 text-center">
            <p className="font-display text-3xl text-ink tabular-nums">{v}</p>
            <p className="text-[10px] font-semibold text-muted mt-1 uppercase tracking-wider">{l}</p>
          </div>
        ))}
      </div>

      <div className="px-5 space-y-8">
        {state.goals.length > 0 && (
          <div>
            <p className="label-caps mb-3">Your goals</p>
            <div className="flex flex-wrap gap-2">
              {state.goals.map((g) => {
                const goal = GOALS.find((x) => x.id === g)
                return (
                  <span
                    key={g}
                    className="px-4 py-2 rounded-full bg-ink text-white text-xs font-semibold tracking-wide"
                  >
                    {goal?.label ?? g}
                  </span>
                )
              })}
            </div>
          </div>
        )}

        {metrics.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="label-caps">AI-curated metrics</p>
              <button type="button" onClick={() => setShowWeekly(true)} className="text-xs font-semibold text-link tap-scale">
                Weekly tune-up
              </button>
            </div>
            <div className="space-y-2">
              {metrics.map((m) => (
                <div key={m.key} className="card-premium rounded-[1.25rem] px-4 py-3.5 flex items-center justify-between">
                  <span className="text-sm font-semibold text-ink">{categoryPillLabel(m.key)}</span>
                  {state.todayAnswers[m.key] != null ? (
                    <span className="font-display text-xl text-ink tabular-nums">{state.todayAnswers[m.key]}</span>
                  ) : (
                    <span className="text-xs text-muted">Pending</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <p className="label-caps mb-3">Your history</p>
          <div className="card-premium rounded-[1.5rem] p-5">
            <div
              className="grid grid-flow-col grid-rows-7 gap-[3px]"
              style={{ gridTemplateColumns: `repeat(${weeks}, 1fr)` }}
            >
              {cells.map((cell, i) => (
                <div
                  key={i}
                  className="heatmap-cell aspect-square"
                  data-logged={cell.logged}
                  title={cell.date}
                />
              ))}
            </div>
            <p className="text-[11px] text-muted mt-4 leading-relaxed">
              Each cell is a day you logged — regardless of whether you rated 1 or 5.
            </p>
          </div>
        </div>

        <div className="card-premium rounded-[1.25rem] p-4 space-y-3">
          <p className="text-sm font-semibold text-ink">Start fresh</p>
          <p className="text-xs text-muted leading-relaxed">
            Resets onboarding, today&apos;s check-in, and the photo challenge so you can walk through the full flow again.
          </p>
          <button type="button" onClick={handleStartOver} className="btn-dark w-full py-3 text-sm tap-scale">
            Start over
          </button>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="btn-ghost w-full py-3 text-sm tap-scale flex items-center justify-center gap-2"
        >
          <LogOut size={16} />
          Log out
        </button>

        <div className="text-center">
          <Link to="/fonts" className="text-xs font-semibold text-link tap-scale">
            Compare title fonts
          </Link>
        </div>
      </div>

      <WeeklyModal open={showWeekly} onClose={() => setShowWeekly(false)} />
      <SettingsModal open={showSettings} onClose={() => setShowSettings(false)} />
    </div>
  )
}
