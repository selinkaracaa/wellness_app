import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import GlassCard from './GlassCard'
import DecorativeOrb from './DecorativeOrb'

interface DailyCheckInCardProps {
  totalXp?: number
}

export default function DailyCheckInCard({ totalXp = 95 }: DailyCheckInCardProps) {
  const navigate = useNavigate()

  return (
    <GlassCard className="card-tint-lavender p-5 relative overflow-hidden">
      <div className="absolute inset-0 glass-frosted pointer-events-none opacity-60" aria-hidden />
      <div className="relative z-10 pr-24">
        <p className="text-sm font-bold text-ink/80">Evening self-assessment</p>
        <h2 className="text-xl font-bold text-ink mt-1 leading-snug">Rate yourself 1–5</h2>
        <div className="flex gap-6 mt-4 text-xs font-semibold text-ink/70">
          <span>~2 min</span>
          <span>Up to {totalXp} XP · any score saves streak</span>
        </div>
      </div>
      <DecorativeOrb size={96} className="absolute -right-2 top-4 opacity-95 z-[1]" />
      <button
        type="button"
        onClick={() => navigate('/checkin')}
        className="relative z-10 w-full mt-5 btn-lime py-3.5 px-4 flex items-center justify-between text-sm tap-scale"
      >
        Start today&apos;s session
        <ChevronRight size={18} />
      </button>
    </GlassCard>
  )
}
