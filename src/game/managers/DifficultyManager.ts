import type { DifficultyParams } from '@/game/utils/types'

type LevelsFile = { levels: (DifficultyParams & { level: number })[] }

function lerp(a: number, b: number, t: number) { return a + (b - a) * t }

function lerpBool(a: boolean, b: boolean, t: number) { return (a ? 1 : 0) + ((b ? 1 : 0) - (a ? 1 : 0)) * t >= 0.5 }

export class DifficultyManager {
  private static levels: (DifficultyParams & { level: number })[] = []

  static init(data: LevelsFile) {
    this.levels = [...data.levels].sort((x, y) => x.level - y.level)
  }

  static getParams(level: number): DifficultyParams {
    if (this.levels.length === 0) throw new Error('DifficultyManager not initialized')
    if (level <= this.levels[0].level) return this.stripLevel(this.levels[0])
    if (level >= this.levels[this.levels.length - 1].level) return this.stripLevel(this.levels[this.levels.length - 1])

    let low = this.levels[0]
    let high = this.levels[this.levels.length - 1]
    for (let i = 0; i < this.levels.length - 1; i++) {
      const a = this.levels[i], b = this.levels[i + 1]
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
  }

  private static stripLevel(x: DifficultyParams & { level: number }): DifficultyParams {
    const { level: _lvl, ...rest } = x
    return rest
  }
}
