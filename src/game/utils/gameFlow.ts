export function isPass(accuracy: number): boolean {
  return accuracy >= 0.8
}

export function nextLevel(currentLevel: number, pass: boolean): number {
  return pass ? currentLevel + 1 : currentLevel
}

export function resultPrimaryActionLabel(pass: boolean, t: (key: string) => string): string {
  return pass ? t('ui.next_case') : t('ui.retry_case')
}
