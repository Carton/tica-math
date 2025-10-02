import type { DifficultyParams, DigitDifficultyLevel, SkillTag, Operator, ExpressionConfig } from '@/game/utils/types'

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
      simple: lerpRecord(a.twoTerms.simple, b.twoTerms.simple, t),
      withParentheses: lerpRecord(a.twoTerms.withParentheses, b.twoTerms.withParentheses, t)
    },
    threeTerms: {
      noParentheses: {
        plusMinus: lerp(a.threeTerms.noParentheses.plusMinus, b.threeTerms.noParentheses.plusMinus, t),
        withMul: lerp(a.threeTerms.noParentheses.withMul, b.threeTerms.noParentheses.withMul, t),
        withDiv: lerp(a.threeTerms.noParentheses.withDiv, b.threeTerms.noParentheses.withDiv, t)
      },
      withParentheses: {
        plusMinus: lerp(a.threeTerms.withParentheses.plusMinus, b.threeTerms.withParentheses.plusMinus, t),
        mul: lerp(a.threeTerms.withParentheses.mul, b.threeTerms.withParentheses.mul, t),
        div: lerp(a.threeTerms.withParentheses.div, b.threeTerms.withParentheses.div, t)
      }
    }
  }
}

export class DifficultyManager {
  private static digitLevels: DigitDifficultyLevel[] = []
  private static legacyLevels: (DifficultyParams & { level: number })[] = []

  static init(data: DigitLevelsFile | { levels: (DifficultyParams & { level: number })[] }) {
    if ('version' in data && data.version === '2.0') {
      // 新的数位难度系统
      this.digitLevels = [...data.digitDifficultyLevels].sort((x, y) => x.level - y.level)
    } else {
      // 旧的难度系统（向后兼容）
      this.legacyLevels = [...(data as any).levels].sort((x, y) => x.level - y.level)
    }
  }

  // 新的数位难度系统接口
  static getDigitParams(level: number): DigitDifficultyLevel {
    if (this.digitLevels.length === 0) {
      throw new Error('Digit difficulty system not initialized. Please load digit-difficulty-v2.json')
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
      allowDecimals: lerpBool(low.allowDecimals, high.allowDecimals, t),
      timePerQuestionMs: Math.round(lerp(low.timePerQuestionMs, high.timePerQuestionMs, t)),
      minTimeMs: Math.round(lerp(low.minTimeMs, high.minTimeMs, t)),
      questionCount: Math.round(lerp(low.questionCount, high.questionCount, t))
    }
  }

  // 获取目标数字难度对应的技能权重
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

  // 向后兼容的旧接口
  static getParams(level: number): DifficultyParams {
    if (this.legacyLevels.length > 0) {
      // 使用旧的难度系统
      if (this.legacyLevels.length === 0) throw new Error('DifficultyManager not initialized')
      if (level <= this.legacyLevels[0].level) return this.stripLevel(this.legacyLevels[0])
      if (level >= this.legacyLevels[this.legacyLevels.length - 1].level) return this.stripLevel(this.legacyLevels[this.legacyLevels.length - 1])

      let low = this.legacyLevels[0]
      let high = this.legacyLevels[this.legacyLevels.length - 1]
      for (let i = 0; i < this.legacyLevels.length - 1; i++) {
        const a = this.legacyLevels[i], b = this.legacyLevels[i + 1]
        if (level >= a.level && level <= b.level) { low = a; high = b; break }
      }
      const t = (level - low.level) / (high.level - low.level)

      const numberRange = { min: Math.round(lerp(low.numberRange.min, high.numberRange.min, t)), max: Math.round(lerp(low.numberRange.max, high.numberRange.max, t)) }
      const operatorWeights = {
        plus: lerp(low.operatorWeights.plus, high.operatorWeights.plus, t),
        minus: lerp(low.operatorWeights.minus, high.operatorWeights.minus, t),
        mul: lerp(low.operatorWeights.mul, high.operatorWeights.mul, t),
        div: lerp(low.operatorWeights.div, high.operatorWeights.div, t),
      }
      const operators = {
        plus: operatorWeights.plus > 0.001,
        minus: operatorWeights.minus > 0.001,
        mul: operatorWeights.mul > 0.001,
        div: operatorWeights.div > 0.001,
      }

      return {
        numberRange,
        operators,
        operatorWeights,
        allowFractions: lerpBool(low.allowFractions, high.allowFractions, t),
        allowDecimals: lerpBool(low.allowDecimals, high.allowDecimals, t),
        allowNegative: lerpBool(low.allowNegative, high.allowNegative, t),
        threeTermsProbability: lerp(low.threeTermsProbability, high.threeTermsProbability, t),
        allowParentheses: lerpBool(low.allowParentheses, high.allowParentheses, t),
        timePerQuestionMs: Math.round(lerp(low.timePerQuestionMs, high.timePerQuestionMs, t)),
        minTimeMs: Math.round(lerp(low.minTimeMs, high.minTimeMs, t)),
        questionCount: Math.round(lerp(low.questionCount, high.questionCount, t)),
      }
    } else {
      // 从新的数位难度系统转换（如果需要向后兼容）
      const digitParams = this.getDigitParams(level)

      // 转换为旧格式（这是一个简化的转换，主要用于兼容）
      const numberRange = {
        min: Math.pow(10, digitParams.digitRange.min - 1),
        max: Math.pow(10, digitParams.digitRange.max) - 1
      }

      return {
        numberRange,
        operators: { plus: true, minus: true, mul: true, div: true },
        operatorWeights: { plus: 0.25, minus: 0.25, mul: 0.25, div: 0.25 },
        allowFractions: digitParams.allowFractions,
        allowDecimals: digitParams.allowDecimals,
        allowNegative: digitParams.allowNegative,
        threeTermsProbability: 0.3,
        allowParentheses: true,
        timePerQuestionMs: digitParams.timePerQuestionMs,
        minTimeMs: digitParams.minTimeMs,
        questionCount: digitParams.questionCount
      }
    }
  }

  private static stripLevel(x: DifficultyParams & { level: number }): DifficultyParams {
    const { level: _lvl, ...rest } = x
    return rest
  }
}