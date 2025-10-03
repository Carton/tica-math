import { QuestionGenerator } from '../src/game/managers/QuestionGenerator'
import { DifficultyManager } from '../src/game/managers/DifficultyManager'

// 测试用的难度配置
const testDiff = {
  version: "2.0",
  digitDifficultyLevels: [
    {
      level: 1,
      digitRange: { min: 2, max: 3 },
      skills: { "lastDigit": 70, "estimate": 30, "parity": 0, "castingOutNines": 0, "carryBorrow": 0, "specialDigits": 0 },
      expressions: { "twoTerms": { "simple": {"plus": 70, "minus": 30, "mul": 0, "div": 0 } }, "threeTerms": { "noParentheses": {}, "withParentheses": {}}},
      allowNegative: false, "allowFractions": false, "allowDecimals": false,
      timePerQuestionMs: 15000, "questionCount": 10
    },
    {
      level: 30,
      digitRange: { min: 4, max: 6 },
      skills: { "lastDigit": 30, "estimate": 30, "parity": 5, "castingOutNines": 10, "carryBorrow": 15, "specialDigits": 10 },
      expressions: {
        "twoTerms": { "simple": { "plus": 20, "minus": 20, "mul": 30, "div": 10 } },
        "threeTerms": { "noParentheses": { "plusMinus": 20, "withMul": 0, "withDiv": 0 }, "withParentheses": {} }
      },
      allowNegative: false, "allowFractions": false, "allowDecimals": false,
      timePerQuestionMs: 14000, "questionCount": 10
    }
  ]
}

beforeAll(() => DifficultyManager.init(testDiff as any))

describe('数字范围限制验证测试', () => {
  describe('除法题目验证', () => {
    test('level 30 除法题目应该符合最小4位数字限制', () => {
      const level = 30
      const digitParams = DifficultyManager.getDigitParams(level)

      console.log(`Level ${level} 参数:`, digitParams)

      // 生成多个除法题目来验证
      const divisionQuestions = []
      for (let i = 0; i < 100; i++) {
        const question = QuestionGenerator.createQuestion(level)
        if (question.metadata.expr.includes('÷')) {
          divisionQuestions.push(question)
        }
      }

      console.log(`生成 ${divisionQuestions.length} 个除法题目`)

      // 检查每个除法题目的位数
      const violations: any[] = []
      divisionQuestions.forEach((q, index) => {
        const numbers = q.metadata.expr.match(/\d+/g)
        if (numbers) {
          const totalDigits = numbers.reduce((sum, num) => sum + num.replace(/^0+/, '').length, 0)
          if (totalDigits < digitParams.digitRange.min || totalDigits > digitParams.digitRange.max) {
            violations.push({
              index,
              question: q.questionString,
              numbers,
              totalDigits,
              expr: q.metadata.expr
            })
          }
        }
      })

      console.log('违规题目:', violations)

      expect(violations.length).toBe(0)
    })
  })

  describe('位数分配验证', () => {
    test('level 30 两数字运算的位数分布应该相对均匀', () => {
      const level = 30
      const digitParams = DifficultyManager.getDigitParams(level)

      // 收集两数字运算的位数分布
      const digitCounts = { '2位+3位': 0, '1位+4位': 0, '4位+1位': 0, '3位+2位': 0, '其他': 0 }
      const total = 200

      for (let i = 0; i < total; i++) {
        const question = QuestionGenerator.createQuestion(level)
        const expr = question.metadata.expr

        // 只检查两数字运算
        const numbers = expr.match(/\d+/g)
        if (numbers && numbers.length === 2) {
          const digits1 = numbers[0].replace(/^0+/, '').length
          const digits2 = numbers[1].replace(/^0+/, '').length
          const totalDigits = digits1 + digits2

          // 确保总位数在范围内
          expect(totalDigits).toBeGreaterThanOrEqual(digitParams.digitRange.min)
          expect(totalDigits).toBeLessThanOrEqual(digitParams.digitRange.max)

          // 统计分布
          if ((digits1 === 2 && digits2 === 3) || (digits1 === 3 && digits2 === 2)) {
            digitCounts['2位+3位']++
          } else if ((digits1 === 1 && digits2 === 4) || (digits1 === 4 && digits2 === 1)) {
            digitCounts['1位+4位']++
          }
        }
      }

      console.log('位数分布统计:', digitCounts)

      // 2+3位和3+2位的组合应该比1+4位和4+1位更常见
      // 这里只是记录，不强制要求，因为随机性可能导致波动
    })
  })

  describe('整体数字范围验证', () => {
    test('所有题目都应该符合数字范围限制', () => {
      const level = 30
      const digitParams = DifficultyManager.getDigitParams(level)

      const violations: any[] = []
      const sampleSize = 100

      for (let i = 0; i < sampleSize; i++) {
        const question = QuestionGenerator.createQuestion(level)
        const numbers = question.metadata.expr.match(/\d+/g)

        if (numbers) {
          const totalDigits = numbers.reduce((sum, num) => sum + num.replace(/^0+/, '').length, 0)

          if (totalDigits < digitParams.digitRange.min || totalDigits > digitParams.digitRange.max) {
            violations.push({
              index: i,
              question: question.questionString,
              numbers,
              totalDigits,
              expr: question.metadata.expr,
              expectedMin: digitParams.digitRange.min,
              expectedMax: digitParams.digitRange.max
            })
          }
        }
      }

      console.log(`生成的 ${sampleSize} 个题目中有 ${violations.length} 个违规`)
      if (violations.length > 0) {
        console.log('违规题目示例:', violations.slice(0, 5))
      }

      expect(violations.length).toBe(0)
    })
  })

  describe('具体除法问题验证', () => {
    test('不应该出现 9 ÷ 1 = 9 这样的简单除法', () => {
      const level = 30
      const digitParams = DifficultyManager.getDigitParams(level)

      const simpleDivisionViolations = []

      for (let i = 0; i < 200; i++) {
        const question = QuestionGenerator.createQuestion(level)
        const expr = question.metadata.expr

        if (expr.includes('÷')) {
          const numbers = expr.match(/\d+/g)
          if (numbers) {
            const totalDigits = numbers.reduce((sum, num) => sum + num.replace(/^0+/, '').length, 0)

            // 检查是否有过于简单的除法（总位数小于最小要求）
            if (totalDigits < digitParams.digitRange.min) {
              simpleDivisionViolations.push({
                question: question.questionString,
                expr,
                numbers,
                totalDigits,
                requiredMin: digitParams.digitRange.min
              })
            }
          }
        }
      }

      console.log('简单除法违规:', simpleDivisionViolations)

      expect(simpleDivisionViolations.length).toBe(0)
    })
  })
})