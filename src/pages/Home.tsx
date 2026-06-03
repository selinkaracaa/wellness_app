import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LayoutGrid, Bell, Trophy, Zap, Flame, TrendingUp } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { CHECK_IN_QUESTIONS } from '../data/mockData'
import GlassCard from '../components/ui/GlassCard'
import UserAvatar from '../components/ui/UserAvatar'
import DecorativeOrb from '../components/ui/DecorativeOrb'
import DailyCheckInCard from '../components/ui/DailyCheckInCard'
import WellnessScoreRing from '../components/ui/WellnessScoreRing'
import CategoryPills from '../components/ui/CategoryPills'
import { QuestionSymbol } from '../components/ui/OptionSymbol'
import { wellnessScore } from '../utils/wellnessScore'

export default function Home() {
  const { state } = useApp()
  const navigate = useNavigate()
  const xpPercent = Math.round((state.xp / state.xpToNextLevel) * 100)
  const completedToday = Object.keys(state.todayAnswers).length
  const totalCategories = CHECK_IN_QUESTIONS.length
  const score = wellnessScore(state.todayCheckedIn, state.todayAnswers, totalCategories)
  const categoryKeys = CHECK_IN_QUESTIONS.map((q) => q.key)

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return {
      dayNum: d.getDate(),
      label: d.toLocaleDateString('en', { weekday: 'narrow' }),
      done: i < 6 ? true : state.todayCheckedIn,
      isToday: i === 6,
    }
  })

  return (
    <div className="min-h-screen page-canvas pb-32">
      <div className="px-5 pt-12 pb-2">
        <div className="flex items-center justify-between">
          <button
            type="button"
            className="w-10 h-10 rounded-full card-tint-white card-float flex items-center justify-center tap-scale"
            aria-label="Menu"
          >
            <LayoutGrid size={18} className="text-ink-soft" />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-white rounded-full px-3 py-1.5 card-float">
              <Trophy size={14} className="text-sage" />
              <span className="text-sm font-bold text-ink">{state.xp} pts</span>
            </div>
            <button
              type="button"
              className="relative w-10 h-10 rounded-full card-tint-white card-float flex items-center justify-center tap-scale"
              aria-label="Notifications"
            >
              <Bell size={18} className="text-ink-soft" />
              {!state.todayCheckedIn && <span className="absolute top-2 right-2 w-2 h-2 bg-lime rounded-full" />}
            </button>
            <UserAvatar avatar={state.avatar} name={state.userName} size="sm" />
          </div>
        </div>

        <div className="mt-8">
          <h1 className="text-[1.65rem] font-bold text-ink leading-tight">
            {greeting}, {state.userName}
          </h1>
          <p className="text-muted font-medium mt-1">Today&apos;s Summary</p>
        </div>

        <div className="flex items-end gap-4 mt-6">
          <div className="flex items-baseline flex-1 min-w-0">
            <span className="text-5xl font-bold text-ink leading-none">
              {String(completedToday).padStart(2, '0')}
            </span>
            <span className="text-3xl font-bold text-muted/50 mx-1">/</span>
            <span className="text-4xl font-bold text-muted/40 leading-none">
              {String(totalCategories).padStart(2, '0')}
            </span>
            <p className="text-sm text-muted pb-1.5 leading-snug ml-3">
              Categories
              <br />
              today
            </p>
          </div>
          <WellnessScoreRing value={score} size={88} />
        </div>

        <div className="mt-4">
          <CategoryPills keys={categoryKeys} />
        </div>

        <div className="mt-4 h-2 rounded-full bg-white/80 overflow-hidden card-float">
          <motion.div
            className="h-full gradient-xp rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${xpPercent}%` }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
          />
        </div>
        <p className="text-[11px] text-muted mt-1.5">
          {state.xp} / {state.xpToNextLevel} XP · Level {state.level}
        </p>
      </div>

      <div className="px-5 space-y-5">
        {!state.todayCheckedIn ? (
          <DailyCheckInCard />
        ) : (
          <GlassCard className="gradient-hero-purple p-5 text-white relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-sm font-semibold text-white/85">Check-in complete</p>
              <p className="text-2xl font-bold mt-1">Streak protected</p>
              <p className="text-xs text-white/70 mt-2">+95 XP earned today</p>
            </div>
            <DecorativeOrb size={80} className="absolute -right-4 top-2 opacity-80" />
          </GlassCard>
        )}

        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Flame, value: state.streak, label: 'Day streak', tint: 'card-tint-peach', iconBg: 'gradient-streak text-white' },
            { icon: TrendingUp, value: state.totalCheckIns, label: 'Check-ins', tint: 'card-tint-sage', iconBg: 'bg-sage/20 text-sage' },
            { icon: Zap, value: state.xp, label: 'Total XP', tint: 'card-tint-mint', iconBg: 'bg-lime/50 text-ink' },
          ].map(({ icon: Icon, value, label, tint, iconBg }) => (
            <GlassCard key={label} className={`${tint} p-3.5 flex flex-col`}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2 ${iconBg}`}>
                <Icon size={18} fill={iconBg.includes('gradient') ? 'white' : 'none'} />
              </div>
              <p className="text-2xl font-bold text-ink">{value}</p>
              <p className="text-[10px] font-semibold text-muted mt-0.5 leading-tight">{label}</p>
            </GlassCard>
          ))}
        </div>

        <div>
          <p className="text-lg font-bold text-ink mb-3">This week</p>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {weekDays.map((day, i) => (
              <div
                key={i}
                className={`shrink-0 flex flex-col items-center justify-center w-11 h-[4.5rem] rounded-full transition-all ${
                  day.isToday && !day.done
                    ? 'bg-ink text-white'
                    : day.done
                      ? 'bg-ink text-white'
                      : 'card-tint-white text-muted'
                }`}
              >
                {day.isToday && !day.done && <span className="w-1 h-1 rounded-full bg-white mb-1" />}
                <span className="text-sm font-bold">{day.dayNum}</span>
                <span className="text-[10px] font-medium opacity-80">{day.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-lg font-bold text-ink">Friends</p>
            <button type="button" onClick={() => navigate('/social')} className="text-sm text-link tap-scale">
              See all
            </button>
          </div>
          <GlassCard className="card-tint-peach p-4 space-y-4">
            {state.friendActivities.slice(0, 3).map((activity) => (
              <div key={activity.id} className="flex items-center gap-3">
                <UserAvatar avatar={activity.avatar} friendId={activity.friendId} name={activity.friendName} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-ink">{activity.friendName}</p>
                  <p className="text-xs text-muted truncate">{activity.answer}</p>
                </div>
                <QuestionSymbol questionKey={activity.questionKey} size="sm" />
              </div>
            ))}
          </GlassCard>
        </div>
      </div>
    </div>
  )
}
