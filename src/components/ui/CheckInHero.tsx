import type { ReactNode } from 'react'
import DecorativeOrb from './DecorativeOrb'

interface CheckInHeroProps {
  questionKey: string
  label: string
  children?: ReactNode
}

export default function CheckInHero({ label, children }: CheckInHeroProps) {
  return (
    <div className="px-5 pt-14 pb-4 relative overflow-hidden card-tint-lavender">
      <div className="absolute inset-0 glass-frosted pointer-events-none opacity-50" aria-hidden />
      <DecorativeOrb size={72} className="absolute -right-6 top-8 opacity-70 z-[1]" />
      <div className="relative z-10">{children}</div>
      <span className="sr-only">{label}</span>
    </div>
  )
}
