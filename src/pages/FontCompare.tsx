import { Link } from 'react-router-dom'

const samples = {
  wordmark: 'Cycles',
  title: 'Rate your evening',
  subtitle: 'Five honest self-ratings. A streak of 1s still counts.',
  number: '14',
  label: 'Awareness streak',
  metric: 'Hydration',
  body: 'Consistency of awareness — not your scores — keeps you on track.',
}

function SampleCard({
  name,
  description,
  wordmarkClass,
  titleClass,
  numberClass,
  bodyClass,
  recommended,
}: {
  name: string
  description: string
  wordmarkClass: string
  titleClass: string
  numberClass: string
  bodyClass: string
  recommended?: boolean
}) {
  return (
    <div className="card-premium rounded-[1.5rem] p-5 flex flex-col">
      <div className="flex items-start justify-between gap-2 mb-4">
        <div>
          <p className="text-sm font-bold text-ink">{name}</p>
          <p className="text-xs text-muted mt-1 leading-relaxed">{description}</p>
        </div>
        {recommended && (
          <span className="shrink-0 text-[9px] font-bold uppercase tracking-wider text-sage bg-sage-light px-2 py-1 rounded-full">
            Current
          </span>
        )}
      </div>

      <p className={`${wordmarkClass} text-[1.35rem] text-ink`}>{samples.wordmark}</p>

      <p className={`${titleClass} text-[1.5rem] text-ink mt-5 leading-tight`}>{samples.title}</p>
      <p className={`${bodyClass} text-sm text-muted mt-2`}>{samples.subtitle}</p>

      <div className="mt-6 pt-5 border-t border-black/5">
        <p className={`${bodyClass} label-caps mb-1`}>{samples.label}</p>
        <p className={`${numberClass} text-5xl text-ink tabular-nums leading-none`}>{samples.number}</p>
      </div>

      <div className="mt-5 flex items-center justify-between card-tint-sage rounded-xl px-4 py-3">
        <span className={`${bodyClass} text-sm font-semibold text-ink`}>{samples.metric}</span>
        <span className={`${numberClass} text-2xl text-ink tabular-nums`}>4</span>
      </div>

      <p className={`${bodyClass} text-xs text-muted mt-4 leading-relaxed`}>{samples.body}</p>
    </div>
  )
}

export default function FontCompare() {
  return (
    <div className="min-h-screen page-canvas pb-10">
      <div className="px-5 pt-12">
        <Link to="/" className="text-xs font-semibold text-link tap-scale">
          Back to app
        </Link>
        <h1 className="font-display text-[1.5rem] text-ink mt-4 tracking-tight">Title fonts</h1>
        <p className="text-sm text-muted mt-2 max-w-md leading-relaxed">
          Same UI copy, three approaches. Body text stays DM Sans in all options — only titles and numbers change.
        </p>
      </div>

      <div className="px-5 mt-8 space-y-5">
        <SampleCard
          name="Sora + DM Sans"
          description="Geometric display sans. Modern, product-native — what the app uses now."
          wordmarkClass="font-display"
          titleClass="font-display"
          numberClass="font-display"
          bodyClass="font-body"
          recommended
        />

        <SampleCard
          name="DM Sans only"
          description="One font family. Minimal, Oura/Apple-like. Titles use heavier weight, no second typeface."
          wordmarkClass="font-title-sans"
          titleClass="font-title-sans"
          numberClass="font-title-sans"
          bodyClass="font-body"
        />

        <SampleCard
          name="Instrument Serif + DM Sans"
          description="Editorial serif for titles. More literary and distinctive — the previous direction."
          wordmarkClass="font-title-serif"
          titleClass="font-title-serif"
          numberClass="font-title-serif"
          bodyClass="font-body"
        />
      </div>

      <p className="px-5 text-[11px] text-muted mt-8 text-center leading-relaxed">
        Tell me which option you prefer and I&apos;ll apply it across the app.
      </p>
    </div>
  )
}
