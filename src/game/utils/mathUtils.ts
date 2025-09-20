export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function choose<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function sampleByWeights(weights: Record<string, number>): string {
  const entries = Object.entries(weights)
  const total = entries.reduce((s, [, w]) => s + Math.max(0, w), 0)
  if (total <= 0) return entries[0]?.[0] ?? 'plus'
  let r = Math.random() * total
  for (const [k, w] of entries) {
    r -= Math.max(0, w)
    if (r <= 0) return k
  }
  return entries[entries.length - 1][0]
}

export function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n))
}
