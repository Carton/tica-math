import type { DigitDifficultyLevel, SkillTag, ExpressionConfig } from '@/game/utils/types'

type DigitLevelsFile = { version: string; digitDifficultyLevels: DigitDifficultyLevel[] }

function lerp(a: number, b: number, t: number) { return a + (b - a) * t }

function lerpBool(a: boolean, b: boolean, t: number) { return (a ? 1 : 0) + ((b ? 1 : 0) - (a ? 1 : 0)) * t >= 0.5 }

function lerpRecord<T extends Record<string, number>>(a: T, b: T, t: number): T {
  const result: Record<string, number> = {}
  for (const key in a) {
    if (a[key] !== undefined && b[key] !== undefined) {
      result[key] = lerp(a[key], b[key], t)
    }
  }
  return result as T
}

function lerpExpressionConfig(a: ExpressionConfig, b: ExpressionConfig, t: number): ExpressionConfig {
  return {
    twoTerms: {
      simple: lerpRecord(a.twoTerms.simple, b.twoTerms.simple, t)
    },
    threeTerms: {
      noParentheses: {
        plusMinus: lerp(a.threeTerms.noParentheses.plusMinus, b.threeTerms.noParentheses.plusMinus, t),
        withMul: lerp(a.threeTerms.noParentheses.withMul, b.threeTerms.noParentheses.withMul, t),
        withDiv: lerp(a.threeTerms.noParentheses.withDiv, b.threeTerms.noParentheses.withDiv, t)
      },
      withParentheses: {
        plusMinus: lerp(a.threeTerms.withParentheses?.plusMinus || 0, b.threeTerms.withParentheses?.plusMinus || 0, t),
        mul: lerp(a.threeTerms.withParentheses?.mul || 0, b.threeTerms.withParentheses?.mul || 0, t),
        div: lerp(a.threeTerms.withParentheses?.div || 0, b.threeTerms.withParentheses?.div || 0, t)
      }
    }
  }
}

export class DifficultyManager {
  private static digitLevels: DigitDifficultyLevel[] = []

  static init(data: DigitLevelsFile) {
    if (data.version !== '2.0') {
      throw new Error('Only version 2.0 digit difficulty configuration is supported')
    }
    this.digitLevels = [...data.digitDifficultyLevels].sort((x, y) => x.level - y.level)
  }

  static getDigitParams(level: number): DigitDifficultyLevel {
    if (this.digitLevels.length === 0) {
      throw new Error('Digit difficulty system not initialized. Please load digit-difficulty.json')
    }

    if (level <= this.digitLevels[0].level) return this.digitLevels[0]
    if (level >= this.digitLevels[this.digitLevels.length - 1].level) {
      return this.digitLevels[this.digitLevels.length - 1]
    }

    let low = this.digitLevels[0]
    let high = this.digitLevels[this.digitLevels.length - 1]

    for (let i = 0; i < this.digitLevels.length - 1; i++) {
      const a = this.digitLevels[i], b = this.digitLevels[i + 1]
      if (level >= a.level && level <= b.level) { low = a; high = b; break }
    }

    const t = (level - low.level) / (high.level - low.level)

    return {
      level,
      digitRange: {
        min: Math.round(lerp(low.digitRange.min, high.digitRange.min, t)),
        max: Math.round(lerp(low.digitRange.max, high.digitRange.max, t))
      },
      skills: lerpRecord(low.skills, high.skills, t),
      expressions: lerpExpressionConfig(low.expressions, high.expressions, t),
      allowNegative: lerpBool(low.allowNegative, high.allowNegative, t),
      allowFractions: lerpBool(low.allowFractions, high.allowFractions, t),
      timePerQuestionMs: Math.round(lerp(low.timePerQuestionMs, high.timePerQuestionMs, t)),
      minTimeMs: Math.round(lerp(low.minTimeMs, high.minTimeMs, t)),
      questionCount: Math.round(lerp(low.questionCount, high.questionCount, t))
    }
  }

  static getSkillWeights(digitDifficulty: number): Record<SkillTag, number> {
    const levels = this.digitLevels
    if (levels.length === 0) {
      throw new Error('Digit difficulty system not initialized')
    }

    // 找到适合这个数字难度的等级
    let targetLevel = levels[0]
    for (let i = 0; i < levels.length - 1; i++) {
      const current = levels[i]
      const next = levels[i + 1]
      if (digitDifficulty >= current.digitRange.min && digitDifficulty <= next.digitRange.max) {
        targetLevel = digitDifficulty <= (current.digitRange.max + next.digitRange.min) / 2 ? current : next
        break
      }
    }

    // 如果超过了所有等级，使用最高等级
    if (digitDifficulty > levels[levels.length - 1].digitRange.max) {
      targetLevel = levels[levels.length - 1]
    }

    return targetLevel.skills
  }
}