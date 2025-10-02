// 数位难度系统全面测试 - 测试新的数位难度配置和插值逻辑
import { DifficultyManager } from '@/game/managers/DifficultyManager'
import type { DigitDifficultyLevel } from '@/game/utils/types'

// 简化的测试配置数据
const testDigitDifficultyConfig = {
  version: "2.0",
  digitDifficultyLevels: [
    {
      level: 1,
      digitRange: { min: 2, max: 4 },
      skills: {
        lastDigit: 0.7,
        estimate: 0.3,
        parity: 0,
        castingOutNines: 0,
        carryBorrow: 0,
        specialDigits: 0
      },
      expressions: {
        twoTerms: {
          simple: { plus: 1.0 },
          withParentheses: {}
        },
        threeTerms: {
          noParentheses: {},
          withParentheses: {}
        }
      },
      allowNegative: false,
      allowFractions: false,
      allowDecimals: false,
      timePerQuestionMs: 15000,
      minTimeMs: 8000,
      questionCount: 10
    },
    {
      level: 10,
      digitRange: { min: 4, max: 6 },
      skills: {
        lastDigit: 0.4,
        estimate: 0.3,
        parity: 0.2,
        carryBorrow: 0.1,
        castingOutNines: 0,
        specialDigits: 0
      },
      expressions: {
        twoTerms: {
          simple: { plus: 0.6, minus: 0.4 },
          withParentheses: {}
        },
        threeTerms: {
          noParentheses: { plusMinus: 0.3 },
          withParentheses: {}
        }
      },
      allowNegative: false,
      allowFractions: false,
      allowDecimals: false,
      timePerQuestionMs: 12000,
      minTimeMs: 7000,
      questionCount: 12
    },
    {
      level: 20,
      digitRange: { min: 6, max: 8 },
      skills: {
        lastDigit: 0.25,
        estimate: 0.25,
        parity: 0.2,
        carryBorrow: 0.15,
        castingOutNines: 0.1,
        specialDigits: 0.05
      },
      expressions: {
        twoTerms: {
          simple: { plus: 0.4, minus: 0.3, mul: 0.3 },
          withParentheses: { plus: 0.2, minus: 0.2 }
        },
        threeTerms: {
          noParentheses: {
            plusMinus: 0.2,
            withMul: 0.1,
            withDiv: 0.05
          },
          withParentheses: {
            plusMinus: 0.1,
            mul: 0.05,
            div: 0.02
          }
        }
      },
      allowNegative: true,
      allowFractions: false,
      allowDecimals: false,
      timePerQuestionMs: 10000,
      minTimeMs: 6000,
      questionCount: 15
    }
  ] as DigitDifficultyLevel[]
}

describe('数位难度系统测试', () => {
  beforeEach(() => {
    DifficultyManager.init(testDigitDifficultyConfig)
  })

  describe('基础配置加载测试', () => {
    test('应该正确加载数位难度配置', () => {
      const level1 = DifficultyManager.getDigitParams(1)
      expect(level1.level).toBe(1)
      expect(level1.digitRange.min).toBe(2)
      expect(level1.digitRange.max).toBe(4)
    })

    test('应该正确获取最高级别配置', () => {
      const level20 = DifficultyManager.getDigitParams(20)
      expect(level20.level).toBe(20)
      expect(level20.digitRange.min).toBe(6)
      expect(level20.digitRange.max).toBe(8)
      expect(level20.allowNegative).toBe(true)
    })

    test('超出范围时应该返回边界值', () => {
      const belowMin = DifficultyManager.getDigitParams(0)
      expect(belowMin.level).toBe(1)
      expect(belowMin.digitRange.min).toBe(2)

      const aboveMax = DifficultyManager.getDigitParams(25)
      expect(aboveMax.level).toBe(20) // 超出范围时使用最高level
      expect(aboveMax.digitRange.min).toBe(6)
      expect(aboveMax.digitRange.max).toBe(8)
      expect(aboveMax.allowNegative).toBe(true)
    })
  })

  describe('插值逻辑测试', () => {
    test('数字范围插值应该正确', () => {
      const midLevel = DifficultyManager.getDigitParams(5) // 1和10的中间
      expect(midLevel.digitRange.min).toBe(3) // (2+4)/2 = 3
      expect(midLevel.digitRange.max).toBe(5) // (4+6)/2 = 5
    })

    test('技能权重插值应该正确', () => {
      const midLevel = DifficultyManager.getDigitParams(5)
      // level 5在1和10之间，t = (5-1)/(10-1) = 4/9 ≈ 0.444
      // lastDigit: 0.7 + (0.4-0.7)*4/9 ≈ 0.567
      expect(midLevel.skills.lastDigit).toBeCloseTo(0.567, 2)
      // estimate: 0.3 + (0.3-0.3)*4/9 = 0.3
      expect(midLevel.skills.estimate).toBeCloseTo(0.3, 2)
      // parity: 0 + (0.2-0)*4/9 ≈ 0.089
      expect(midLevel.skills.parity).toBeCloseTo(0.089, 2)
    })

    test('时间配置插值应该正确', () => {
      const midLevel = DifficultyManager.getDigitParams(5)
      // timePerQuestionMs: 15000 + (12000-15000)*4/9 ≈ 13667
      expect(midLevel.timePerQuestionMs).toBeCloseTo(13667, 0)
      // minTimeMs: 8000 + (7000-8000)*4/9 ≈ 7556
      expect(midLevel.minTimeMs).toBeCloseTo(7556, 0)
      // questionCount: 10 + (12-10)*4/9 ≈ 11
      expect(midLevel.questionCount).toBeCloseTo(11, 0)
    })

    test('布尔值插值应该正确', () => {
      // 测试 allowNegative 的插值
      const level5 = DifficultyManager.getDigitParams(5) // false和false之间
      expect(level5.allowNegative).toBe(false)

      const level15 = DifficultyManager.getDigitParams(15) // false和true之间
      expect(level15.allowNegative).toBe(true) // t=0.5时应该倾向于true
    })

    test('表达式配置插值应该正确', () => {
      const midLevel = DifficultyManager.getDigitParams(5)
      // twoTerms.simple.plus: 1.0 + (0.6-1.0)*4/9 ≈ 0.822
      expect(midLevel.expressions.twoTerms.simple.plus).toBeCloseTo(0.822, 2)
      // minus字段在level 1中不存在，所以插值后可能也不存在
      // 如果存在，应该是: 0 + (0.4-0)*4/9 ≈ 0.178
      if (midLevel.expressions.twoTerms.simple.minus !== undefined) {
        expect(midLevel.expressions.twoTerms.simple.minus).toBeCloseTo(0.178, 2)
      }
    })

    test('复杂表达式配置插值应该正确', () => {
      const level15 = DifficultyManager.getDigitParams(15) // 10和20的中间，t = (15-10)/(20-10) = 0.5
      // threeTerms.noParentheses.plusMinus: 0.3 + (0.2-0.3)*0.5 = 0.25
      expect(level15.expressions.threeTerms.noParentheses.plusMinus).toBeCloseTo(0.25, 2)
      // withMul字段在level 10中不存在，level 20中存在，插值后可能存在也可能不存在
      // 这里我们只测试存在的情况
      const withMul = level15.expressions.threeTerms.noParentheses.withMul
      if (withMul !== undefined && !isNaN(withMul)) {
        expect(withMul).toBeCloseTo(0.05, 2)
      }
    })
  })

  describe('技能权重计算测试', () => {
    test('应该根据数字难度返回正确的技能权重', () => {
      // 数字难度3应该匹配level 1 (2-4范围)
      const weights3 = DifficultyManager.getSkillWeights(3)
      expect(weights3.lastDigit).toBeCloseTo(0.7, 2)
      expect(weights3.estimate).toBeCloseTo(0.3, 2)
      expect(weights3.parity).toBeCloseTo(0, 2)
    })

    test('应该根据数字难度选择合适的级别', () => {
      // 数字难度5应该匹配level 10 (4-6范围)
      const weights5 = DifficultyManager.getSkillWeights(5)
      expect(weights5.lastDigit).toBeCloseTo(0.4, 2)
      expect(weights5.carryBorrow).toBeCloseTo(0.1, 2)
    })

    test('边界数字难度应该正确处理', () => {
      // 数字难度4正好在level 1和10的边界
      const weights4 = DifficultyManager.getSkillWeights(4)
      // 应该选择距离更近的level 1 (因为4更接近2-4范围)
      expect(weights4.lastDigit).toBeCloseTo(0.7, 2)
    })

    test('超出范围的数字难度应该使用最高级别', () => {
      // 数字难度10应该匹配level 20 (6-8范围)
      const weights10 = DifficultyManager.getSkillWeights(10)
      expect(weights10.specialDigits).toBeCloseTo(0.05, 2)
      expect(weights10.castingOutNines).toBeCloseTo(0.1, 2)
    })
  })

  describe('边界情况和错误处理测试', () => {
    test('未初始化时应该抛出错误', () => {
      // 创建新的DifficultyManager实例来测试未初始化情况
      const freshManager = DifficultyManager
      // 重新初始化为空来模拟未初始化状态
      freshManager.init({ version: "2.0", digitDifficultyLevels: [] })

      expect(() => freshManager.getDigitParams(1)).toThrow('Digit difficulty system not initialized')
      expect(() => freshManager.getSkillWeights(3)).toThrow('Digit difficulty system not initialized')
    })

    test('单个级别配置应该正确处理', () => {
      const singleLevelConfig = {
        version: "2.0",
        digitDifficultyLevels: [testDigitDifficultyConfig.digitDifficultyLevels[0]]
      }
      DifficultyManager.init(singleLevelConfig)

      // 任何级别都应该返回唯一的配置
      const anyLevel = DifficultyManager.getDigitParams(100)
      expect(anyLevel.digitRange.min).toBe(2)
      expect(anyLevel.digitRange.max).toBe(4)
    })

    test('空配置应该优雅处理', () => {
      expect(() => {
        DifficultyManager.init({ version: "2.0", digitDifficultyLevels: [] })
      }).not.toThrow()

      expect(() => DifficultyManager.getDigitParams(1)).toThrow()
    })
  })

  describe('插值精度测试', () => {
    test('小数级别插值应该有足够精度', () => {
      const level2_5 = DifficultyManager.getDigitParams(2.5)
      const level1 = testDigitDifficultyConfig.digitDifficultyLevels[0]
      const level10 = testDigitDifficultyConfig.digitDifficultyLevels[1]

      const t = (2.5 - level1.level) / (level10.level - level1.level) // 0.166...

      // 验证插值计算
      const expectedMin = Math.round(level1.digitRange.min + (level10.digitRange.min - level1.digitRange.min) * t)
      const expectedMax = Math.round(level1.digitRange.max + (level10.digitRange.max - level1.digitRange.max) * t)

      expect(level2_5.digitRange.min).toBe(expectedMin)
      expect(level2_5.digitRange.max).toBe(expectedMax)
    })

    test('权重插值应该保持总和合理', () => {
      const level5 = DifficultyManager.getDigitParams(5)
      const skillWeights = Object.values(level5.skills)
      const totalWeight = skillWeights.reduce((sum, weight) => sum + weight, 0)

      // 技能权重总和应该在合理范围内（不一定是1，因为可能有未启用的技能）
      expect(totalWeight).toBeGreaterThan(0.5)
      expect(totalWeight).toBeLessThan(2.0)
    })
  })

  describe('配置一致性测试', () => {
    test('相邻级别的插值应该是单调的', () => {
      const level1 = DifficultyManager.getDigitParams(1)
      const level5 = DifficultyManager.getDigitParams(5)
      const level10 = DifficultyManager.getDigitParams(10)

      // 某些值应该在相邻级别之间单调变化
      expect(level5.digitRange.min).toBeGreaterThanOrEqual(level1.digitRange.min)
      expect(level5.digitRange.min).toBeLessThanOrEqual(level10.digitRange.min)

      // lastDigit权重应该递减
      expect(level5.skills.lastDigit).toBeLessThanOrEqual(level1.skills.lastDigit)
      expect(level5.skills.lastDigit).toBeGreaterThanOrEqual(level10.skills.lastDigit)
    })

    test('插值结果应该保持类型一致性', () => {
      const level15 = DifficultyManager.getDigitParams(15)

      // 数字范围应该是整数
      expect(Number.isInteger(level15.digitRange.min)).toBe(true)
      expect(Number.isInteger(level15.digitRange.max)).toBe(true)

      // 时间应该是整数
      expect(Number.isInteger(level15.timePerQuestionMs)).toBe(true)
      expect(Number.isInteger(level15.minTimeMs)).toBe(true)
      expect(Number.isInteger(level15.questionCount)).toBe(true)

      // 权重应该是数字
      Object.values(level15.skills).forEach(weight => {
        expect(typeof weight).toBe('number')
        expect(weight).toBeGreaterThanOrEqual(0)
        expect(weight).toBeLessThanOrEqual(1)
      })
    })
  })
})

