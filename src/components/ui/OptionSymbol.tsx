import { useId, type ReactNode } from 'react'

const SIZES = { sm: 36, md: 48, lg: 64 }

interface OptionSymbolProps {
  questionKey: string
  value: number
  size?: keyof typeof SIZES
  className?: string
  /** No card shadow — for embedding in tinted tiles (challenges, etc.) */
  bare?: boolean
}

const waterFill = ['#F5F2ED', '#E8E2D9', '#D4C9B8', '#A69076', '#6B5D4F']

function WaterSymbol({ value, px }: { value: number; px: number }) {
  const clipId = useId()
  const fill = waterFill[value - 1]
  const level = value * 20
  return (
    <svg width={px} height={px} viewBox="0 0 48 48" fill="none" aria-hidden>
      <path
        d="M24 6C24 6 10 22 10 30a14 14 0 0 0 28 0c0-8-14-24-14-24z"
        fill="#FAFAF8"
        stroke="#E8E2D9"
        strokeWidth="1"
      />
      <clipPath id={clipId}>
        <rect x="8" y={48 - level * 0.42} width="32" height="40" />
      </clipPath>
      <path d="M24 6C24 6 10 22 10 30a14 14 0 0 0 28 0c0-8-14-24-14-24z" fill={fill} clipPath={`url(#${clipId})`} />
    </svg>
  )
}

function ActivitySymbol({ value, px }: { value: number; px: number }) {
  const heights = [6, 12, 18, 26, 34]
  return (
    <svg width={px} height={px} viewBox="0 0 48 48" fill="none" aria-hidden>
      {[0, 1, 2, 3, 4].map((i) => (
        <rect
          key={i}
          x={10 + i * 7}
          y={40 - heights[i]}
          width="4"
          height={heights[i]}
          rx="1"
          fill={i < value ? '#8B7355' : '#EBE8E3'}
        />
      ))}
    </svg>
  )
}

function NutritionSymbol({ value, px }: { value: number; px: number }) {
  return (
    <svg width={px} height={px} viewBox="0 0 48 48" fill="none" aria-hidden>
      <circle cx="24" cy="26" r="13" stroke="#EBE8E3" strokeWidth="1" fill="none" />
      {Array.from({ length: value }).map((_, i) => {
        const a = (i / 5) * Math.PI * 2 - Math.PI / 2
        return <circle key={i} cx={24 + Math.cos(a) * 8} cy={26 + Math.sin(a) * 8} r="2.5" fill="#8B7355" />
      })}
    </svg>
  )
}

function SleepSymbol({ value, px }: { value: number; px: number }) {
  const fills = ['#EBE8E3', '#D4C9B8', '#B5A99C', '#8B7355', '#4A4844']
  return (
    <svg width={px} height={px} viewBox="0 0 48 48" fill="none" aria-hidden>
      <path d="M32 10a12 12 0 1 1-16 16 14 14 0 0 0 16-16z" fill={fills[value - 1]} />
    </svg>
  )
}

function ScreenSymbol({ value, px }: { value: number; px: number }) {
  return (
    <svg width={px} height={px} viewBox="0 0 48 48" fill="none" aria-hidden>
      <rect x="15" y="10" width="18" height="28" rx="3" stroke="#C4B5A8" strokeWidth="1" fill="none" />
      {Array.from({ length: 5 - value + 1 }).map((_, i) => (
        <rect key={i} x="18" y={32 - i * 4} width="12" height="2" rx="0.5" fill="#8B7355" opacity={0.25 + i * 0.15} />
      ))}
    </svg>
  )
}

function MoodSymbol({ value, px }: { value: number; px: number }) {
  const curves = [
    'M15 28 Q24 33 33 28',
    'M15 28 Q24 31 33 28',
    'M15 27 L33 27',
    'M15 25 Q24 21 33 25',
    'M15 23 Q24 16 33 23',
  ]
  return (
    <svg width={px} height={px} viewBox="0 0 48 48" fill="none" aria-hidden>
      <circle cx="24" cy="24" r="17" stroke="#EBE8E3" strokeWidth="1" fill="none" />
      <circle cx="18" cy="21" r="1.5" fill="#4A4844" />
      <circle cx="30" cy="21" r="1.5" fill="#4A4844" />
      <path d={curves[value - 1]} stroke="#8B7355" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

const renderers: Record<string, (v: number, px: number) => ReactNode> = {
  water: (v, px) => <WaterSymbol value={v} px={px} />,
  activity: (v, px) => <ActivitySymbol value={v} px={px} />,
  nutrition: (v, px) => <NutritionSymbol value={v} px={px} />,
  sleep: (v, px) => <SleepSymbol value={v} px={px} />,
  screen: (v, px) => <ScreenSymbol value={v} px={px} />,
  mood: (v, px) => <MoodSymbol value={v} px={px} />,
}

export default function OptionSymbol({ questionKey, value, size = 'md', className = '', bare }: OptionSymbolProps) {
  const px = SIZES[size]
  const render = renderers[questionKey] ?? renderers.mood
  return (
    <div
      className={`flex items-center justify-center shrink-0 rounded-xl ${
        bare ? '' : 'card-tint-white card-float'
      } ${className}`}
      style={{ width: px, height: px }}
    >
      {render(value, px - 10)}
    </div>
  )
}

export function QuestionSymbol({
  questionKey,
  size = 'md',
  bare,
  className,
}: {
  questionKey: string
  size?: keyof typeof SIZES
  bare?: boolean
  className?: string
}) {
  return <OptionSymbol questionKey={questionKey} value={3} size={size} bare={bare} className={className} />
}

export const waterScaleColors = waterFill
