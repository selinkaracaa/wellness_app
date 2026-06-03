# Bloom — Brand sheet

Bloom is a daily wellness check-in app with gamification (XP, levels, streaks, badges, challenges, social). Visual design only — logic stays unchanged.

**North star:** Mindwell structure + travelmate/tennis color energy + Cannabis Lab / desert glass on hero moments.

| Pillar | Reference | Role in Bloom |
|--------|-----------|---------------|
| **Structure** | Mindwell Session | Sage/cream base, pill tags, score ring, calm spacing |
| **Energy** | travelmate, tennis reservation | Lime on warm neutrals, photo tiles, floating dark nav |
| **Luxury peaks** | Cannabis Lab, desert glass login | Frosted heroes, peach/sand glows, black pill CTAs |

**Taglines (internal):** *Quiet ritual, measured progress.* · *Grounded days, bright moments.* · *Soft light, clear intention.*

---

## Color

### Core (always on)

| Token | Hex | CSS variable | Use |
|-------|-----|--------------|-----|
| Ink | `#121212` | `--color-ink` | Nav bar, active week pill, primary buttons, headings |
| Ink soft | `#3D3D3D` | `--color-ink-soft` | Secondary icons, de-emphasized UI |
| Cream | `#F6F5FA` | `--color-cream` | Page canvas, body background |
| Surface | `#FFFFFF` | `--color-surface` | Cards, inputs, option rows |
| Muted | `#8E8C98` | `--color-muted` | Captions, metadata, labels |

### Earth & wellness (Mindwell — default UI)

| Token | Hex | CSS variable | Use |
|-------|-----|--------------|-----|
| Sage | `#8FA88A` | `--color-sage` | Wellness score ring, category pills, calm accents |
| Sage light | `#E8EFE6` | `--color-sage-light` | Tinted stat cards, tags |
| Sand | `#E8E0D4` | `--color-sand` | Warm dividers, secondary tints |
| Peach | `#FFEFE3` | `--color-peach` | Warm cards (streak, friends strip) |
| Peach deep | `#FFE0CC` | `--color-peach-deep` | Glow layers in `page-canvas` |

### Sporty energy (travelmate / tennis — sparingly)

| Token | Hex | CSS variable | Use |
|-------|-----|--------------|-----|
| Lime | `#C8F135` | `--color-lime` | **Only** primary actions: check-in CTA, join challenge, active highlights, XP bar |
| Streak gradient | `#FF9A56` → `#FF6B35` | `.gradient-streak` | Streak icon backgrounds |

**Rule:** Lime = “do this now.” If everything is lime, nothing is.

### Soft accents (cards & variety)

| Token | Hex | CSS variable | Use |
|-------|-----|--------------|-----|
| Lavender | `#EDE8FF` | `--color-lavender` | Check-in hero, calm feature cards |
| Mint | `#E8F9D4` | `--color-mint` | XP / growth stat tiles |
| Sky | `#DCEEFF` | `--color-sky` | Progress / secondary stats (use lightly) |

### Hero & celebration (glass layer)

| Token | Hex | CSS variable | Use |
|-------|-----|--------------|-----|
| Purple | `#6B5CE8` | `--color-purple` | Complete state, challenge rank card — **not** default chrome |
| Hero gradient | `.gradient-hero-purple` | Check-in done, challenge header |
| Glass orb | `.glass-orb` | Daily check-in card, profile header |

### Avoid

- **Blue-heavy** palettes as the default (sky is accent only).
- Saturated multi-color grids (abc Learning) on every screen.
- Dark-mode-neon (veri / Pillar) as the default daily experience.

---

## Typography

| Role | Font | Weight | Size (mobile) |
|------|------|--------|----------------|
| Display / greeting | DM Sans | 700 | 26–28px (`text-[1.65rem]` – `text-3xl`) |
| Section title | DM Sans | 700 | 18px (`text-lg`) |
| Body | DM Sans | 500–600 | 14px (`text-sm`) |
| Caption / label | DM Sans | 600 | 10–11px; caps labels use `.label-caps` |
| Hero numbers | DM Sans | 700 | 40–48px (`text-4xl`–`text-5xl`) for streak, XP, category count |

No emojis in UI. Use **Lucide** line icons and **OptionSymbol** / **QuestionSymbol** for check-in categories.

---

## Shape & space

| Element | Value |
|---------|--------|
| Card radius | `1.5rem` (24px) — `.card-float` |
| Pill buttons / nav | `9999px` (full round) |
| Card shadow | `0 12px 40px rgba(18,18,18,0.08)` |
| Page padding | `px-5` (20px) horizontal |
| Section gap | `space-y-5` / `space-y-6` |
| Bottom safe area | `.safe-bottom` + `pb-32` above floating nav |

Generous whitespace reads as premium; don’t fill every gap with another card.

---

## Components

### Navigation

- **Floating black pill** (`bg-ink`, max-width ~280px), centered above safe area.
- Active tab: **white circle** behind icon; inactive: white/70 icon on ink.

### Buttons

| Class | When |
|-------|------|
| `.btn-dark` | Primary actions (continue, join, submit) |
| `.btn-lime` | Highest-priority single CTA when you need extra energy |
| White inset row | Secondary hero CTA (“Start today’s session”) |

### Cards

| Class | When |
|-------|------|
| `.card-tint-white` | Lists, friends, neutral content |
| `.card-tint-peach` / `.mint` / `.sky` / `.lavender` | Stat grid, social strips — rotate tints, don’t stack all on one screen |
| `.card-tint-sage-light` | Mindwell-aligned wellness tags (future) |
| `.gradient-hero-purple` | Completion / rank moments only |

### Progress

- **XP:** `.gradient-xp` on a thin rounded track (lime → green).
- **Wellness score (target):** thin **sage** ring, single number inside (Mindwell).
- **Streak:** peach card + `.gradient-streak` icon chip.

### Imagery

- **Heroes:** `public/images/hero-*.png` + Unsplash via `src/design/images.ts`.
- **Category photos:** reserved for large editorial moments only (not small list thumbnails).
- **Challenges:** `ChallengeIcon` — category symbol on a pastel tile (same language as badges/check-in).
- **Avatars:** circular, consistent sizes via `UserAvatar`.

---

## Screen patterns

### Home

1. Header: menu · points pill · bell · avatar  
2. Greeting + **01/06**-style category counter  
3. XP bar (lime)  
4. **Lavender check-in hero** + glass orb + white CTA strip  
5. Three **tinted stat cards** (streak / check-ins / XP)  
6. **Week pills** (ink = done/today)  
7. Friends list  

No duplicate “wellness log” blocks — detail lives on Profile.

### Check-in

- Lavender hero header + orb  
- White option cards; selected = ink fill  
- Complete: purple hero card + symbol grid  

### Profile / Social / Challenges

- Same canvas (`.page-canvas`), tinted cards, purple only for highlights  
- Challenges: purple rank card; discover cards use pastel rotation  

---

## Voice & content

- Warm, direct, second person (“How are you today?”).  
- Short labels; avoid clinical jargon.  
- Gamification copy is encouraging, not aggressive (“Streak protected”, not “DON’T BREAK IT”).  

---

## Status

Product UI is aligned with this sheet:

- **Sage** for wellness ring, links, accents; **lime** for primary CTAs and XP bar only.
- **Purple** limited to celebration cards (check-in complete, challenge rank).
- **Frosted glass** on check-in heroes; **category pills** on Home.
- **Badges** and **challenges** use symbol tiles (not stock photo thumbnails).
- **`/brand`** — live style guide; keep in sync when tokens change.

---

## See it in the app

Open **`/brand`** in the dev server (living style guide: colors, type, buttons, heroes, nav).  
From Profile, tap **View brand guide**.

---

## Implementation map

| File | Purpose |
|------|---------|
| `src/pages/BrandPreview.tsx` | Visual brand guide at `/brand` |
| `src/index.css` | Tokens (`@theme`), utilities (canvas, cards, glass, buttons) |
| `src/design/images.ts` | Image URLs and category mapping |
| `src/components/ui/OptionSymbol.tsx` | Category symbols (no emojis) |
| `src/components/Navigation.tsx` | Floating ink nav |
| `docs/BRAND.md` | This sheet — update when palette shifts |

### CSS utilities (quick reference)

```
.page-canvas          Warm multi-radial background
.card-float           Rounded card + shadow
.card-tint-*          peach | mint | sky | lavender | white | sage-light
.glass-orb            Hero decorative sphere
.gradient-xp          XP progress fill
.gradient-streak       Streak chip
.gradient-hero-purple  Celebration cards
.btn-dark / .btn-lime  Primary CTAs
.label-caps            Uppercase micro labels
```

---

## Implemented (June 2026)

- [x] Wellness score ring on Home + Profile (`WellnessScoreRing`, `wellnessScore()`)
- [x] Category pill tags (`CategoryPills`, `categoryTags.ts`)
- [x] Frosted glass on check-in heroes (`glass-frosted`, `CheckInHero`, `DailyCheckInCard`)
- [x] Sage-forward accents; purple reserved for celebration heroes
- [x] Lime CTAs: start check-in, join challenge, try friend question

---

*Last updated: June 2026 — aligned with current `src/index.css` and reference board.*
