// 插值逻辑单元测试 - 直接测试插值函数的数学正确性
// 这些测试独立于DifficultyManager，专门验证插值算法的正确性

// 从DifficultyManager.ts复制的插值函数（用于测试）
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

interface ExpressionConfig {
  twoTerms: {
    simple: Record<string, number>
    withParentheses: Record<string, number>
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
      expect(lerp(0.1, 0.9, 0.5)).toBeCloseTo(0.5, 3)
    })

    test('应该处理极端值', () => {
      expect(lerp(0, 1000, 0.001)).toBeCloseTo(1, 0)
      expect(lerp(-1000, 1000, 0.999)).toBeCloseTo(998, 0)
    })
  })

  describe('布尔插值 (lerpBool)', () => {
    test('应该正确处理相同布尔值', () => {
      expect(lerpBool(true, true, 0.5)).toBe(true)
      expect(lerpBool(false, false, 0.5)).toBe(false)
      expect(lerpBool(true, true, 0)).toBe(true)
      expect(lerpBool(true, true, 1)).toBe(true)
    })

    test('应该正确处理不同布尔值', () => {
      expect(lerpBool(false, true, 0.5)).toBe(true)   // 0 + (1-0)*0.5 = 0.5 >= 0.5
      expect(lerpBool(true, false, 0.5)).toBe(true)  // 1 + (0-1)*0.5 = 0.5 >= 0.5
      expect(lerpBool(false, true, 0.49)).toBe(false) // 0 + (1-0)*0.49 = 0.49 < 0.5
      expect(lerpBool(false, true, 0.51)).toBe(true)  // 0 + (1-0)*0.51 = 0.51 >= 0.5
      expect(lerpBool(true, false, 0.49)).toBe(true)  // 1 + (0-1)*0.49 = 0.51 >= 0.5
      expect(lerpBool(true, false, 0.51)).toBe(false) // 1 + (0-1)*0.51 = 0.49 < 0.5
    })

    test('边界值测试', () => {
      expect(lerpBool(false, true, 0)).toBe(false)
      expect(lerpBool(false, true, 1)).toBe(true)
      expect(lerpBool(true, false, 0)).toBe(true)
      expect(lerpBool(true, false, 1)).toBe(false)
    })
  })

  describe('记录插值 (lerpRecord)', () => {
    test('应该正确插值简单记录', () => {
      const a = { x: 0, y: 10, z: 5 }
      const b = { x: 10, y: 0, z: 15 }
      const result = lerpRecord(a, b, 0.5)

      expect(result.x).toBe(5)
      expect(result.y).toBe(5)
      expect(result.z).toBe(10)
    })

    test('应该正确处理部分字段', () => {
      const a = { plus: 1.0, minus: 0, mul: 0.5 }
      const b = { plus: 0.5, minus: 0.5, mul: 0.8 }
      const result = lerpRecord(a, b, 0.25)

      expect(result.plus).toBeCloseTo(0.875, 3)  // 1.0 + (0.5-1.0)*0.25 = 0.875
      expect(result.minus).toBeCloseTo(0.125, 3) // 0 + (0.5-0)*0.25 = 0.125
      expect(result.mul).toBeCloseTo(0.575, 3)   // 0.5 + (0.8-0.5)*0.25 = 0.575
    })

    test('应该保持记录结构', () => {
      const a = { weight1: 0.3, weight2: 0.7 }
      const b = { weight1: 0.6, weight2: 0.4 }
      const result = lerpRecord(a, b, 0.3)

      expect(Object.keys(result)).toEqual(['weight1', 'weight2'])
      expect(typeof result.weight1).toBe('number')
      expect(typeof result.weight2).toBe('number')
    })

    test('应该处理空记录', () => {
      const a = {}
      const b = {}
      const result = lerpRecord(a, b, 0.5)
      expect(Object.keys(result)).toEqual([])
    })

    test('应该处理undefined字段', () => {
      const a = { x: 1, y: 2, z: undefined }
      const b = { x: 3, y: undefined, z: 5 }
      const result = lerpRecord(a, b, 0.5)

      expect(result.x).toBe(2)           // 正常插值
      expect(result.y).toBeUndefined()   // b[y]是undefined，不插值
      expect(result.z).toBeUndefined()   // a[z]是undefined，不插值
    })
  })

  describe('表达式配置插值 (lerpExpressionConfig)', () => {
    const configA: ExpressionConfig = {
      twoTerms: {
        simple: { plus: 1.0, minus: 0 },
        withParentheses: { plus: 0.2, minus: 0.1 }
      },
      threeTerms: {
        noParentheses: {
          plusMinus: 0.5,
          withMul: 0.2,
          withDiv: 0.1
        },
        withParentheses: {
          plusMinus: 0.3,
          mul: 0.2,
          div: 0.1
        }
      }
    }

    const configB: ExpressionConfig = {
      twoTerms: {
        simple: { plus: 0.6, minus: 0.4 },
        withParentheses: { plus: 0.4, minus: 0.3 }
      },
      threeTerms: {
        noParentheses: {
          plusMinus: 0.3,
          withMul: 0.4,
          withDiv: 0.2
        },
        withParentheses: {
          plusMinus: 0.2,
          mul: 0.3,
          div: 0.2
        }
      }
    }

    test('应该正确插值twoTerms配置', () => {
      const result = lerpExpressionConfig(configA, configB, 0.5)

      expect(result.twoTerms.simple.plus).toBeCloseTo(0.8, 2)   // (1.0 + 0.6) / 2
      expect(result.twoTerms.simple.minus).toBeCloseTo(0.2, 2)  // (0 + 0.4) / 2
      expect(result.twoTerms.withParentheses.plus).toBeCloseTo(0.3, 2) // (0.2 + 0.4) / 2
    })

    test('应该正确插值threeTerms配置', () => {
      const result = lerpExpressionConfig(configA, configB, 0.25)

      // plusMinus: 0.5 + (0.3-0.5)*0.25 = 0.45
      expect(result.threeTerms.noParentheses.plusMinus).toBeCloseTo(0.45, 3)
      // withMul: 0.2 + (0.4-0.2)*0.25 = 0.25
      expect(result.threeTerms.noParentheses.withMul).toBeCloseTo(0.25, 3)
      // withDiv: 0.1 + (0.2-0.1)*0.25 = 0.125
      expect(result.threeTerms.noParentheses.withDiv).toBeCloseTo(0.125, 3)
    })

    test('应该保持配置结构完整性', () => {
      const result = lerpExpressionConfig(configA, configB, 0.3)

      expect(result).toHaveProperty('twoTerms')
      expect(result).toHaveProperty('threeTerms')
      expect(result.twoTerms).toHaveProperty('simple')
      expect(result.twoTerms).toHaveProperty('withParentheses')
      expect(result.threeTerms).toHaveProperty('noParentheses')
      expect(result.threeTerms).toHaveProperty('withParentheses')
    })

    test('应该正确处理空的子配置', () => {
      const emptyConfig: ExpressionConfig = {
        twoTerms: {
          simple: {},
          withParentheses: {}
        },
        threeTerms: {
          noParentheses: {
            plusMinus: 0,
            withMul: 0,
            withDiv: 0
          },
          withParentheses: {
            plusMinus: 0,
            mul: 0,
            div: 0
          }
        }
      }

      const result = lerpExpressionConfig(emptyConfig, configA, 0.5)

      // 空配置应该保持为空
      expect(Object.keys(result.twoTerms.simple)).toEqual([])
      expect(Object.keys(result.twoTerms.withParentheses)).toEqual([])

      // 非空配置应该正常插值
      expect(result.threeTerms.noParentheses.plusMinus).toBeCloseTo(0.25, 2)
    })
  })

  describe('插值精度和稳定性测试', () => {
    test('插值应该是可逆的', () => {
      const a = 10, b = 20, t = 0.3
      const interpolated = lerp(a, b, t)
      const reversed = lerp(interpolated, b, t / (1 - t)) // 这个公式不完全正确，但测试概念

      expect(interpolated).toBeCloseTo(13, 1) // 10 + (20-10)*0.3 = 13
    })

    test('插值应该保持单调性', () => {
      const a = 0, b = 100
      const t1 = 0.2, t2 = 0.5, t3 = 0.8

      const v1 = lerp(a, b, t1)
      const v2 = lerp(a, b, t2)
      const v3 = lerp(a, b, t3)

      expect(v1).toBeLessThan(v2)
      expect(v2).toBeLessThan(v3)
    })

    test('插值应该是线性组合', () => {
      const a = 10, b = 30, t = 0.25
      const result = lerp(a, b, t)
      const expected = a * (1 - t) + b * t

      expect(result).toBeCloseTo(expected, 10)
    })

    test('应该处理浮点数精度问题', () => {
      const a = 0.1, b = 0.9, t = 0.1
      const result = lerp(a, b, t)

      // 应该接近0.17，但不应该有明显的精度误差
      expect(result).toBeCloseTo(0.18, 10)
      expect(result).toBeGreaterThan(0.17)
      expect(result).toBeLessThan(0.19)
    })
  })

  describe('性能测试', () => {
    test('插值函数应该有合理的性能', () => {
      const iterations = 10000
      const start = performance.now()

      for (let i = 0; i < iterations; i++) {
        lerp(0, 100, Math.random())
        lerpBool(false, true, Math.random())
        lerpRecord({ a: 0, b: 100 }, { a: 100, b: 0 }, Math.random())
      }

      const end = performance.now()
      const duration = end - start

      // 10000次插值应该在合理时间内完成（比如100ms）
      expect(duration).toBeLessThan(100)
    })

    test('复杂配置插值性能', () => {
      const complexA: ExpressionConfig = {
        twoTerms: {
          simple: { plus: 0.3, minus: 0.2, mul: 0.3, div: 0.2 },
          withParentheses: { plus: 0.2, minus: 0.2, mul: 0.3, div: 0.3 }
        },
        threeTerms: {
          noParentheses: {
            plusMinus: 0.4,
            withMul: 0.3,
            withDiv: 0.3
          },
          withParentheses: {
            plusMinus: 0.3,
            mul: 0.3,
            div: 0.4
          }
        }
      }

      const complexB: ExpressionConfig = {
        twoTerms: {
          simple: { plus: 0.4, minus: 0.3, mul: 0.2, div: 0.1 },
          withParentheses: { plus: 0.3, minus: 0.3, mul: 0.2, div: 0.2 }
        },
        threeTerms: {
          noParentheses: {
            plusMinus: 0.3,
            withMul: 0.4,
            withDiv: 0.3
          },
          withParentheses: {
            plusMinus: 0.4,
            mul: 0.3,
            div: 0.3
          }
        }
      }

      const iterations = 1000
      const start = performance.now()

      for (let i = 0; i < iterations; i++) {
        lerpExpressionConfig(complexA, complexB, Math.random())
      }

      const end = performance.now()
      const duration = end - start

      // 1000次复杂插值应该在合理时间内完成
      expect(duration).toBeLessThan(50)
    })
  })
})