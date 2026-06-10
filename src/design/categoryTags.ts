/** Mindwell-style pill labels for check-in categories */
export const CATEGORY_PILL_LABELS: Record<string, string> = {
  water: 'Hydration',
  activity: 'Energy',
  nutrition: 'Fuel',
  sleep: 'Sleep',
  screen: 'Focus',
  mood: 'Mood',
  steps: 'Steps',
  protein: 'Protein',
  greens: 'Greens',
  sports: 'Movement',
  mindfulness: 'Mindful',
  recovery: 'Recovery',
}

export function categoryPillLabel(key: string): string {
  return CATEGORY_PILL_LABELS[key] ?? key
}
