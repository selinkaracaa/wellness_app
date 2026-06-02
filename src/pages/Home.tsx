import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Flame, Zap, ChevronRight, TrendingUp, Droplets, Dumbbell, Moon, Smile, Smartphone, Utensils } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { CHECK_IN_QUESTIONS } from '../data/mockData'

const questionIcons: Record<string, React.ElementType> = {
  water: Droplets,
  activity: Dumbbell,
  nutrition: Utensils,
  sleep: Moon,
  screen: Smartphone,
  mood: Smile,
}

const emojiForValue: Record<number, string> = {
  1: '😔', 2: '🙁', 3: '😐', 4: '😊', 5: '🌟',
}

export default function Home() {
  const { state } = useApp()
  const navigate = useNavigate()
  const xpPercent = Math.round((state.xp / state.xpToNextLevel) * 100)

  const today = new Date()
  const hour = today.getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    const isToday = i === 6
    const done = i < 6 ? true : state.todayCheckedIn
    return { label: d.toLocaleDateString('en', { weekday: 'narrow' }), done, isToday }
  })

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-slate-50 pb-24">
      {/* Header */}
      <div className="gradient-brand px-5 pt-14 pb-8 rounded-b-3xl">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-purple-200 text-sm font-medium">{greeting} 👋</p>
            <h1 className="text-white text-2xl font-bold mt-0.5">{state.userName}</h1>
          </div>
          <div className="flex flex-col items-center bg-white/20 rounded-2xl px-3 py-2">
            <span className="text-3xl">{state.avatar}</span>
            <span className="text-white text-xs font-bold mt-0.5">Lvl {state.level}</span>
          </div>
        </div>

        {/* XP Bar */}
        <div className="bg-white/10 rounded-2xl p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Zap size={14} className="text-yellow-300" fill="currentColor" />
              <span className="text-white text-xs font-semibold">{state.xp} / {state.xpToNextLevel} XP</span>
            </div>
            <span className="text-purple-200 text-xs">Level {state.level} → {state.level + 1}</span>
          </div>
          <div className="h-2.5 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-yellow-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${xpPercent}%` }}
              transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
            />
          </div>
        </div>
      </div>

      <div className="px-5 py-5 space-y-5">
        {/* Streak + Stats row */}
        <div className="grid grid-cols-3 gap-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-3.5 card-shadow flex flex-col items-center"
          >
            <div className="w-10 h-10 gradient-streak rounded-xl flex items-center justify-center mb-1.5">
              <Flame size={20} className="text-white" fill="white" />
            </div>
            <p className="text-2xl font-black text-slate-800">{state.streak}</p>
            <p className="text-xs text-slate-500 font-medium">day streak</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white rounded-2xl p-3.5 card-shadow flex flex-col items-center"
          >
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mb-1.5">
              <TrendingUp size={20} className="text-purple-600" />
            </div>
            <p className="text-2xl font-black text-slate-800">{state.totalCheckIns}</p>
            <p className="text-xs text-slate-500 font-medium">check-ins</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-3.5 card-shadow flex flex-col items-center"
          >
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center mb-1.5">
              <Zap size={20} className="text-amber-500" fill="currentColor" />
            </div>
            <p className="text-2xl font-black text-slate-800">{state.xp}</p>
            <p className="text-xs text-slate-500 font-medium">total XP</p>
          </motion.div>
        </div>

        {/* Weekly streak dots */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white rounded-2xl p-4 card-shadow"
        >
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">This week</p>
          <div className="flex justify-between">
            {weekDays.map((day, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  day.done
                    ? 'gradient-streak text-white shadow-md'
                    : day.isToday
                    ? 'border-2 border-dashed border-purple-300 text-purple-400'
                    : 'bg-slate-100 text-slate-300'
                }`}>
                  {day.done ? '✓' : day.isToday ? '○' : '·'}
                </div>
                <span className={`text-[10px] font-semibold ${day.isToday ? 'text-purple-600' : 'text-slate-400'}`}>
                  {day.label}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Today's check-in CTA or summary */}
        {!state.todayCheckedIn ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="gradient-brand rounded-2xl p-5 card-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm font-medium mb-1">Daily check-in</p>
                <h3 className="text-white text-lg font-bold">How are you doing today?</h3>
                <p className="text-purple-200 text-xs mt-1">~2 min · earn up to 95 XP</p>
              </div>
              <div className="text-4xl">🌟</div>
            </div>
            <button
              onClick={() => navigate('/checkin')}
              className="mt-4 w-full bg-white text-purple-700 font-bold py-3 rounded-xl text-sm tap-scale hover:bg-purple-50 transition-colors"
            >
              Start Check-in →
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-lg">✓</span>
              </div>
              <div>
                <p className="text-emerald-700 font-bold">Today's check-in done!</p>
                <p className="text-emerald-600 text-xs">Great job keeping the streak alive 🔥</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {CHECK_IN_QUESTIONS.map(q => {
                const val = state.todayAnswers[q.key]
                if (!val) return null
                return (
                  <div key={q.key} className="bg-white rounded-xl p-2.5 text-center">
                    <p className="text-xl">{q.options.find(o => o.value === val)?.emoji || q.emoji}</p>
                    <p className="text-[10px] font-semibold text-slate-500 mt-1">{q.label.split(' ')[2] || q.label.split(' ')[0]}</p>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* Friend activity peek */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-4 card-shadow"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="font-bold text-slate-800">Friends activity</p>
            <button
              onClick={() => navigate('/social')}
              className="flex items-center gap-1 text-purple-600 text-sm font-semibold"
            >
              See all <ChevronRight size={14} />
            </button>
          </div>
          <div className="space-y-2.5">
            {state.friendActivities.slice(0, 3).map(activity => (
              <div key={activity.id} className="flex items-center gap-3">
                <div className="w-9 h-9 bg-purple-100 rounded-full flex items-center justify-center text-lg flex-shrink-0">
                  {activity.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700">
                    <span className="font-semibold">{activity.friendName}</span>
                    {' '}logged{' '}
                    <span className="text-purple-600 font-medium">{activity.answer}</span>
                  </p>
                  <p className="text-xs text-slate-400">{activity.timeAgo}</p>
                </div>
                <span className="text-xl">{activity.answerEmoji}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Today's log summary (if checked in) */}
        {state.todayCheckedIn && Object.keys(state.todayAnswers).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="bg-white rounded-2xl p-4 card-shadow"
          >
            <p className="font-bold text-slate-800 mb-3">Today's ratings</p>
            <div className="space-y-2">
              {CHECK_IN_QUESTIONS.map(q => {
                const val = state.todayAnswers[q.key]
                if (!val) return null
                const Icon = questionIcons[q.key] || Smile
                const option = q.options.find(o => o.value === val)
                return (
                  <div key={q.key} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                      <Icon size={15} className="text-purple-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-slate-500 font-medium">{q.label}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map(i => (
                          <div
                            key={i}
                            className="w-1.5 h-4 rounded-full"
                            style={{ backgroundColor: i <= val ? option?.color : '#e2e8f0' }}
                          />
                        ))}
                      </div>
                      <span className="text-sm">{emojiForValue[val]}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
