import type { CSSProperties } from 'react'

interface StreakHeroProps {
  streak: number
  glowLevel: number
  status: string
  progress: number
  total: number
}

export default function StreakHero({ streak, glowLevel, status, progress, total }: StreakHeroProps) {
  const ringFill = total > 0 ? progress / total : 0

  return (
    <div className="px-5">
      <div
        className="streak-hero rounded-[1.75rem] px-6 py-6 relative overflow-hidden"
        style={{ '--glow-level': glowLevel, '--ring-fill': ringFill } as CSSProperties}
      >
        <div className="absolute inset-0 streak-hero-shine pointer-events-none" aria-hidden />
        <div className="relative flex items-center justify-between gap-4">
          <div>
            <p className="label-caps text-muted">Awareness streak</p>
            <p className="font-display text-5xl text-ink mt-1 tabular-nums leading-none">{streak}</p>
            <p className="text-xs text-muted mt-2">{status}</p>
          </div>
          <div className="shrink-0">
            <div className="streak-ring w-[4.5rem] h-[4.5rem] rounded-full flex items-center justify-center">
              <span className="text-[11px] font-bold text-ink tabular-nums">
                {progress}/{total}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
