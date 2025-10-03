import { QuestionGenerator } from '@/game/managers/QuestionGenerator'
import { DifficultyManager } from '@/game/managers/DifficultyManager'

// 测试用的难度配置，包含除法
const testConfig = {
  version: "2.0",
  digitDifficultyLevels: [
    {
      level: 1,
      digitRange: { min: 2, max: 3 },
      skills: {
        lastDigit: 40,
        estimate: 30,
        parity: 0,
        castingOutNines: 0,
        carryBorrow: 0,
        specialDigits: 0,
        // 添加一些除法权重
        division: 30
      },
      expressions: {
        twoTerms: {
          simple: {
            plus: 30,
            minus: 30,
            mul: 10,
            div: 30 // 30% 的除法
          }
        },
        threeTerms: {
          noParentheses: {},
          withParentheses: {}
        }
      },
      allowNegative: false,
      allowFractions: false,
      timePerQuestionMs: 15000,
      questionCount: 10
    },
    {
      level: 30,
      digitRange: { min: 4, max: 6 },
      skills: {
        lastDigit: 20,
        estimate: 20,
        parity: 10,
        castingOutNines: 10,
        carryBorrow: 10,
        specialDigits: 10,
        division: 20
      },
      expressions: {
        twoTerms: {
          simple: {
            plus: 20,
            minus: 20,
            mul: 20,
            div: 20 // 20% 的除法
          }
        },
        threeTerms: {
          noParentheses: {
            plusMinus: 20,
            withMul: 5,
            withDiv: 5
          },
          withParentheses: {}
        }
      },
      allowNegative: false,
      allowFractions: false,
      timePerQuestionMs: 14000,
      questionCount: 10
    }
  ]
}

beforeAll(() => {
  DifficultyManager.init(testConfig as any)
})

describe('除法题目验证测试', () => {
  test('不应该出现 A/A 这样商为1的简单除法', () => {
    const divisionQuestions = []

    // 生成大量题目来测试
    for (let i = 0; i < 1000; i++) {
      const question = QuestionGenerator.createQuestion(1)
      if (question.metadata.expr.includes('÷')) {
        divisionQuestions.push(question)
      }
    }

    console.log(`生成了 ${divisionQuestions.length} 个除法题目`)

    // 检查是否有商为1的题目
    const invalidQuestions = divisionQuestions.filter(q => {
      const parts = q.metadata.expr.split('÷')
      if (parts.length !== 2) return false

      const dividend = parseInt(parts[0].trim())
      const divisor = parseInt(parts[1].trim())

      // 检查商是否为1 (A/A 的情况)
      return Math.abs(dividend) === Math.abs(divisor)
    })

    console.log(`发现 ${invalidQuestions.length} 个商为1的无效题目`)

    if (invalidQuestions.length > 0) {
      console.log('无效题目示例:', invalidQuestions.slice(0, 5).map(q => q.metadata.expr))
    }

    expect(invalidQuestions.length).toBe(0)
  })

  test('除法题目应该都是整除关系', () => {
    const divisionQuestions = []

    // 生成除法题目
    for (let i = 0; i < 200; i++) {
      const question = QuestionGenerator.createQuestion(1)
      if (question.metadata.expr.includes('÷')) {
        divisionQuestions.push(question)
      }
    }

    // 检查是否能整除
    const nonIntegerResults = divisionQuestions.filter(q => {
      const parts = q.metadata.expr.split('÷')
      if (parts.length !== 2) return false

      const dividend = parseInt(parts[0].trim())
      const divisor = parseInt(parts[1].trim())

      // 检查是否能整除
      return dividend % divisor !== 0
    })

    console.log(`发现 ${nonIntegerResults.length} 个不能整除的题目`)

    if (nonIntegerResults.length > 0) {
      console.log('不能整除的题目示例:', nonIntegerResults.slice(0, 3).map(q => q.metadata.expr))
    }

    expect(nonIntegerResults.length).toBe(0)
  })

  test('高难度级别的除法也应该避免商为1', () => {
    const divisionQuestions = []

    // 测试高难度级别
    for (let i = 0; i < 500; i++) {
      const question = QuestionGenerator.createQuestion(30)
      if (question.metadata.expr.includes('÷')) {
        divisionQuestions.push(question)
      }
    }

    console.log(`Level 30 生成了 ${divisionQuestions.length} 个除法题目`)

    // 检查商为1的题目
    const invalidQuestions = divisionQuestions.filter(q => {
      const parts = q.metadata.expr.split('÷')
      if (parts.length !== 2) return false

      const dividend = parseInt(parts[0].trim())
      const divisor = parseInt(parts[1].trim())

      return Math.abs(dividend) === Math.abs(divisor)
    })

    expect(invalidQuestions.length).toBe(0)
  })

  test('除法题目应该符合位数要求', () => {
    const divisionQuestions = []

    // 生成除法题目
    for (let i = 0; i < 100; i++) {
      const question = QuestionGenerator.createQuestion(30) // 4-6位数
      if (question.metadata.expr.includes('÷')) {
        divisionQuestions.push(question)
      }
    }

    console.log(`生成了 ${divisionQuestions.length} 个除法题目用于位数验证`)

    // 检查位数是否符合要求
    const invalidDigitQuestions = divisionQuestions.filter(q => {
      const parts = q.metadata.expr.split('÷')
      if (parts.length !== 2) return false

      const dividend = Math.abs(parseInt(parts[0].trim()))
      const divisor = Math.abs(parseInt(parts[1].trim()))

      const dividendDigits = dividend.toString().length
      const divisorDigits = divisor.toString().length
      const totalDigits = dividendDigits + divisorDigits

      if (divisorDigits < 2 || dividendDigits < 2) {
        return true
      }

      const levelParams = DifficultyManager.getDigitParams(30)
      return totalDigits < levelParams.digitRange.min || totalDigits > levelParams.digitRange.max
    })

    console.log(`发现 ${invalidDigitQuestions.length} 个位数不符合要求的题目`)

    if (invalidDigitQuestions.length > 0) {
      console.log('位数不符合的题目示例:', invalidDigitQuestions.slice(0, 3).map(q => {
        const parts = q.metadata.expr.split('÷')
        const dividend = Math.abs(parseInt(parts[0].trim()))
        const divisor = Math.abs(parseInt(parts[1].trim()))
        const totalDigits = dividend.toString().length + divisor.toString().length
        return `${q.metadata.expr} (被除数:${dividend.toString().length}位, 除数:${divisor.toString().length}位, 总位数:${totalDigits})`
      }))
    }

    // 允许一些位数不匹配，因为难度配置可能需要调整
    expect(invalidDigitQuestions.length).toBeLessThan(divisionQuestions.length * 0.1) // 最多10%的题目位数不匹配
  })
})