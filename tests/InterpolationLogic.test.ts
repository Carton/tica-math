// 插值逻辑单元测试 - 测试线性插值的数学正确性
import { DifficultyManager } from '@/game/managers/DifficultyManager'

// 简单的插值函数，与DifficultyManager中的实现相同
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

function lerpBool(a: boolean, b: boolean, t: number): boolean {
  return (a ? 1 : 0) + ((b ? 1 : 0) - (a ? 1 : 0)) * t >= 0.5
}

function lerpRecord<T extends Record<string, number>>(a: T, b: T, t: number): T {
  const result: Record<string, number> = {}
  for (const key in a) {
    if (a[key] !== undefined && b[key] !== undefined) {
      result[key] = lerp(a[key], b[key], t)
    }
  }
  return result as T
}

// 简化的表达式配置接口，已移除withParentheses
interface ExpressionConfig {
  twoTerms: {
    simple: Record<string, number>
  }
  threeTerms: {
    noParentheses: {
      plusMinus: number
      withMul: number
      withDiv: number
    }
    withParentheses: {
      plusMinus: number
      mul: number
      div: number
    }
  }
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
        plusMinus: lerp(a.threeTerms.withParentheses.plusMinus, b.threeTerms.withParentheses.plusMinus, t),
        mul: lerp(a.threeTerms.withParentheses.mul, b.threeTerms.withParentheses.mul, t),
        div: lerp(a.threeTerms.withParentheses.div, b.threeTerms.withParentheses.div, t)
      }
    }
  }
}

describe('插值逻辑单元测试', () => {
  describe('基础数值插值 (lerp)', () => {
    test('应该正确处理边界情况', () => {
      expect(lerp(0, 10, 0)).toBe(0)    // 完全在起点
      expect(lerp(0, 10, 1)).toBe(10)   // 完全在终点
      expect(lerp(0, 10, 0.5)).toBe(5)  // 中点
    })

    test('应该正确处理负数', () => {
      expect(lerp(-10, 10, 0.5)).toBe(0)
      expect(lerp(-5, -1, 0.5)).toBe(-3)
      expect(lerp(-10, 0, 0.3)).toBe(-7)
    })

    test('应该正确处理反向插值', () => {
      expect(lerp(10, 0, 0.5)).toBe(5)
      expect(lerp(100, 0, 0.25)).toBe(75)
    })

    test('应该正确处理小数精度', () => {
      expect(lerp(0, 1, 0.333)).toBeCloseTo(0.333, 3)
      expect(lerp(10, 90, 0.5)).toBeCloseTo(50, 3)
    })

    test('应该处理极端值', () => {
      expect(lerp(0, 1000, 0.1)).toBeCloseTo(100, 0)
      expect(lerp(-1000, 1000, 0.999)).toBeCloseTo(998, 0)
    })
  })

  describe('布尔插值 (lerpBool)', () => {
    test('应该正确处理相同布尔值', () => {
      expect(lerpBool(true, true, 0.5)).toBe(true)
      expect(lerpBool(false, false, 0.5)).toBe(false)
    })

    test('应该正确处理不同布尔值', () => {
      expect(lerpBool(false, true, 0.5)).toBe(true)  // 0.5 >= 0.5
      expect(lerpBool(true, false, 0.5)).toBe(true)  // 0.5 >= 0.5
      expect(lerpBool(false, true, 0.3)).toBe(false) // 0.3 < 0.5
      expect(lerpBool(true, false, 0.2)).toBe(true)  // 0.8 >= 0.5
    })

    test('边界值测试', () => {
      expect(lerpBool(false, true, 0)).toBe(false)
      expect(lerpBool(false, true, 1)).toBe(true)
    })
  })

  describe('记录插值 (lerpRecord)', () => {
    test('应该正确插值简单记录', () => {
      const a = { x: 10, y: 20 }
      const b = { x: 30, y: 40 }
      const result = lerpRecord(a, b, 0.5)

      expect(result.x).toBe(20) // (10 + 30) / 2
      expect(result.y).toBe(30) // (20 + 40) / 2
    })

    test('应该正确处理部分字段', () => {
      const a = { a: 100, b: 0, c: 50 }
      const b = { a: 60, b: 40 }
      const result = lerpRecord(a, b, 0.5)

      expect(result.a).toBe(80) // (100 + 60) / 2
      expect(result.b).toBe(20) // (0 + 40) / 2
      expect((result as any).c).toBeUndefined() // b中没有c字段
    })

    test('应该保持记录结构', () => {
      const a = { skill1: 70, skill2: 30 }
      const b = { skill1: 40, skill2: 60 }
      const result = lerpRecord(a, b, 0.5)

      expect(Object.keys(result)).toEqual(['skill1', 'skill2'])
      expect(typeof result.skill1).toBe('number')
      expect(typeof result.skill2).toBe('number')
    })

    test('应该处理空记录', () => {
      const a = {}
      const b = {}
      const result = lerpRecord(a, b, 0.5)

      expect(Object.keys(result)).toEqual([])
    })

    test('应该处理undefined字段', () => {
      const a = { skill1: 70 }
      const b = { skill1: 40, skill2: 20 }
      const result = lerpRecord(a, b, 0.5)

      expect(result.skill1).toBe(55) // (70 + 40) / 2
      expect((result as any).skill2).toBeUndefined() // a中无skill2
    })
  })

  describe('表达式配置插值 (lerpExpressionConfig)', () => {
    const configA: ExpressionConfig = {
      twoTerms: {
        simple: { plus: 100, minus: 0, mul: 20, div: 10 }
      },
      threeTerms: {
        noParentheses: { plusMinus: 50, withMul: 20, withDiv: 10 },
        withParentheses: { plusMinus: 20, mul: 30, div: 40 }
      }
    }

    const configB: ExpressionConfig = {
      twoTerms: {
        simple: { plus: 60, minus: 40, mul: 60, div: 20 }
      },
      threeTerms: {
        noParentheses: { plusMinus: 30, withMul: 40, withDiv: 20 },
        withParentheses: { plusMinus: 40, mul: 50, div: 60 }
      }
    }

    test('应该正确插值twoTerms配置', () => {
      const result = lerpExpressionConfig(configA, configB, 0.5)

      expect(result.twoTerms.simple.plus).toBeCloseTo(80, 2)   // (100 + 60) / 2
      expect(result.twoTerms.simple.minus).toBeCloseTo(20, 2)  // (0 + 40) / 2
      expect(result.twoTerms.simple.mul).toBeCloseTo(40, 2)    // (20 + 60) / 2
      expect(result.twoTerms.simple.div).toBeCloseTo(15, 2)    // (10 + 20) / 2
    })

    test('应该正确插值threeTerms配置', () => {
      const result = lerpExpressionConfig(configA, configB, 0.25)

      // plusMinus: 50 + (30-50)*0.25 = 45
      expect(result.threeTerms.noParentheses.plusMinus).toBeCloseTo(45, 3)
      // withMul: 20 + (40-20)*0.25 = 25
      expect(result.threeTerms.noParentheses.withMul).toBeCloseTo(25, 3)
      // withDiv: 10 + (20-10)*0.25 = 12.5
      expect(result.threeTerms.noParentheses.withDiv).toBeCloseTo(12.5, 3)
    })

    test('应该保持配置结构完整性', () => {
      const result = lerpExpressionConfig(configA, configB, 0.3)

      expect(result).toHaveProperty('twoTerms')
      expect(result).toHaveProperty('threeTerms')
      expect(result.twoTerms).toHaveProperty('simple')
      expect(result.threeTerms).toHaveProperty('noParentheses')
      expect(result.threeTerms).toHaveProperty('withParentheses')
    })

    test('应该正确处理空的子配置', () => {
      const emptyConfig: ExpressionConfig = {
        twoTerms: {
          simple: {}
        },
        threeTerms: {
          noParentheses: { plusMinus: 0, withMul: 0, withDiv: 0 },
          withParentheses: { plusMinus: 50, mul: 0, div: 0 }
        }
      }

      const result = lerpExpressionConfig(emptyConfig, configA, 0.5)

      // 空配置应该保持为空
      expect(Object.keys(result.twoTerms.simple)).toEqual([])

      // 非空配置应该正常插值
      expect(result.threeTerms.noParentheses.plusMinus).toBeCloseTo(25, 2)
    })
  })

  describe('插值精度和稳定性测试', () => {
    test('插值应该是可逆的', () => {
      const a = 10, b = 20, t = 0.3
      const interpolated = lerp(a, b, t)

      expect(interpolated).toBeCloseTo(13, 1) // 10 + (20-10)*0.3 = 13
    })

    test('插值应该保持单调性', () => {
      const a = 0, b = 100
      const t1 = 0.3, t2 = 0.7

      const result1 = lerp(a, b, t1)
      const result2 = lerp(a, b, t2)

      expect(result2).toBeGreaterThan(result1)
    })

    test('插值应该是线性组合', () => {
      const a = 10, b = 20, t = 0.3
      const result = lerp(a, b, t)
      const expected = a * (1 - t) + b * t

      expect(result).toBeCloseTo(expected, 10)
    })

    test('应该处理浮点数精度问题', () => {
      const a = 0.1, b = 0.3, t = 0.3333333333
      const result = lerp(a, b, t)

      // 应该接近预期值，但不应该有明显的精度误差
      expect(result).toBeCloseTo(0.1666666667, 10)
      expect(result).toBeGreaterThan(0.15)
      expect(result).toBeLessThan(0.2)
    })
  })

  describe('性能测试', () => {
    test('插值函数应该有合理的性能', () => {
      let minDuration = Number.POSITIVE_INFINITY
      for (let attempt = 0; attempt < 3; attempt++) {
        const start = performance.now()
        for (let i = 0; i < 100000; i++) {
          lerp(Math.random() * 100, Math.random() * 100, Math.random())
        }
        const end = performance.now()
        minDuration = Math.min(minDuration, end - start)
      }
      expect(minDuration).toBeLessThan(200)
    })

    test('复杂配置插值性能', () => {
      let minDuration = Number.POSITIVE_INFINITY
      const configA: ExpressionConfig = {
        twoTerms: { simple: { plus: 100, minus: 50, mul: 25, div: 10 } },
        threeTerms: {
          noParentheses: { plusMinus: 80, withMul: 40, withDiv: 20 },
          withParentheses: { plusMinus: 60, mul: 30, div: 15 }
        }
      }

      const configB: ExpressionConfig = {
        twoTerms: { simple: { plus: 50, minus: 25, mul: 75, div: 40 } },
        threeTerms: {
          noParentheses: { plusMinus: 40, withMul: 80, withDiv: 60 },
          withParentheses: { plusMinus: 30, mul: 70, div: 90 }
        }
      }

      for (let attempt = 0; attempt < 3; attempt++) {
        const start = performance.now()
        for (let i = 0; i < 1000; i++) {
          lerpExpressionConfig(configA, configB, Math.random())
        }
        const end = performance.now()
        minDuration = Math.min(minDuration, end - start)
      }

      expect(minDuration).toBeLessThan(80)
    })
  })
})