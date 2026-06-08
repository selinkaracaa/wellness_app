import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Trophy, Lock, Palette, LogOut } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { CHECK_IN_QUESTIONS } from '../data/mockData'
import GlassCard from '../components/ui/GlassCard'
import UserAvatar from '../components/ui/UserAvatar'
import DecorativeOrb from '../components/ui/DecorativeOrb'
import BadgeIcon from '../components/ui/BadgeIcon'
import WellnessScoreRing from '../components/ui/WellnessScoreRing'
import { QuestionSymbol } from '../components/ui/OptionSymbol'
import { wellnessScore } from '../utils/wellnessScore'

export default function Profile() {
  const { state, logout } = useApp()
  const xpPercent = Math.round((state.xp / state.xpToNextLevel) * 100)
  const earnedBadges = state.badges.filter((b) => b.earned)
  const unearnedBadges = state.badges.filter((b) => !b.earned)
  const score = wellnessScore(state.todayCheckedIn, state.todayAnswers, CHECK_IN_QUESTIONS.length)

  const today = new Date()
  const calendarDays = Array.from({ length: 35 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - (34 - i))
    const isToday = d.toDateString() === today.toDateString()
    const dayOffset = 34 - i
    const done = dayOffset === 0 ? state.todayCheckedIn : dayOffset > 0 && dayOffset <= state.streak
    return { done, isToday, dayNum: d.getDate() }
  })

  const avgScores = CHECK_IN_QUESTIONS.map((q) => ({
    key: q.key,
    avg: state.todayAnswers[q.key],
  })).filter((s) => s.avg != null)

  return (
    <div className="min-h-screen page-canvas pb-32">
      <div className="px-5 pt-14 pb-2 relative overflow-hidden">
        <DecorativeOrb size={120} className="absolute -right-8 top-6 opacity-80" />
        <header className="relative z-10 flex flex-col items-center text-center">
          <UserAvatar avatar={state.avatar} name={state.userName} size="xl" />
          <h1 className="text-2xl font-bold text-ink mt-5">{state.userName}</h1>
          <div className="flex items-center gap-1.5 mt-2 bg-white rounded-full px-3 py-1 card-float">
            <Trophy size={14} className="text-sage" />
            <span className="text-sm font-bold text-ink">Level {state.level}</span>
          </div>
        </header>
      </div>

      <div className="px-5 space-y-6">
        <GlassCard className="card-tint-sage p-5 flex items-center gap-5">
          <WellnessScoreRing value={score} size={100} />
          <div className="flex-1 min-w-0">
            <p className="label-caps">Daily wellness</p>
            <p className="text-sm font-semibold text-ink mt-1">
              {state.todayCheckedIn ? 'Based on today’s check-in' : 'Complete check-in to score'}
            </p>
            <div className="mt-3 flex justify-between text-xs font-semibold text-muted">
              <span>{state.xp} XP</span>
              <span>{state.xpToNextLevel - state.xp} to next</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-white/70 overflow-hidden">
              <motion.div
                className="h-full gradient-xp rounded-full"
                animate={{ width: `${xpPercent}%` }}
                transition={{ duration: 0.8 }}
              />
            </div>
          </div>
        </GlassCard>

        <div className="grid grid-cols-3 gap-3">
          {[
            { v: state.streak, l: 'Streak', tint: 'card-tint-peach' },
            { v: state.longestStreak, l: 'Best', tint: 'card-tint-sand' },
            { v: state.totalCheckIns, l: 'Total', tint: 'card-tint-mint' },
          ].map(({ v, l, tint }) => (
            <GlassCard key={l} className={`${tint} p-4 text-center`}>
              <p className="text-2xl font-bold text-ink">{v}</p>
              <p className="text-[10px] font-semibold text-muted mt-1">{l}</p>
            </GlassCard>
          ))}
        </div>

        <div>
          <p className="text-lg font-bold text-ink mb-3">History</p>
          <GlassCard className="card-tint-white p-4">
            <div className="grid grid-cols-7 gap-2">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                <p key={i} className="text-center text-[9px] font-bold text-muted pb-1">
                  {d}
                </p>
              ))}
              {calendarDays.map((day, i) => (
                <div
                  key={i}
                  className={`aspect-square rounded-lg flex items-center justify-center text-[10px] font-semibold ${
                    day.done ? 'bg-ink text-white' : day.isToday ? 'ring-2 ring-sage text-ink bg-white' : 'text-muted bg-sage-light/50'
                  }`}
                >
                  {day.dayNum}
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {avgScores.length > 0 && (
          <div>
            <p className="text-lg font-bold text-ink mb-3">Today&apos;s averages</p>
            <GlassCard className="card-tint-white divide-y divide-black/5">
              {avgScores.map((s) => (
                <div key={s.key} className="flex items-center gap-4 p-4">
                  <QuestionSymbol questionKey={s.key} size="sm" />
                  <span className="flex-1 text-sm font-semibold text-ink capitalize">{s.key}</span>
                  <span className="text-sm font-bold text-sage">{s.avg}/5</span>
                </div>
              ))}
            </GlassCard>
          </div>
        )}

        <div>
          <div className="flex items-baseline justify-between mb-3">
            <p className="text-lg font-bold text-ink">Badges</p>
            <span className="text-xs font-semibold text-muted flex items-center gap-1">
              <Trophy size={12} className="text-sage" />
              {earnedBadges.length}/{state.badges.length}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[...earnedBadges, ...unearnedBadges].map((badge) => (
              <div key={badge.id} className={`text-center ${badge.earned ? '' : 'opacity-50'}`}>
                <div className="relative">
                  <BadgeIcon badge={badge} />
                  {!badge.earned && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-white/55 backdrop-blur-[2px]">
                      <Lock size={16} className="text-ink-soft" strokeWidth={2} />
                    </div>
                  )}
                </div>
                <p className="text-[10px] font-bold text-ink mt-2 leading-tight px-0.5">{badge.name}</p>
                <p className="text-[9px] text-muted capitalize mt-0.5">{badge.rarity}</p>
              </div>
            ))}
          </div>
        </div>

        <Link to="/brand" className="flex items-center justify-center gap-2 py-4 text-sm text-link tap-scale">
          <Palette size={16} />
          View brand guide
        </Link>

        <button
          type="button"
          onClick={logout}
          className="flex items-center justify-center gap-2 w-full py-3 text-sm font-semibold text-muted tap-scale"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </div>
  )
}
