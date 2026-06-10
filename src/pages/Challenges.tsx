import { useState } from 'react'
import { TrendingUp, TrendingDown, Minus, Bell } from 'lucide-react'
import { useApp } from '../context/AppContext'
import PageHeader from '../components/ui/PageHeader'
import UserAvatar from '../components/ui/UserAvatar'
import { FRIENDS } from '../data/mockData'

const TREND = { up: TrendingUp, down: TrendingDown, same: Minus }
const TREND_COLOR = { up: 'text-sage', down: 'text-red-400/80', same: 'text-muted' }

export default function Challenges() {
  const { state, nudgeMember } = useApp()
  const [nudged, setNudged] = useState<Set<string>>(new Set())
  const activeCycle = state.cycles.find((c) => c.id === state.activeCycleId)
  const members =
    activeCycle?.memberIds
      .filter((id) => id !== 'you')
      .map((id) => FRIENDS.find((f) => f.id === id))
      .filter(Boolean) ?? []

  const podium = state.cycleLeaderboard.slice(0, 3)
  const rest = state.cycleLeaderboard.slice(3)

  function handleNudge(friendId: string) {
    nudgeMember(friendId)
    setNudged((prev) => new Set(prev).add(friendId))
  }

  return (
    <div className="min-h-screen page-canvas pb-36">
      <PageHeader
        kicker="Team competition"
        title="Cycle rankings"
        subtitle="Power scores reflect logging consistency across your entire cycle — not individual performance."
      />

      <div className="px-5 space-y-8">
        {activeCycle && (
          <div className="card-premium rounded-[1.5rem] p-6">
            <p className="label-caps">Active cycle</p>
            <p className="font-display text-2xl text-ink mt-2">{activeCycle.name}</p>
            <p className="font-display text-5xl text-ink mt-4 tabular-nums leading-none">
              {activeCycle.powerScore.toLocaleString()}
            </p>
            <p className="text-xs text-muted mt-3">Global rank #{activeCycle.globalRank}</p>
          </div>
        )}

        <div>
          <p className="label-caps mb-4 px-1">Global podium</p>
          <div className="grid grid-cols-3 gap-2 items-end">
            {[podium[1], podium[0], podium[2]].map((entry, i) => {
              if (!entry) return <div key={i} />
              const heights = ['h-24', 'h-32', 'h-20']
              return (
                <div key={entry.cycleId} className={`flex flex-col items-center ${i === 1 ? '-mt-2' : ''}`}>
                  <div
                    className={`podium-card w-full ${heights[i]} rounded-t-2xl flex flex-col items-center justify-end pb-3 px-2 ${
                      entry.isUserCycle ? 'ring-1 ring-sage/30' : ''
                    }`}
                  >
                    <span className="font-display text-2xl text-ink">{entry.rank}</span>
                    <p className="text-[10px] font-semibold text-ink text-center mt-1 leading-tight line-clamp-2">
                      {entry.cycleName}
                    </p>
                    <p className="text-[10px] text-muted tabular-nums mt-1">
                      {entry.powerScore.toLocaleString()}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {members.length > 0 && (
          <div>
            <p className="label-caps mb-3 px-1">Nudge your team</p>
            <div className="space-y-2">
              {members.map(
                (m) =>
                  m && (
                    <div key={m.id} className="card-premium rounded-[1.25rem] p-4 flex items-center gap-3">
                      <UserAvatar avatar={m.avatar} friendId={m.id} name={m.name} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-ink">{m.name}</p>
                        <p className="text-[11px] text-muted">{m.streak} day awareness streak</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleNudge(m.id)}
                        disabled={nudged.has(m.id)}
                        className={`flex items-center gap-1.5 text-[11px] font-bold px-3.5 py-2 rounded-full transition-all tap-scale ${
                          nudged.has(m.id) ? 'bg-sage-light text-sage' : 'bg-ink text-white'
                        }`}
                      >
                        <Bell size={12} strokeWidth={2} />
                        {nudged.has(m.id) ? 'Sent' : 'Nudge'}
                      </button>
                    </div>
                  )
              )}
            </div>
          </div>
        )}

        <div>
          <p className="label-caps mb-3 px-1">Full ladder</p>
          <div className="space-y-2">
            {rest.map((entry) => {
              const Icon = TREND[entry.trend]
              return (
                <div
                  key={entry.cycleId}
                  className={`rounded-[1.25rem] p-4 flex items-center gap-4 ${
                    entry.isUserCycle ? 'card-premium ring-1 ring-sage/25' : 'card-premium'
                  }`}
                >
                  <span className="font-display text-xl text-muted w-7 tabular-nums">{entry.rank}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-ink truncate">
                      {entry.cycleName}
                      {entry.isUserCycle && (
                        <span className="ml-2 text-[9px] font-bold text-sage uppercase tracking-wider">Yours</span>
                      )}
                    </p>
                    <p className="text-[11px] text-muted">{entry.memberCount} members</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-ink tabular-nums">
                      {entry.powerScore.toLocaleString()}
                    </span>
                    <Icon size={14} className={TREND_COLOR[entry.trend]} strokeWidth={2} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
