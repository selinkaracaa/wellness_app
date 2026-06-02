import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, Zap } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { CHECK_IN_QUESTIONS } from '../data/mockData'

export default function CheckIn() {
  const { state, completeCheckIn, pendingCheckInQuestion, clearPendingQuestion } = useApp()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [direction, setDirection] = useState(1)
  const [showComplete, setShowComplete] = useState(false)
  const [selected, setSelected] = useState<number | null>(null)
  const [animating, setAnimating] = useState(false)

  // Jump to a specific question if "try it yourself" was tapped
  useEffect(() => {
    if (pendingCheckInQuestion) {
      const idx = CHECK_IN_QUESTIONS.findIndex(q => q.key === pendingCheckInQuestion)
      if (idx !== -1) {
        setStep(idx)
      }
      clearPendingQuestion()
    }
  }, [pendingCheckInQuestion, clearPendingQuestion])

  if (state.todayCheckedIn && !showComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-slate-50 flex flex-col items-center justify-center p-6 pb-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="text-7xl mb-4">✅</div>
          <h2 className="text-2xl font-black text-slate-800 mb-2">Already done!</h2>
          <p className="text-slate-500 mb-6">You've completed today's check-in. See you tomorrow!</p>
          <button
            onClick={() => navigate('/')}
            className="gradient-brand text-white font-bold py-3.5 px-8 rounded-2xl tap-scale"
          >
            Back to Home
          </button>
        </motion.div>
      </div>
    )
  }

  const q = CHECK_IN_QUESTIONS[step]
  const totalXP = CHECK_IN_QUESTIONS.reduce((s, q) => s + q.xp, 0)
  const earnedXP = CHECK_IN_QUESTIONS.slice(0, step).reduce((s, q) => s + q.xp, 0)
  const progress = (step / CHECK_IN_QUESTIONS.length) * 100

  function handleSelect(value: number) {
    if (animating) return
    setSelected(value)
    setAnimating(true)

    setTimeout(() => {
      const newAnswers = { ...answers, [q.key]: value }
      setAnswers(newAnswers)
      setSelected(null)
      setAnimating(false)

      if (step < CHECK_IN_QUESTIONS.length - 1) {
        setDirection(1)
        setStep(s => s + 1)
      } else {
        const xp = CHECK_IN_QUESTIONS.reduce((s, q) => s + q.xp, 0)
        completeCheckIn(newAnswers, xp)
        setShowComplete(true)
      }
    }, 400)
  }

  function handleBack() {
    if (step === 0) {
      navigate('/')
    } else {
      setDirection(-1)
      setStep(s => s - 1)
    }
  }

  if (showComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-slate-50 flex flex-col pb-24">
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center w-full max-w-sm"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2, stiffness: 200 }}
              className="text-8xl mb-4"
            >
              🎉
            </motion.div>
            <h2 className="text-3xl font-black text-slate-800 mb-2">Amazing!</h2>
            <p className="text-slate-500 mb-6">Check-in complete! Keep the streak alive 🔥</p>

            {/* XP burst */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
              className="gradient-streak rounded-2xl p-4 mb-6 inline-flex items-center gap-3"
            >
              <Zap size={24} className="text-white" fill="white" />
              <div className="text-left">
                <p className="text-white/80 text-sm">You earned</p>
                <p className="text-white text-3xl font-black">+{totalXP} XP</p>
              </div>
            </motion.div>

            {/* Answer summary */}
            <div className="grid grid-cols-3 gap-2.5 mb-6 w-full">
              {CHECK_IN_QUESTIONS.map((question, i) => {
                const val = answers[question.key]
                const opt = question.options.find(o => o.value === val)
                return (
                  <motion.div
                    key={question.key}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + i * 0.05 }}
                    className="bg-white rounded-xl p-3 text-center card-shadow"
                  >
                    <p className="text-2xl">{opt?.emoji || question.emoji}</p>
                    <p className="text-[10px] font-semibold text-slate-500 mt-1 leading-tight">{question.key}</p>
                  </motion.div>
                )
              })}
            </div>

            <button
              onClick={() => navigate('/')}
              className="w-full gradient-brand text-white font-bold py-4 rounded-2xl text-base tap-scale"
            >
              Back to Home 🏠
            </button>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex flex-col pb-24">
      {/* Top bar */}
      <div className="px-5 pt-14 pb-4">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={handleBack} className="p-2 rounded-xl hover:bg-purple-100 transition-colors tap-scale">
            <ChevronLeft size={20} className="text-slate-600" />
          </button>
          <div className="flex-1 h-3 bg-slate-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full gradient-brand rounded-full"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <button onClick={() => navigate('/')} className="p-2 rounded-xl hover:bg-red-50 transition-colors tap-scale">
            <X size={18} className="text-slate-400" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-purple-500 bg-purple-100 px-2 py-0.5 rounded-full">
            {step + 1}/{CHECK_IN_QUESTIONS.length}
          </span>
          <div className="flex items-center gap-1">
            <Zap size={12} className="text-amber-500" fill="currentColor" />
            <span className="text-xs font-semibold text-amber-500">+{earnedXP} XP so far</span>
          </div>
        </div>
      </div>

      {/* Question card */}
      <div className="flex-1 px-5 overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={step}
            initial={{ x: direction * 60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: direction * -60, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="h-full flex flex-col"
          >
            {/* Question header */}
            <div className="text-center mb-8 mt-4">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 300 }}
                className="text-6xl mb-4"
              >
                {q.emoji}
              </motion.div>
              <h2 className="text-2xl font-black text-slate-800 leading-tight px-4">
                {q.label}
              </h2>
              <p className="text-slate-400 text-sm mt-1">Tap the one that fits best</p>
            </div>

            {/* Options */}
            <div className="space-y-3">
              {q.options.map((option, i) => {
                const isSelected = selected === option.value
                return (
                  <motion.button
                    key={option.value}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * i }}
                    onClick={() => handleSelect(option.value)}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200 tap-scale ${
                      isSelected
                        ? 'border-transparent scale-95'
                        : 'bg-white border-slate-100 hover:border-purple-200 hover:shadow-md'
                    }`}
                    style={isSelected ? { backgroundColor: option.color + '20', borderColor: option.color } : {}}
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 shadow-sm"
                      style={{ backgroundColor: option.color + '20' }}
                    >
                      {option.emoji}
                    </div>
                    <div className="text-left flex-1">
                      <p className="font-bold text-slate-800 text-base">{option.label}</p>
                    </div>
                    <div className="flex gap-1">
                      {[1,2,3,4,5].map(dot => (
                        <div
                          key={dot}
                          className="w-1.5 h-4 rounded-full transition-colors"
                          style={{ backgroundColor: dot <= option.value ? option.color : '#e2e8f0' }}
                        />
                      ))}
                    </div>
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
