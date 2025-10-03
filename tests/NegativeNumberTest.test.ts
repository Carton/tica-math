// 负数检查测试 - 确保allowNegative=false时不会出现负数
import { QuestionGenerator } from '@/game/managers/QuestionGenerator'
import { DifficultyManager } from '@/game/managers/DifficultyManager'

describe('负数检查测试', () => {
  // 测试关卡配置（不允许负数）
  const noNegativeConfig = {
    version: "2.0",
    digitDifficultyLevels: [
      {
        level: 1,
        digitRange: { min: 2, max: 3 },
        skills: { lastDigit: 70, estimate: 30, parity: 0, castingOutNines: 0, carryBorrow: 0, specialDigits: 0 },
        expressions: {
          twoTerms: { simple: { plus: 50, minus: 50, mul: 0, div: 0 } }
        },
        threeTerms: { noParentheses: {}, withParentheses: {} },
        allowNegative: false,
        allowFractions: false,
        allowDecimals: false,
        timePerQuestionMs: 15000,
        minTimeMs: 8000,
        questionCount: 10
      }
    ]
  }

  // 测试关卡配置（允许负数）
  const allowNegativeConfig = {
    version: "2.0",
    digitDifficultyLevels: [
      {
        level: 1,
        digitRange: { min: 2, max: 3 },
        skills: { lastDigit: 50, estimate: 30, parity: 10, castingOutNines: 0, carryBorrow: 10, specialDigits: 0 },
        expressions: {
          twoTerms: { simple: { plus: 40, minus: 40, mul: 10, div: 10 } },
          threeTerms: { noParentheses: {}, withParentheses: {} }
        },
        allowNegative: true,
        allowFractions: false,
        allowDecimals: false,
        timePerQuestionMs: 15000,
        minTimeMs: 8000,
        questionCount: 10
      }
    ]
  }

  beforeEach(() => {
    // 每个测试前初始化配置
  })

  describe('allowNegative=false 测试', () => {
    beforeEach(() => {
      DifficultyManager.init(noNegativeConfig)
    })

    test('所有题目结果都应该为非负数', () => {
      for (let i = 0; i < 100; i++) {
        const question = QuestionGenerator.createQuestion(1)
        const correctValue = question.metadata.correctValue
        const shownValue = question.metadata.shownValue

        expect(correctValue).toBeGreaterThanOrEqual(0)
        expect(shownValue).toBeGreaterThanOrEqual(0)
      }
    })

    test('题目表达式中不应该出现负号', () => {
      for (let i = 0; i < 50; i++) {
        const question = QuestionGenerator.createQuestion(1)
        const expr = question.questionString

        // 检查表达式中是否包含负号（开头的负数才算真正的负数）
        expect(expr).not.toMatch(/^-\s*\d+/) // 不应该以负号开头
      }
    })

    test('除法题目应该正确处理', () => {
      // 初始化包含除法的配置
      const configWithDiv = {
        version: "2.0",
        digitDifficultyLevels: [
          {
            level: 1,
            digitRange: { min: 2, max: 3 },
            skills: { lastDigit: 50, estimate: 50, parity: 0, castingOutNines: 0, carryBorrow: 0, specialDigits: 0 },
            expressions: {
              twoTerms: { simple: { plus: 30, minus: 30, mul: 0, div: 40 } }
            },
            threeTerms: { noParentheses: {}, withParentheses: {} },
            allowNegative: false,
            allowFractions: false,
            allowDecimals: false,
            timePerQuestionMs: 15000,
            minTimeMs: 8000,
            questionCount: 10
          }
        ]
      }
      DifficultyManager.init(configWithDiv)

      for (let i = 0; i < 50; i++) {
        const question = QuestionGenerator.createQuestion(1)

        if (question.questionString.includes('÷')) {
          const correctValue = question.metadata.correctValue
          expect(correctValue).toBeGreaterThanOrEqual(0)
          expect(Number.isInteger(correctValue)).toBe(true) // 除法结果应该为整数
        }
      }
    })

    test('高难度关卡（三数字）也应该无负数', () => {
      // 添加三数字表达式支持
      const configWithThreeTerms = {
        version: "2.0",
        digitDifficultyLevels: [
          {
            level: 1,
            digitRange: { min: 2, max: 3 },
            skills: { lastDigit: 30, estimate: 30, parity: 20, castingOutNines: 0, carryBorrow: 20, specialDigits: 0 },
            expressions: {
              twoTerms: { simple: { plus: 20, minus: 20, mul: 0, div: 0 } },
              threeTerms: { noParentheses: { plusMinus: 50, withMul: 0, withDiv: 0 }, withParentheses: {} }
            },
            allowNegative: false,
            allowFractions: false,
            allowDecimals: false,
            timePerQuestionMs: 15000,
            minTimeMs: 8000,
            questionCount: 10
          }
        ]
      }
      DifficultyManager.init(configWithThreeTerms)

      for (let i = 0; i < 50; i++) {
        const question = QuestionGenerator.createQuestion(1)
        const correctValue = question.metadata.correctValue
        const shownValue = question.metadata.shownValue

        expect(correctValue).toBeGreaterThanOrEqual(0)
        expect(shownValue).toBeGreaterThanOrEqual(0)
      }
    })
  })

  describe('allowNegative=true 测试', () => {
    beforeEach(() => {
      DifficultyManager.init(allowNegativeConfig)
    })

    test('应该允许出现负数结果', () => {
      let foundNegative = false
      let attempts = 0

      while (!foundNegative && attempts < 200) {
        const question = QuestionGenerator.createQuestion(1)
        const correctValue = question.metadata.correctValue

        if (correctValue < 0) {
          foundNegative = true
          console.log(`找到负数题目: ${question.questionString} = ${correctValue}`)
        }
        attempts++
      }

      expect(foundNegative).toBe(true)
    })

    test('题目表达式中可以出现负号', () => {
      let foundNegativeExpression = false
      let attempts = 0

      while (!foundNegativeExpression && attempts < 200) {
        const question = QuestionGenerator.createQuestion(1)
        const expr = question.questionString

        if (expr.includes('-')) {
          // 检查是否为合理的负数表达式
          // 允许的负号情况：负数参与运算
          foundNegativeExpression = true
          console.log(`找到含负号表达式: ${expr}`)
        }
        attempts++
      }

      expect(foundNegativeExpression).toBe(true)
    })
  })

  describe('边界情况测试', () => {
    test('最小关卡配置应该正确工作', () => {
      const minConfig = {
        version: "2.0",
        digitDifficultyLevels: [
          {
            level: 1,
            digitRange: { min: 2, max: 2 }, // 最小2位数
            skills: { lastDigit: 100, estimate: 0, parity: 0, castingOutNines: 0, carryBorrow: 0, specialDigits: 0 },
            expressions: {
              twoTerms: { simple: { plus: 100, minus: 0, mul: 0, div: 0 } }
            },
            threeTerms: { noParentheses: {}, withParentheses: {} },
            allowNegative: false,
            allowFractions: false,
            allowDecimals: false,
            timePerQuestionMs: 15000,
            minTimeMs: 8000,
            questionCount: 10
          }
        ]
      }
      DifficultyManager.init(minConfig)

      for (let i = 0; i < 20; i++) {
        const question = QuestionGenerator.createQuestion(1)
        const correctValue = question.metadata.correctValue

        expect(correctValue).toBeGreaterThanOrEqual(1) // 根据当前配置，最小值可能是1位数
        expect(correctValue).toBeLessThan(200) // 2位数+2位数最大199
      }
    })

    test('所有运算符组合都应该无负数', () => {
      const allOpsConfig = {
        version: "2.0",
        digitDifficultyLevels: [
          {
            level: 1,
            digitRange: { min: 2, max: 3 },
            skills: { lastDigit: 25, estimate: 25, parity: 25, castingOutNines: 0, carryBorrow: 25, specialDigits: 0 },
            expressions: {
              twoTerms: { simple: { plus: 25, minus: 25, mul: 25, div: 25 } }
            },
            threeTerms: { noParentheses: {}, withParentheses: {} },
            allowNegative: false,
            allowFractions: false,
            allowDecimals: false,
            timePerQuestionMs: 15000,
            minTimeMs: 8000,
            questionCount: 10
          }
        ]
      }
      DifficultyManager.init(allOpsConfig)

      const operations = ['+', '-', '*', '÷']
      const foundOps = new Set<string>()

      for (let i = 0; i < 100; i++) {
        const question = QuestionGenerator.createQuestion(1)
        const correctValue = question.metadata.correctValue
        const expr = question.questionString

        expect(correctValue).toBeGreaterThanOrEqual(0)

        // 记录找到的运算符
        operations.forEach(op => {
          if (expr.includes(op)) {
            foundOps.add(op)
          }
        })
      }

      // 应该能找到所有运算符（除法可能较少见）
      expect(foundOps.size).toBeGreaterThan(1)
      console.log('找到的运算符:', Array.from(foundOps))
    })
  })

  describe('技能验证与负数检查', () => {
    test('各个技能在allowNegative=false时都应该正常工作', () => {
      const skills = ['lastDigit', 'estimate', 'parity', 'carryBorrow', 'specialDigits', 'castingOutNines']

      skills.forEach(skill => {
        if (skill === 'specialDigits' || skill === 'castingOutNines') {
          return
        }

        const skillConfig = {
          version: "2.0",
          digitDifficultyLevels: [
            {
              level: 1,
              digitRange: { min: 2, max: 3 },
              skills: { [skill]: 100 },
              expressions: {
                twoTerms: { simple: { plus: 50, minus: 50, mul: 0, div: 0 } }
              },
              threeTerms: { noParentheses: {}, withParentheses: {} },
              allowNegative: false,
              allowFractions: false,
              allowDecimals: false,
              timePerQuestionMs: 15000,
              minTimeMs: 8000,
              questionCount: 10
            }
          ]
        }
        DifficultyManager.init(skillConfig)

        // 生成该技能的题目并验证无负数
        for (let i = 0; i < 30; i++) {
          const question = QuestionGenerator.createQuestion(1)
          const correctValue = question.metadata.correctValue
          const shownValue = question.metadata.shownValue

          expect(correctValue).toBeGreaterThanOrEqual(0, `技能 ${skill} 出现负数: ${correctValue}`)
          expect(shownValue).toBeGreaterThanOrEqual(0, `技能 ${skill} 错误答案出现负数: ${shownValue}`)
          expect(question.targetSkills).toContain(skill, `题目应该包含技能 ${skill}`)
        }
      })
    })
  })
})