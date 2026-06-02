import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Zap, Users, Sparkles } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { CHECK_IN_QUESTIONS } from '../data/mockData'

export default function Social() {
  const { state, likeActivity, tryItYourself } = useApp()
  const navigate = useNavigate()
  const [tryModal, setTryModal] = useState<{ key: string; label: string; answer: string; emoji: string } | null>(null)

  function handleTryItYourself(questionKey: string, label: string, answer: string, emoji: string) {
    setTryModal({ key: questionKey, label, answer, emoji })
  }

  function confirmTry() {
    if (tryModal) {
      tryItYourself(tryModal.key)
      navigate('/checkin')
    }
    setTryModal(null)
  }

  const questionMap = Object.fromEntries(CHECK_IN_QUESTIONS.map(q => [q.key, q]))

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-slate-50 pb-24">
      {/* Header */}
      <div className="px-5 pt-14 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-800">Friends Feed</h1>
            <p className="text-slate-500 text-sm mt-0.5">See what your crew is up to</p>
          </div>
          <div className="flex items-center gap-1.5 bg-purple-100 rounded-xl px-3 py-1.5">
            <Users size={14} className="text-purple-600" />
            <span className="text-purple-700 font-bold text-sm">{state.friendActivities.length}</span>
          </div>
        </div>
      </div>

      {/* Friends streak row */}
      <div className="px-5 mb-4">
        <div className="bg-white rounded-2xl p-4 card-shadow">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Streaks</p>
          <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
            {[
              { name: 'You', avatar: state.avatar, streak: state.streak },
              ...state.friendActivities
                .filter((a, i, arr) => arr.findIndex(b => b.friendId === a.friendId) === i)
                .slice(0, 5)
                .map(a => ({ name: a.friendName, avatar: a.avatar, streak: Math.floor(Math.random() * 20) + 1 })),
            ].map((f, i) => (
              <div key={i} className="flex flex-col items-center gap-1 flex-shrink-0">
                <div className="relative">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-2xl">
                    {f.avatar}
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-orange-500 rounded-full w-5 h-5 flex items-center justify-center">
                    <span className="text-white text-[9px] font-black">{f.streak}</span>
                  </div>
                </div>
                <p className="text-[10px] font-semibold text-slate-600">{f.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activity feed */}
      <div className="px-5 space-y-3">
        {state.friendActivities.map((activity, i) => {
          const question = questionMap[activity.questionKey]
          return (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl p-4 card-shadow"
            >
              {/* Friend info */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-xl flex-shrink-0">
                  {activity.avatar}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-slate-800 text-sm">{activity.friendName}</p>
                  <p className="text-slate-400 text-xs">{activity.timeAgo}</p>
                </div>
                <div className="bg-purple-50 rounded-xl px-2.5 py-1">
                  <p className="text-purple-600 text-xs font-semibold">{activity.questionLabel}</p>
                </div>
              </div>

              {/* Answer display */}
              <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-3 mb-3">
                <span className="text-3xl">{activity.answerEmoji}</span>
                <div>
                  <p className="font-bold text-slate-800">{activity.answer}</p>
                  {question && (
                    <p className="text-slate-400 text-xs">{question.label}</p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => likeActivity(activity.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all tap-scale ${
                    activity.liked
                      ? 'bg-red-50 text-red-500'
                      : 'bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-400'
                  }`}
                >
                  <Heart size={15} fill={activity.liked ? 'currentColor' : 'none'} />
                  <span className="text-xs font-bold">{activity.likes}</span>
                </button>

                {!state.todayCheckedIn && (
                  <button
                    onClick={() => handleTryItYourself(activity.questionKey, activity.questionLabel, activity.answer, activity.answerEmoji)}
                    className="flex items-center gap-1.5 bg-purple-600 text-white px-3 py-1.5 rounded-xl tap-scale hover:bg-purple-700 transition-colors"
                  >
                    <Sparkles size={13} />
                    <span className="text-xs font-bold">Try it yourself</span>
                  </button>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* "Try it yourself" confirmation modal */}
      <AnimatePresence>
        {tryModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-50"
              onClick={() => setTryModal(null)}
            />
            <motion.div
              initial={{ opacity: 0, y: 100, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed bottom-24 left-4 right-4 bg-white rounded-3xl p-6 z-50 card-shadow max-w-md mx-auto"
            >
              <div className="text-center mb-5">
                <div className="text-5xl mb-3">{tryModal.emoji}</div>
                <h3 className="text-xl font-black text-slate-800">Try it yourself!</h3>
                <p className="text-slate-500 text-sm mt-1">
                  Your friend logged <span className="font-bold text-purple-600">"{tryModal.answer}"</span> for{' '}
                  <span className="font-medium">{tryModal.label}</span>
                </p>
                <p className="text-slate-400 text-xs mt-2">How would you rate the same thing?</p>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => setTryModal(null)}
                  className="py-3 rounded-xl bg-slate-100 text-slate-600 font-bold text-sm tap-scale"
                >
                  Maybe later
                </button>
                <button
                  onClick={confirmTry}
                  className="py-3 rounded-xl gradient-brand text-white font-bold text-sm tap-scale flex items-center justify-center gap-1.5"
                >
                  <Zap size={14} fill="white" />
                  Let's go!
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
