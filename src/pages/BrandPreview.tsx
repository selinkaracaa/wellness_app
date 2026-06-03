import { Link } from 'react-router-dom'
import { ChevronLeft, Home, Zap, Users, Trophy, User, Flame, ChevronRight } from 'lucide-react'
import GlassCard from '../components/ui/GlassCard'
import DecorativeOrb from '../components/ui/DecorativeOrb'
import WellnessScoreRing from '../components/ui/WellnessScoreRing'
import { QuestionSymbol } from '../components/ui/OptionSymbol'
import { CHECK_IN_QUESTIONS, BADGES } from '../data/mockData'
import BadgeIcon from '../components/ui/BadgeIcon'

const SWATCHES = [
  { name: 'Ink', token: 'ink', class: 'bg-ink', text: 'text-white' },
  { name: 'Cream', token: 'cream', class: 'bg-cream', text: 'text-ink' },
  { name: 'Sage', token: 'sage', class: 'bg-sage', text: 'text-white' },
  { name: 'Sage light', token: 'sage-light', class: 'bg-sage-light', text: 'text-ink' },
  { name: 'Sand', token: 'sand', class: 'bg-sand', text: 'text-ink' },
  { name: 'Peach', token: 'peach', class: 'bg-peach', text: 'text-ink' },
  { name: 'Lime', token: 'lime', class: 'bg-lime', text: 'text-ink' },
  { name: 'Lavender', token: 'lavender', class: 'bg-lavender', text: 'text-ink' },
  { name: 'Mint', token: 'mint', class: 'bg-mint', text: 'text-ink' },
  { name: 'Sky', token: 'sky', class: 'bg-sky', text: 'text-ink' },
  { name: 'Purple', token: 'purple', class: 'bg-purple', text: 'text-white' },
  { name: 'Muted', token: 'muted', class: 'bg-muted', text: 'text-white' },
] as const

const PILLARS = [
  { title: 'Mindwell', subtitle: 'Structure', desc: 'Sage, cream, score ring, calm tags' },
  { title: 'travelmate', subtitle: 'Energy', desc: 'Lime CTAs on warm neutrals' },
  { title: 'C.Lab', subtitle: 'Glass', desc: 'Frosted heroes, peach glow' },
]

const CATEGORY_TAGS = ['Focus', 'Relax', 'Energy', 'Mood', 'Sleep']

export default function BrandPreview() {
  return (
    <div className="min-h-screen page-canvas max-w-md mx-auto">
      <header className="sticky top-0 z-40 px-5 pt-12 pb-4 bg-cream/80 backdrop-blur-md border-b border-black/5">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-link tap-scale mb-4">
          <ChevronLeft size={18} />
          Back to app
        </Link>
        <h1 className="text-2xl font-bold text-ink">Bloom brand</h1>
        <p className="text-sm text-muted mt-1 font-medium">Living style guide — scroll to explore</p>
      </header>

      <div className="px-5 pb-12 space-y-10">
        <section>
          <p className="label-caps mb-3">North star</p>
          <div className="space-y-2">
            {PILLARS.map((p) => (
              <GlassCard key={p.title} className="card-tint-white p-4 flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-sage-light flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-sage">{p.subtitle[0]}</span>
                </div>
                <div>
                  <p className="font-bold text-ink">{p.title}</p>
                  <p className="text-xs text-purple font-semibold">{p.subtitle}</p>
                  <p className="text-xs text-muted mt-1">{p.desc}</p>
                </div>
              </GlassCard>
            ))}
          </div>
          <p className="text-xs text-muted mt-4 italic leading-relaxed">
            Quiet ritual, measured progress · Grounded days, bright moments · Soft light, clear intention
          </p>
        </section>

        <section>
          <p className="label-caps mb-3">Colors</p>
          <div className="grid grid-cols-3 gap-2">
            {SWATCHES.map((s) => (
              <div key={s.token} className={`${s.class} ${s.text} rounded-2xl p-3 card-float min-h-[72px] flex flex-col justify-end`}>
                <p className="text-xs font-bold leading-tight">{s.name}</p>
                <p className="text-[9px] opacity-70 font-mono mt-0.5">{s.token}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted mt-3">
            <span className="font-bold text-lime">Lime</span> = primary actions only.{' '}
            <span className="font-bold text-purple">Purple</span> = celebration heroes only.
          </p>
        </section>

        <section>
          <p className="label-caps mb-3">Typography</p>
          <GlassCard className="card-tint-white p-5 space-y-4">
            <p className="text-[1.65rem] font-bold text-ink leading-tight">Good morning, Alex</p>
            <p className="text-lg font-bold text-ink">Section title</p>
            <p className="text-sm font-medium text-muted">Body and metadata — DM Sans 500/600</p>
            <p className="label-caps">Caps label</p>
            <div className="flex items-baseline gap-2 pt-2">
              <span className="text-5xl font-bold text-ink">04</span>
              <span className="text-3xl font-bold text-muted/40">/</span>
              <span className="text-4xl font-bold text-muted/40">06</span>
              <span className="text-sm text-muted pb-1">hero numbers</span>
            </div>
          </GlassCard>
        </section>

        <section>
          <p className="label-caps mb-3">Buttons</p>
          <div className="space-y-3">
            <button type="button" className="btn-dark w-full py-3.5">
              Primary — btn-dark
            </button>
            <button type="button" className="btn-lime w-full py-3.5">
              Action — btn-lime
            </button>
            <div className="card-tint-lavender rounded-2xl p-4 card-float">
              <button type="button" className="w-full bg-white rounded-2xl py-3.5 px-4 flex items-center justify-between font-bold text-ink text-sm">
                Hero CTA strip
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </section>

        <section>
          <p className="label-caps mb-3">Card tints</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { c: 'card-tint-sage', l: 'Sage' },
              { c: 'card-tint-peach', l: 'Peach' },
              { c: 'card-tint-mint', l: 'Mint' },
              { c: 'card-tint-sky', l: 'Sky' },
              { c: 'card-tint-lavender', l: 'Lavender' },
              { c: 'card-tint-white', l: 'White' },
            ].map(({ c, l }) => (
              <div key={l} className={`${c} rounded-2xl p-4 card-float`}>
                <p className="text-sm font-bold text-ink">{l}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <p className="label-caps mb-3">Home hero (lavender + orb)</p>
          <GlassCard className="card-tint-lavender p-5 relative overflow-hidden">
            <div className="relative z-10 pr-20">
              <p className="text-sm font-bold text-ink/80">Daily check-in</p>
              <h2 className="text-xl font-bold text-ink mt-1">How are you today?</h2>
            </div>
            <DecorativeOrb size={88} className="absolute -right-2 top-3" />
            <button type="button" className="relative z-10 w-full mt-4 bg-white rounded-2xl py-3.5 px-4 flex items-center justify-between font-bold text-ink text-sm">
              Start today&apos;s session
              <ChevronRight size={18} />
            </button>
          </GlassCard>
        </section>

        <section>
          <p className="label-caps mb-3">Glass frost (C.Lab layer)</p>
          <div className="relative rounded-3xl overflow-hidden h-44 card-float">
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(135deg, #ffe0cc 0%, #ede8ff 50%, #e8efe6 100%)',
              }}
            />
            <div className="absolute inset-4 glass-frosted rounded-2xl p-5 flex flex-col justify-between">
              <p className="text-lg font-bold text-ink">Frosted card</p>
              <p className="text-xs text-muted">backdrop-blur + warm tint</p>
              <button type="button" className="btn-dark self-start px-5 py-2.5 text-xs">
                Join in
              </button>
            </div>
          </div>
        </section>

        <section>
          <p className="label-caps mb-3">Celebration hero</p>
          <GlassCard className="gradient-hero-purple p-5 text-white relative overflow-hidden">
            <p className="text-sm font-semibold text-white/85">Check-in complete</p>
            <p className="text-2xl font-bold mt-1">Streak protected</p>
            <DecorativeOrb size={72} className="absolute -right-4 top-2 opacity-75" />
          </GlassCard>
        </section>

        <section>
          <p className="label-caps mb-3">Wellness score (Mindwell)</p>
          <GlassCard className="card-tint-sage p-6 flex items-center gap-6">
            <WellnessScoreRing value={73} />
            <div>
              <p className="text-sm font-bold text-ink">Daily wellness score</p>
              <p className="text-xs text-muted mt-1">Sage ring — not lime</p>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {CATEGORY_TAGS.map((tag) => (
                  <span key={tag} className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/80 text-ink">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </GlassCard>
        </section>

        <section>
          <p className="label-caps mb-3">Progress & stats</p>
          <div className="h-2 rounded-full bg-white card-float overflow-hidden mb-4">
            <div className="h-full w-[68%] gradient-xp rounded-full" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <GlassCard className="card-tint-peach p-3">
              <div className="w-9 h-9 rounded-xl gradient-streak flex items-center justify-center mb-2">
                <Flame size={18} className="text-white" fill="white" />
              </div>
              <p className="text-2xl font-bold text-ink">12</p>
              <p className="text-[10px] font-semibold text-muted">Streak</p>
            </GlassCard>
            <GlassCard className="card-tint-sky p-3">
              <p className="text-2xl font-bold text-ink">48</p>
              <p className="text-[10px] font-semibold text-muted">Check-ins</p>
            </GlassCard>
            <GlassCard className="card-tint-mint p-3">
              <p className="text-2xl font-bold text-ink">780</p>
              <p className="text-[10px] font-semibold text-muted">XP</p>
            </GlassCard>
          </div>
        </section>

        <section>
          <p className="label-caps mb-3">Week pills</p>
          <div className="flex gap-2">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((label, i) => (
              <div
                key={i}
                className={`shrink-0 w-11 h-[4.5rem] rounded-full flex flex-col items-center justify-center ${
                  i === 6 ? 'bg-ink text-white' : i < 5 ? 'bg-ink text-white' : 'card-tint-white text-muted'
                }`}
              >
                <span className="text-sm font-bold">{10 + i}</span>
                <span className="text-[10px] opacity-80">{label}</span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <p className="label-caps mb-3">Badges</p>
          <div className="grid grid-cols-3 gap-3">
            {BADGES.slice(0, 6).map((badge) => (
              <div key={badge.id} className="text-center">
                <BadgeIcon badge={badge} size="sm" />
                <p className="text-[9px] font-bold text-ink mt-1.5">{badge.name}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <p className="label-caps mb-3">Category symbols</p>
          <div className="flex gap-3 flex-wrap">
            {CHECK_IN_QUESTIONS.map((q) => (
              <div key={q.key} className="flex flex-col items-center gap-1">
                <QuestionSymbol questionKey={q.key} size="md" />
                <span className="text-[9px] font-semibold text-muted capitalize">{q.key}</span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <p className="label-caps mb-3">Floating nav</p>
          <div className="flex justify-center py-4">
            <div className="bg-ink rounded-full flex items-center justify-around px-3 py-3 card-float max-w-[280px] w-full">
              {[Home, Zap, Users, Trophy, User].map((Icon, i) => (
                <div
                  key={i}
                  className={`w-11 h-11 rounded-full flex items-center justify-center ${
                    i === 0 ? 'bg-white text-ink' : 'text-white/70'
                  }`}
                >
                  <Icon size={20} strokeWidth={i === 0 ? 2.2 : 1.8} />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="pb-8">
          <p className="label-caps mb-3">Full doc</p>
          <p className="text-sm text-muted leading-relaxed">
            Markdown reference: <code className="text-xs bg-white px-1.5 py-0.5 rounded font-mono">docs/BRAND.md</code>
          </p>
        </section>
      </div>
    </div>
  )
}
