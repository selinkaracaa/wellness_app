export function wellnessScore(
  todayCheckedIn: boolean,
  todayAnswers: Record<string, number>,
  totalCategories: number
): number {
  const answered = Object.values(todayAnswers)
  if (todayCheckedIn && answered.length > 0) {
    const avg = answered.reduce((s, v) => s + v, 0) / answered.length
    return Math.round((avg / 5) * 100)
  }
  if (answered.length > 0) {
    return Math.round((answered.length / totalCategories) * 100)
  }
  return 0
}
