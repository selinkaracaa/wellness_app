import { ChevronRight, Trophy } from 'lucide-react'
import { useApp } from '../context/AppContext'
import GlassCard from '../components/ui/GlassCard'
import ChallengeIcon from '../components/ui/ChallengeIcon'
import UserAvatar from '../components/ui/UserAvatar'

const DISCOVER_TINTS = ['card-tint-lavender', 'card-tint-mint', 'card-tint-sand', 'card-tint-white'] as const

export default function Challenges() {
  const { state, joinChallenge } = useApp()
  const activeChalls = state.challenges.filter((c) => c.joined)
  const availableChalls = state.challenges.filter((c) => !c.joined)

  return (
    <div className="min-h-screen page-canvas pb-32">
      <div className="px-5 pt-14">
        <h1 className="text-[1.65rem] font-bold text-ink leading-tight">Challenges</h1>
        <p className="text-muted font-medium mt-1">Shared goals with friends</p>
      </div>

      <div className="px-5 mt-6 space-y-6">
        <GlassCard className="gradient-hero-purple p-5 flex items-center justify-between text-white">
          <div>
            <p className="label-caps text-white/75">This week</p>
            <p className="text-2xl font-bold mt-1 flex items-center gap-2">
              <Trophy size={22} fill="currentColor" />
              Rank #3
            </p>
          </div>
          <ChevronRight className="text-white/70" size={20} />
        </GlassCard>

        {activeChalls.length > 0 && (
          <section>
            <p className="text-lg font-bold text-ink mb-3">Active</p>
            <div className="space-y-4">
              {activeChalls.map((c, i) => (
                <GlassCard key={c.id} className={`${i % 2 === 0 ? 'card-tint-peach' : 'card-tint-sage'} p-5`}>
                  <div className="flex gap-4">
                    <ChallengeIcon type={c.type} size="lg" />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-ink">{c.title}</h3>
                      <p className="text-xs text-muted mt-1 line-clamp-2 font-medium">{c.description}</p>
                      <div className="mt-4 h-2 rounded-full bg-white/70 overflow-hidden">
                        <div className="h-full gradient-xp rounded-full" style={{ width: `${c.progress}%` }} />
                      </div>
                      <div className="flex justify-between mt-2 text-xs font-semibold text-muted">
                        <span>{c.progress}%</span>
                        <span>{c.daysLeft} days left</span>
                      </div>
                      {c.participants.length > 0 && (
                        <div className="flex items-center gap-1 mt-3">
                          {c.participants.slice(0, 3).map((p) => (
                            <UserAvatar key={p.id} avatar={p.avatar} friendId={p.id} name={p.name} size="sm" className="!w-7 !h-7 -ml-1 first:ml-0 ring-2 ring-white" />
                          ))}
                          <span className="text-[10px] font-semibold text-muted ml-1">
                            +{c.participantCount - c.participants.length} joined
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => joinChallenge(c.id)}
                    className="text-xs font-semibold text-muted mt-4 underline underline-offset-2"
                  >
                    Leave
                  </button>
                </GlassCard>
              ))}
            </div>
          </section>
        )}

        <section>
          <p className="text-lg font-bold text-ink mb-3">Discover</p>
          <div className="space-y-4">
            {availableChalls.map((c, i) => (
              <GlassCard key={c.id} className={`${DISCOVER_TINTS[i % DISCOVER_TINTS.length]} p-5`}>
                <div className="flex gap-4 items-center">
                  <ChallengeIcon type={c.type} />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-ink">{c.title}</h3>
                    <p className="text-xs text-muted mt-1 font-medium">
                      {c.duration} days · {c.participantCount} joined
                    </p>
                  </div>
                </div>
                <button type="button" onClick={() => joinChallenge(c.id)} className="btn-lime w-full mt-4 py-3 text-sm">
                  Join challenge
                </button>
              </GlassCard>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
