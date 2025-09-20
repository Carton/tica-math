export function gradeByAccuracy(accuracy: number, toolsUsed: number): 'S'|'A'|'B'|'C' {
  // 基础阈值
  let thresholds = { S: 0.9, A: 0.8, B: 0.65 }
  // 道具使用惩罚：每次轻微提高阈值
  const bump = toolsUsed >= 3 ? 0.07 : toolsUsed === 2 ? 0.04 : toolsUsed === 1 ? 0.02 : 0
  thresholds = { S: thresholds.S + bump, A: thresholds.A + bump, B: thresholds.B + bump }

  if (accuracy >= thresholds.S) return 'S'
  if (accuracy >= thresholds.A) return 'A'
  if (accuracy >= thresholds.B) return 'B'
  return 'C'
}
