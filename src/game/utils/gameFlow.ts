export function isPass(accuracy: number): boolean {
  return accuracy >= 0.8
}

export function nextLevel(currentLevel: number, pass: boolean): number {
  return pass ? currentLevel + 1 : currentLevel
}

export function resultPrimaryActionLabel(pass: boolean): string {
  return pass ? '下一局' : '再来一局'
}
