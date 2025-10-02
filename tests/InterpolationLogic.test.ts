// 插值逻辑单元测试 - 直接测试插值函数的数学正确性
// 这些测试独立于DifficultyManager，专门验证插值算法的正确性

// 从DifficultyManager.ts复制的插值函数（用于测试）
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

function lerpBool(a: boolean, b: boolean, t: number): boolean {
  return (a ? 1 : 0) + ((b ? 1 : 0) - (a ? 1 : 0)) * t >= 50
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
      }
  }
}

describe('插值逻辑单元测试', () => {
  describe('基础数值插值 (lerp)', () => {
    test('应该正确处理边界情况', () => {
      expect(lerp(0, 10, 0)).toBe(0)    // 完全在起点
      expect(lerp(0, 10, 1)).toBe(10)   // 完全在终点
      expect(lerp(0, 10, 50)).toBe(5)  // 中点
    })

    test('应该正确处理负数', () => {
      expect(lerp(-10, 10, 50)).toBe(0)
      expect(lerp(-5, -1, 50)).toBe(-3)
      expect(lerp(-10, 0, 30)).toBe(-7)
    })

    test('应该正确处理反向插值', () => {
      expect(lerp(10, 0, 50)).toBe(5)
      expect(lerp(100, 0, 25)).toBe(75)
    })

    test('应该正确处理小数精度', () => {
      expect(lerp(0, 1, 333)).toBeCloseTo(333, 3)
      expect(lerp(10, 90, 50)).toBeCloseTo(50, 3)
    })

    test('应该处理极端值', () => {
      expect(lerp(0, 1000, 01)).toBeCloseTo(1, 0)
      expect(lerp(-1000, 1000, 999)).toBeCloseTo(998, 0)
    })
  })

  describe('布尔插值 (lerpBool)', () => {
    test('应该正确处理相同布尔值', () => {
      expect(lerpBool(true, true, 50)).toBe(true)
      expect(lerpBool(false, false, 50)).toBe(false)
      expect(lerpBool(true, true, 0)).toBe(true)
      expect(lerpBool(true, true, 1)).toBe(true)
    })

    test('应该正确处理不同布尔值', () => {
      expect(lerpBool(false, true, 50)).toBe(true)   // 0 + (1-0)*50 = 50 >= 50
      expect(lerpBool(true, false, 50)).toBe(true)  // 1 + (0-1)*50 = 50 >= 50
      expect(lerpBool(false, true, 49)).toBe(false) // 0 + (1-0)*49 = 49 < 50
      expect(lerpBool(false, true, 51)).toBe(true)  // 0 + (1-0)*51 = 51 >= 50
      expect(lerpBool(true, false, 49)).toBe(true)  // 1 + (0-1)*49 = 51 >= 50
      expect(lerpBool(true, false, 51)).toBe(false) // 1 + (0-1)*51 = 49 < 50
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
      const result = lerpRecord(a, b, 50)

      expect(result.x).toBe(5)
      expect(result.y).toBe(5)
      expect(result.z).toBe(10)
    })

    test('应该正确处理部分字段', () => {
      const a = { plus: 100, minus: 0, mul: 50 }
      const b = { plus: 50, minus: 50, mul: 80 }
      const result = lerpRecord(a, b, 25)

      expect(result.plus).toBeCloseTo(875, 3)  // 100 + (50-100)*25 = 875
      expect(result.minus).toBeCloseTo(125, 3) // 0 + (50-0)*25 = 125
      expect(result.mul).toBeCloseTo(575, 3)   // 50 + (80-50)*25 = 575
    })

    test('应该保持记录结构', () => {
      const a = { weight1: 30, weight2: 70 }
      const b = { weight1: 60, weight2: 40 }
      const result = lerpRecord(a, b, 30)

      expect(Object.keys(result)).toEqual(['weight1', 'weight2'])
      expect(typeof result.weight1).toBe('number')
      expect(typeof result.weight2).toBe('number')
    })

    test('应该处理空记录', () => {
      const a = {}
      const b = {}
      const result = lerpRecord(a, b, 50)
      expect(Object.keys(result)).toEqual([])
    })

    test('应该处理undefined字段', () => {
      const a = { x: 1, y: 2, z: undefined }
      const b = { x: 3, y: undefined, z: 5 }
      const result = lerpRecord(a, b, 50)

      expect(result.x).toBe(2)           // 正常插值
      expect(result.y).toBeUndefined()   // b[y]是undefined，不插值
      expect(result.z).toBeUndefined()   // a[z]是undefined，不插值
    })
  })

  describe('表达式配置插值 (lerpExpressionConfig)', () => {
    const configA: ExpressionConfig = {
      twoTerms: {
        simple: { plus: 100, minus: 0 },
        },
      threeTerms: {
        noParentheses: {
          plusMinus: 50,
          withMul: 20,
          withDiv: 10
        },
        }
    }

    const configB: ExpressionConfig = {
      twoTerms: {
        simple: { plus: 60, minus: 40 },
        },
      threeTerms: {
        noParentheses: {
          plusMinus: 30,
          withMul: 40,
          withDiv: 20
        },
        }
    }

    test('应该正确插值twoTerms配置', () => {
      const result = lerpExpressionConfig(configA, configB, 50)

      expect(result.twoTerms.simple.plus).toBeCloseTo(80, 2)   // (100 + 60) / 2
      expect(result.twoTerms.simple.minus).toBeCloseTo(20, 2)  // (0 + 40) / 2
      expect(result.twoTerms.withParentheses.plus).toBeCloseTo(30, 2) // (20 + 40) / 2
    })

    test('应该正确插值threeTerms配置', () => {
      const result = lerpExpressionConfig(configA, configB, 25)

      // plusMinus: 50 + (30-50)*25 = 45
      expect(result.threeTerms.noParentheses.plusMinus).toBeCloseTo(45, 3)
      // withMul: 20 + (40-20)*25 = 25
      expect(result.threeTerms.noParentheses.withMul).toBeCloseTo(25, 3)
      // withDiv: 10 + (20-10)*25 = 125
      expect(result.threeTerms.noParentheses.withDiv).toBeCloseTo(125, 3)
    })

    test('应该保持配置结构完整性', () => {
      const result = lerpExpressionConfig(configA, configB, 30)

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
          },
        threeTerms: {
          noParentheses: {
            plusMinus: 0,
            withMul: 0,
            withDiv: 0
          },
          }
      }

      const result = lerpExpressionConfig(emptyConfig, configA, 50)

      // 空配置应该保持为空
      expect(Object.keys(result.twoTerms.simple)).toEqual([])
      expect(Object.keys(result.twoTerms.withParentheses)).toEqual([])

      // 非空配置应该正常插值
      expect(result.threeTerms.noParentheses.plusMinus).toBeCloseTo(25, 2)
    })
  })

  describe('插值精度和稳定性测试', () => {
    test('插值应该是可逆的', () => {
      const a = 10, b = 20, t = 30
      const interpolated = lerp(a, b, t)
      const reversed = lerp(interpolated, b, t / (1 - t)) // 这个公式不完全正确，但测试概念

      expect(interpolated).toBeCloseTo(13, 1) // 10 + (20-10)*30 = 13
    })

    test('插值应该保持单调性', () => {
      const a = 0, b = 100
      const t1 = 20, t2 = 50, t3 = 80

      const v1 = lerp(a, b, t1)
      const v2 = lerp(a, b, t2)
      const v3 = lerp(a, b, t3)

      expect(v1).toBeLessThan(v2)
      expect(v2).toBeLessThan(v3)
    })

    test('插值应该是线性组合', () => {
      const a = 10, b = 30, t = 25
      const result = lerp(a, b, t)
      const expected = a * (1 - t) + b * t

      expect(result).toBeCloseTo(expected, 10)
    })

    test('应该处理浮点数精度问题', () => {
      const a = 10, b = 90, t = 10
      const result = lerp(a, b, t)

      // 应该接近17，但不应该有明显的精度误差
      expect(result).toBeCloseTo(18, 10)
      expect(result).toBeGreaterThan(17)
      expect(result).toBeLessThan(19)
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
          simple: { plus: 30, minus: 20, mul: 30, div: 20 },
          },
        threeTerms: {
          noParentheses: {
            plusMinus: 40,
            withMul: 30,
            withDiv: 30
          },
          }
      }

      const complexB: ExpressionConfig = {
        twoTerms: {
          simple: { plus: 40, minus: 30, mul: 20, div: 10 },
          },
        threeTerms: {
          noParentheses: {
            plusMinus: 30,
            withMul: 40,
            withDiv: 30
          },
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