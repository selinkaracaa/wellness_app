import type { CoreMetric, GoalId } from '../data/habitPool'
import { HABIT_POOL } from '../data/habitPool'
import type { CheckInEntry } from '../context/AppContext'

export function curateMetricsForGoals(goals: GoalId[]): CoreMetric[] {
  const scored = HABIT_POOL.map((habit) => {
    const overlap = habit.goalTags.filter((g) => goals.includes(g)).length
    return { habit, score: overlap + Math.random() * 0.3 }
  })
    .sort((a, b) => b.score - a.score)

  const selected: CoreMetric[] = []
  const usedKeys = new Set<string>()

  for (const { habit } of scored) {
    if (selected.length >= 5) break
    if (!usedKeys.has(habit.key)) {
      selected.push(habit)
      usedKeys.add(habit.key)
    }
  }

  while (selected.length < 5) {
    const remaining = HABIT_POOL.filter((h) => !usedKeys.has(h.key))
    if (remaining.length === 0) break
    const pick = remaining[0]
    selected.push(pick)
    usedKeys.add(pick.key)
  }

  return selected
}

function avgForMetric(checkIns: CheckInEntry[], key: string): number | null {
  const values = checkIns.map((c) => c.answers[key]).filter((v) => v != null)
  if (values.length === 0) return null
  return values.reduce((s, v) => s + v, 0) / values.length
}

export interface RecalibrationResult {
  newMetrics: CoreMetric[]
  insight: string
  changedKeys: string[]
  swapped: { from: string; to: string }[]
}

export function recalibrateMetrics(
  currentMetrics: CoreMetric[],
  checkIns: CheckInEntry[],
  subjectiveScore: number,
  goals: GoalId[]
): RecalibrationResult {
  const weekCheckIns = checkIns.slice(-7)
  const objectiveAvg =
    weekCheckIns.length > 0
      ? Object.values(
          weekCheckIns.reduce(
            (acc, c) => {
              for (const [k, v] of Object.entries(c.answers)) {
                acc[k] = (acc[k] ?? 0) + v
                acc[`${k}_count`] = (acc[`${k}_count`] ?? 0) + 1
              }
              return acc
            },
            {} as Record<string, number>
          )
        ).length > 0
        ? currentMetrics.reduce((sum, m) => sum + (avgForMetric(weekCheckIns, m.key) ?? 3), 0) /
          currentMetrics.length
        : 3
      : 3

  const gap = subjectiveScore - objectiveAvg / 5 * 5
  const changedKeys: string[] = []
  const swapped: { from: string; to: string }[] = []
  const newMetrics = [...currentMetrics]

  if (gap > 1.5) {
    const underperformer = currentMetrics.reduce(
      (worst, m) => {
        const avg = avgForMetric(weekCheckIns, m.key) ?? 3
        return avg < (worst.avg ?? 5) ? { key: m.key, avg } : worst
      },
      { key: '', avg: 5 as number }
    )

    const pool = HABIT_POOL.filter(
      (h) => !currentMetrics.some((m) => m.key === h.key) && h.goalTags.some((g) => goals.includes(g))
    )
    if (pool.length > 0 && underperformer.key) {
      const replacement = pool[Math.floor(Math.random() * pool.length)]
      const idx = newMetrics.findIndex((m) => m.key === underperformer.key)
      if (idx !== -1) {
        newMetrics[idx] = replacement
        changedKeys.push(replacement.key)
        swapped.push({ from: underperformer.key, to: replacement.key })
      }
    }
  } else if (gap < -1) {
    const stagnant = currentMetrics.find((m) => {
      const avg = avgForMetric(weekCheckIns, m.key)
      return avg != null && avg >= 4
    })
    if (stagnant) {
      const harder = HABIT_POOL.find(
        (h) => h.key !== stagnant.key && h.goalTags.some((g) => goals.includes(g)) && !currentMetrics.some((m) => m.key === h.key)
      )
      if (harder) {
        const idx = newMetrics.findIndex((m) => m.key === stagnant.key)
        newMetrics[idx] = harder
        changedKeys.push(harder.key)
        swapped.push({ from: stagnant.key, to: harder.key })
      }
    }
  }

  let insight: string
  if (swapped.length > 0) {
    insight = `Your subjective feeling (${subjectiveScore}/5) and your logs diverged. We're swapping "${swapped[0].from}" for "${swapped[0].to}" to better match where you actually are.`
  } else if (subjectiveScore >= 4 && objectiveAvg >= 3.5) {
    insight = "Strong alignment between how you feel and what you logged. Keeping your current 5 metrics — they're working."
  } else if (subjectiveScore <= 2) {
    insight = "You rated yourself low on goal proximity. We've kept your metrics but recommend focusing on awareness, not perfection — logging a 1 still protects your streak."
  } else {
    insight = 'Your self-assessment and data are in sync. Small tweaks next week based on your patterns.'
  }

  return { newMetrics, insight, changedKeys, swapped }
}
