import { categoryPillLabel } from '../../design/categoryTags'

interface CategoryPillsProps {
  keys: string[]
  activeKey?: string
  className?: string
}

export default function CategoryPills({ keys, activeKey, className = '' }: CategoryPillsProps) {
  return (
    <div className={`flex gap-2 overflow-x-auto scrollbar-hide pb-0.5 ${className}`}>
      {keys.map((key) => (
        <span
          key={key}
          className={`shrink-0 text-[11px] font-bold px-3 py-1.5 rounded-full ${
            activeKey === key ? 'bg-ink text-white' : 'bg-white/90 text-ink card-float'
          }`}
        >
          {categoryPillLabel(key)}
        </span>
      ))}
    </div>
  )
}
