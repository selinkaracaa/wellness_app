import { motion } from 'framer-motion'
import { Users, Trophy, Flame, ChevronRight, Check, Clock } from 'lucide-react'
import { useApp } from '../context/AppContext'

export default function Challenges() {
  const { state, joinChallenge } = useApp()

  const activeChalls = state.challenges.filter(c => c.joined)
  const availableChalls = state.challenges.filter(c => !c.joined)

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-slate-50 pb-24">
      {/* Header */}
      <div className="px-5 pt-14 pb-5">
        <h1 className="text-2xl font-black text-slate-800">Challenges</h1>
        <p className="text-slate-500 text-sm mt-0.5">Compete with friends, build habits together</p>
      </div>

      {/* Leaderboard teaser */}
      <div className="px-5 mb-5">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="gradient-brand rounded-2xl p-4 flex items-center justify-between"
        >
          <div>
            <p className="text-purple-200 text-xs font-semibold uppercase tracking-wider">Weekly Leaderboard</p>
            <p className="text-white font-black text-lg mt-0.5">You're #3 this week! 🏆</p>
            <p className="text-purple-200 text-xs mt-0.5">Beat Maya to reach #2</p>
          </div>
          <div className="bg-white/20 rounded-xl p-2.5">
            <Trophy size={28} className="text-yellow-300" fill="currentColor" />
          </div>
        </motion.div>
      </div>

      {/* Active Challenges */}
      {activeChalls.length > 0 && (
        <div className="px-5 mb-5">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Your active challenges</p>
          <div className="space-y-3">
            {activeChalls.map((challenge, i) => (
              <motion.div
                key={challenge.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-4 card-shadow"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ backgroundColor: challenge.color + '20' }}
                  >
                    {challenge.emoji}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-800">{challenge.title}</h3>
                    <p className="text-slate-500 text-xs mt-0.5">{challenge.description}</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mb-3">
                  <div className="flex justify-between mb-1.5">
                    <span className="text-xs font-semibold text-slate-600">{challenge.progress}% complete</span>
                    <div className="flex items-center gap-1 text-slate-400">
                      <Clock size={11} />
                      <span className="text-xs">{challenge.daysLeft}d left</span>
                    </div>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: challenge.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${challenge.progress}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 + i * 0.1 }}
                    />
                  </div>
                </div>

                {/* Participants */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="flex -space-x-1.5">
                      {challenge.participants.slice(0, 3).map(p => (
                        <div
                          key={p.id}
                          className="w-7 h-7 bg-purple-100 rounded-full flex items-center justify-center text-sm border-2 border-white"
                        >
                          {p.avatar}
                        </div>
                      ))}
                    </div>
                    <span className="text-xs text-slate-500 font-medium">
                      +{challenge.participantCount} total
                    </span>
                  </div>
                  <button
                    onClick={() => joinChallenge(challenge.id)}
                    className="flex items-center gap-1.5 bg-red-50 text-red-500 text-xs font-bold px-2.5 py-1.5 rounded-xl tap-scale"
                  >
                    Leave
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Available Challenges */}
      <div className="px-5">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Join a challenge</p>
        <div className="space-y-3">
          {availableChalls.map((challenge, i) => (
            <motion.div
              key={challenge.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (activeChalls.length + i) * 0.07 }}
              className="bg-white rounded-2xl p-4 card-shadow"
            >
              <div className="flex items-start gap-3 mb-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ backgroundColor: challenge.color + '20' }}
                >
                  {challenge.emoji}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-800">{challenge.title}</h3>
                    <span
                      className="text-xs font-bold px-1.5 py-0.5 rounded-lg text-white"
                      style={{ backgroundColor: challenge.color }}
                    >
                      {challenge.duration}d
                    </span>
                  </div>
                  <p className="text-slate-500 text-xs mt-0.5">{challenge.description}</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-slate-400">
                    <Users size={12} />
                    <span className="text-xs font-medium">{challenge.participantCount} joined</span>
                  </div>
                  {challenge.participants.length > 0 && (
                    <div className="flex items-center gap-1">
                      <div className="flex -space-x-1">
                        {challenge.participants.slice(0, 2).map(p => (
                          <div
                            key={p.id}
                            className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center text-xs border border-white"
                          >
                            {p.avatar}
                          </div>
                        ))}
                      </div>
                      <span className="text-xs text-purple-600 font-semibold">
                        {challenge.participants[0].name} is in!
                      </span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => joinChallenge(challenge.id)}
                  className="flex items-center gap-1.5 text-white text-xs font-bold px-3 py-2 rounded-xl tap-scale transition-all"
                  style={{ backgroundColor: challenge.color }}
                >
                  <Flame size={12} />
                  Join
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Completed challenges */}
      <div className="px-5 mt-6">
        <div className="bg-white rounded-2xl p-4 card-shadow flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
            <Check size={18} className="text-green-600" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-slate-700 text-sm">Past challenges</p>
            <p className="text-slate-400 text-xs">You've completed 2 challenges</p>
          </div>
          <ChevronRight size={16} className="text-slate-300" />
        </div>
      </div>
    </div>
  )
}
