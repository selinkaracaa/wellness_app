import type { LucideIcon } from 'lucide-react'
import {
  Footprints,
  Droplets,
  Flame,
  Users,
  Moon,
  Salad,
  Smartphone,
  Zap,
  Star,
  Award,
} from 'lucide-react'
import type { Badge } from '../../data/mockData'

const BADGE_ICONS: Record<string, LucideIcon> = {
  b1: Footprints,
  b2: Droplets,
  b3: Flame,
  b4: Users,
  b5: Moon,
  b6: Salad,
  b7: Smartphone,
  b8: Zap,
  b9: Star,
}

const RARITY_STYLES: Record<Badge['rarity'], { bg: string; icon: string }> = {
  common: { bg: 'bg-sage-light', icon: 'text-sage' },
  rare: { bg: 'bg-sky', icon: 'text-ink-soft' },
  epic: { bg: 'bg-lavender', icon: 'text-purple' },
  legendary: { bg: 'bg-lime/40', icon: 'text-ink' },
}

interface BadgeIconProps {
  badge: Badge
  size?: 'sm' | 'md'
  className?: string
}

export default function BadgeIcon({ badge, size = 'md', className = '' }: BadgeIconProps) {
  const Icon = BADGE_ICONS[badge.id] ?? Award
  const style = RARITY_STYLES[badge.rarity]
  const dim = size === 'sm' ? 'w-full h-full min-h-[52px]' : 'w-full aspect-square'
  const iconSize = size === 'sm' ? 22 : 28

  return (
    <div
      className={`${dim} ${style.bg} rounded-xl flex items-center justify-center ${className}`}
      title={badge.description}
    >
      <Icon size={iconSize} className={style.icon} strokeWidth={2} aria-hidden />
    </div>
  )
}
