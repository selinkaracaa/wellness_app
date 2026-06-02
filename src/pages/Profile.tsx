import { motion } from 'framer-motion'
import { Flame, Zap, Trophy, TrendingUp, Lock } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { CHECK_IN_QUESTIONS } from '../data/mockData'

const rarityColors: Record<string, string> = {
  common: '#94a3b8',
  rare: '#3b82f6',
  epic: '#8b5cf6',
  legendary: '#f59e0b',
}

const rarityBg: Record<string, string> = {
  common: '#f1f5f9',
  rare: '#eff6ff',
  epic: '#f5f3ff',
  legendary: '#fffbeb',
}

export default function Profile() {
  const { state } = useApp()
  const xpPercent = Math.round((state.xp / state.xpToNextLevel) * 100)
  const earnedBadges = state.badges.filter(b => b.earned)
  const unearnedBadges = state.badges.filter(b => !b.earned)

  // Generate 30-day calendar
  const today = new Date()
  const calendarDays = Array.from({ length: 35 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - (34 - i))
    const isToday = d.toDateString() === today.toDateString()
    // Simulate some past check-ins
    const dayOffset = 34 - i
    const done = dayOffset === 0
      ? state.todayCheckedIn
      : dayOffset <= state.streak || (dayOffset > state.streak && dayOffset < state.streak + 3 && Math.random() > 0.4)
    return {
      date: d,
      done,
      isToday,
      dayNum: d.getDate(),
    }
  })

  const avgScores = CHECK_IN_QUESTIONS.map(q => {
    const val = state.todayAnswers[q.key] || Math.floor(Math.random() * 2) + 3
    return { key: q.key, label: q.key, emoji: q.emoji, avg: val }
  })

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-slate-50 pb-24">
      {/* Header */}
      <div className="gradient-brand px-5 pt-14 pb-8 rounded-b-3xl">
        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-5xl mb-3">
            {state.avatar}
          </div>
          <h1 className="text-white text-2xl font-black">{state.userName}</h1>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="bg-white/20 text-white text-xs font-bold px-2.5 py-1 rounded-full">
              Level {state.level} Wellness Explorer
            </span>
          </div>

          {/* XP progress */}
          <div className="w-full mt-4 bg-white/10 rounded-xl p-3">
            <div className="flex justify-between mb-1.5">
              <span className="text-white/80 text-xs">XP Progress</span>
              <span className="text-white text-xs font-bold">{state.xp}/{state.xpToNextLevel}</span>
            </div>
            <div className="h-2.5 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-yellow-400 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${xpPercent}%` }}
                transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 py-5 space-y-5">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Flame, value: state.streak, label: 'Current streak', color: 'bg-orange-100', iconColor: 'text-orange-500', fill: true },
            { icon: TrendingUp, value: state.longestStreak, label: 'Best streak', color: 'bg-purple-100', iconColor: 'text-purple-600', fill: false },
            { icon: Zap, value: state.totalCheckIns, label: 'Total check-ins', color: 'bg-amber-100', iconColor: 'text-amber-500', fill: true },
          ].map(({ icon: Icon, value, label, color, iconColor, fill }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className="bg-white rounded-2xl p-3.5 card-shadow text-center"
            >
              <div className={`w-9 h-9 ${color} rounded-xl flex items-center justify-center mx-auto mb-1.5`}>
                <Icon size={18} className={iconColor} fill={fill ? 'currentColor' : 'none'} />
              </div>
              <p className="text-xl font-black text-slate-800">{value}</p>
              <p className="text-[10px] text-slate-500 font-medium leading-tight">{label}</p>
            </motion.div>
          ))}
        </div>

        {/* Check-in Calendar */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-4 card-shadow"
        >
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Check-in history</p>
          <div className="grid grid-cols-7 gap-1.5">
            {['M','T','W','T','F','S','S'].map((d, i) => (
              <p key={i} className="text-center text-[9px] font-bold text-slate-400 mb-0.5">{d}</p>
            ))}
            {calendarDays.map((day, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.02 * i }}
                className={`aspect-square rounded-lg flex items-center justify-center text-[10px] font-bold transition-all ${
                  day.isToday
                    ? day.done
                      ? 'gradient-streak text-white shadow-sm'
                      : 'border-2 border-dashed border-purple-300 text-purple-500'
                    : day.done
                    ? 'bg-purple-500 text-white'
                    : 'bg-slate-100 text-slate-300'
                }`}
              >
                {day.done ? '✓' : day.dayNum}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Average ratings */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white rounded-2xl p-4 card-shadow"
        >
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Your averages</p>
          <div className="space-y-3">
            {avgScores.map(s => (
              <div key={s.key} className="flex items-center gap-3">
                <span className="text-xl w-8 flex-shrink-0">{s.emoji}</span>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <p className="text-xs font-semibold text-slate-600 capitalize">{s.label}</p>
                    <p className="text-xs font-bold text-purple-600">{s.avg}/5</p>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full gradient-brand rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${(s.avg / 5) * 100}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Badges */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-4 card-shadow"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Badges</p>
            <div className="flex items-center gap-1">
              <Trophy size={12} className="text-amber-500" />
              <span className="text-xs font-bold text-amber-500">{earnedBadges.length}/{state.badges.length} earned</span>
            </div>
          </div>

          {/* Earned */}
          {earnedBadges.length > 0 && (
            <div className="mb-4">
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-2">Unlocked</p>
              <div className="grid grid-cols-4 gap-2">
                {earnedBadges.map((badge, i) => (
                  <motion.div
                    key={badge.id}
                    initial={{ scale: 0, rotate: -10 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.35 + i * 0.05, type: 'spring', stiffness: 300 }}
                    className="flex flex-col items-center gap-1"
                  >
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm border-2"
                      style={{
                        backgroundColor: rarityBg[badge.rarity],
                        borderColor: rarityColors[badge.rarity] + '40',
                      }}
                    >
                      {badge.emoji}
                    </div>
                    <p className="text-[9px] font-bold text-slate-600 text-center leading-tight">{badge.name}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Locked */}
          <div>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-2">Locked</p>
            <div className="grid grid-cols-4 gap-2">
              {unearnedBadges.map((badge, i) => (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 + i * 0.04 }}
                  className="flex flex-col items-center gap-1 opacity-50"
                >
                  <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center relative">
                    <span className="text-2xl grayscale">{badge.emoji}</span>
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-200/60 rounded-2xl">
                      <Lock size={14} className="text-slate-500" />
                    </div>
                  </div>
                  <p className="text-[9px] font-bold text-slate-400 text-center leading-tight">{badge.name}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Rarity legend */}
        <div className="flex gap-2 flex-wrap justify-center pb-2">
          {Object.entries(rarityColors).map(([rarity, color]) => (
            <div key={rarity} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-[10px] text-slate-500 font-semibold capitalize">{rarity}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
