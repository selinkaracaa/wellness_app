import { motion } from 'framer-motion'
import { categoryPillLabel } from '../../design/categoryTags'

interface MetricSliderProps {
  metricKey: string
  label: string
  index: number
  total: number
  value: number | null
  onChange: (value: number) => void
  readOnly?: boolean
}

export default function MetricSlider({
  metricKey,
  label,
  index,
  total,
  value,
  onChange,
  readOnly,
}: MetricSliderProps) {
  const fill = value ? (value / 5) * 100 : 0

  if (readOnly && value != null) {
    return (
      <div className="card-premium rounded-[1.25rem] p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <p className="label-caps mb-1">
              {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
            </p>
            <p className="text-[15px] font-semibold text-ink">{categoryPillLabel(metricKey)}</p>
          </div>
          <span className="font-display text-3xl text-ink tabular-nums leading-none">{value}</span>
        </div>
        <div className="h-1.5 rounded-full bg-line overflow-hidden">
          <motion.div
            className="h-full rounded-full metric-fill"
            initial={{ width: 0 }}
            animate={{ width: `${fill}%` }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="card-premium rounded-[1.25rem] p-5">
      <div className="flex items-start justify-between gap-3 mb-5">
        <div>
          <p className="label-caps mb-1">
            {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
          </p>
          <p className="text-[15px] font-semibold text-ink">{categoryPillLabel(metricKey)}</p>
          <p className="text-[11px] text-muted mt-1 line-clamp-1">{label}</p>
        </div>
        <span
          className={`font-display text-3xl tabular-nums leading-none transition-colors duration-300 ${
            value ? 'text-ink' : 'text-muted/30'
          }`}
        >
          {value ?? '·'}
        </span>
      </div>

      <div className="relative">
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 rounded-full bg-line overflow-hidden pointer-events-none">
          <div className="h-full metric-fill rounded-full transition-all duration-300" style={{ width: `${fill}%` }} />
        </div>
        <input
          type="range"
          min={1}
          max={5}
          step={1}
          value={value ?? 3}
          onChange={(e) => onChange(Number(e.target.value))}
          className="metric-slider w-full relative z-10"
          aria-label={label}
        />
        <div className="flex justify-between mt-4">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onChange(n)}
              className={`w-8 h-8 rounded-full text-[11px] font-bold transition-all duration-200 tap-scale ${
                value === n
                  ? 'bg-ink text-white shadow-sm'
                  : 'text-muted/70 hover:text-ink hover:bg-sage-light/60'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
