import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import PageHeader from '../components/ui/PageHeader'
import UserAvatar from '../components/ui/UserAvatar'
import WeeklyModal from '../components/WeeklyModal'
import { categoryPillLabel } from '../design/categoryTags'

export default function Profile() {
  const { state, resetExperience } = useApp()
  const navigate = useNavigate()
  const [showWeekly, setShowWeekly] = useState(false)

  function handleStartOver() {
    resetExperience()
    if (window.location.search.includes('demo')) {
      window.history.replaceState({}, '', window.location.pathname)
    }
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
        kicker="Longitudinal view"
        title="Insights & evolution"
        subtitle="Consistency over time. Scores are secondary to the act of showing up."
      />

      <div className="px-5 -mt-2 flex items-center gap-4 mb-8">
        <UserAvatar avatar={state.avatar} name={state.userName} size="lg" />
        <div>
          <p className="text-sm font-semibold text-ink">{state.userName}</p>
          <p className="text-xs text-muted mt-0.5">
            {state.streak} day streak · Level {state.level}
          </p>
        </div>
      </div>

      <div className="px-5 space-y-8">
        <div>
          <p className="label-caps mb-3">Consistency map</p>
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

        <div className="card-premium rounded-[1.25rem] p-4 space-y-3">
          <p className="text-sm font-semibold text-ink">Start fresh</p>
          <p className="text-xs text-muted leading-relaxed">
            Resets onboarding, today&apos;s check-in, and the photo challenge so you can walk through the full flow again.
          </p>
          <button type="button" onClick={handleStartOver} className="btn-dark w-full py-3 text-sm tap-scale">
            Start over
          </button>
        </div>

        <div className="text-center">
          <Link to="/fonts" className="text-xs font-semibold text-link tap-scale">
            Compare title fonts
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-3">
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
      </div>

      <WeeklyModal open={showWeekly} onClose={() => setShowWeekly(false)} />
    </div>
  )
}
