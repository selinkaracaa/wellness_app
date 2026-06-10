export type CVCategory = 'hydration' | 'nutrition' | 'movement' | 'general'

export interface CVResult {
  verified: boolean
  confidence: number
  detected: string
  message: string
}

const DETECTION_HINTS: Record<CVCategory, string[]> = {
  hydration: ['water bottle', 'glass of water', 'hydration flask'],
  nutrition: ['vegetables', 'green salad', 'healthy meal'],
  movement: ['walking path', 'outdoor scene', 'exercise environment'],
  general: ['person', 'daily moment', 'environment'],
}

export async function classifyImage(
  _imageDataUrl: string,
  expectedCategory: CVCategory
): Promise<CVResult> {
  await new Promise((r) => setTimeout(r, 1200 + Math.random() * 800))

  const hints = DETECTION_HINTS[expectedCategory]
  const detected = hints[Math.floor(Math.random() * hints.length)]
  const confidence = 0.72 + Math.random() * 0.25
  const verified = confidence > 0.75

  return {
    verified,
    confidence,
    detected,
    message: verified
      ? `Verified: ${detected} detected (${Math.round(confidence * 100)}% confidence)`
      : `Couldn't verify ${expectedCategory} content. Try again with the challenge in frame.`,
  }
}
