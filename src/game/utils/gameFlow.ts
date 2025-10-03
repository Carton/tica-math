export function isPass(accuracy: number): boolean {
  return accuracy >= 0.8
}

export function nextLevel(currentLevel: number, pass: boolean): number {
  return pass ? currentLevel + 1 : currentLevel
}

export function resultPrimaryActionLabel(pass: boolean): string {
  // 这个函数需要访问 Strings 类，但由于是工具函数，我们需要在调用时传入
  // 为了保持向后兼容，暂时保留硬编码，建议在场景中直接使用 Strings.t()
  return pass ? '下个案件' : '重新分析此案件'
}
