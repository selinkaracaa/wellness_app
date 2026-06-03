import type { ReactNode } from 'react'
import PhotoImage from './PhotoImage'

interface PhotoHeroProps {
  src: string
  alt: string
  height?: string
  children?: ReactNode
  compact?: boolean
}

export default function PhotoHero({ src, alt, height = 'h-48', children, compact }: PhotoHeroProps) {
  return (
    <div className={`relative ${compact ? 'h-36' : height} overflow-hidden rounded-b-[2rem]`}>
      <PhotoImage src={src} alt={alt} rounded="none" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-[#f6f5fa]" />
      {children && <div className="relative z-10 h-full">{children}</div>}
    </div>
  )
}
