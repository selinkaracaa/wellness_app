import { QuestionSymbol } from './OptionSymbol'

type ChallengeType = 'water' | 'steps' | 'sleep' | 'screen' | 'mindful' | 'nutrition'

/** Maps challenge types to check-in category symbols */
const TYPE_TO_CATEGORY: Record<ChallengeType, string> = {
  water: 'water',
  steps: 'activity',
  sleep: 'sleep',
  screen: 'screen',
  mindful: 'mood',
  nutrition: 'nutrition',
}

const TYPE_STYLES: Record<ChallengeType, string> = {
  water: 'bg-sky',
  steps: 'bg-peach',
  sleep: 'bg-lavender',
  screen: 'bg-sand',
  mindful: 'bg-sage-light',
  nutrition: 'bg-mint',
}

interface ChallengeIconProps {
  type: ChallengeType
  size?: 'md' | 'lg'
  className?: string
}

export default function ChallengeIcon({ type, size = 'md', className = '' }: ChallengeIconProps) {
  const categoryKey = TYPE_TO_CATEGORY[type]
  const dim = size === 'lg' ? 'w-14 h-14' : 'w-12 h-12'

  return (
    <div
      className={`${dim} ${TYPE_STYLES[type]} rounded-2xl flex items-center justify-center shrink-0 ${className}`}
      aria-hidden
    >
      <QuestionSymbol questionKey={categoryKey} size="sm" bare />
    </div>
  )
}
