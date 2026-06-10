interface PageHeaderProps {
  title: string
  subtitle?: string
  kicker?: string
}

export default function PageHeader({ title, subtitle, kicker }: PageHeaderProps) {
  return (
    <header className="px-5 pt-12 pb-1">
      <div className="flex items-center justify-between mb-8">
        <span className="font-display text-[1.35rem] tracking-tight text-ink">Cycles</span>
        <span className="label-caps">Mindful assessment</span>
      </div>
      {kicker && <p className="label-caps mb-2">{kicker}</p>}
      <h1 className="font-display text-[1.75rem] leading-[1.15] text-ink tracking-tight">{title}</h1>
      {subtitle && <p className="text-sm text-muted mt-2 leading-relaxed max-w-[28ch]">{subtitle}</p>}
    </header>
  )
}
