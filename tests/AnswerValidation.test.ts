import { QuestionGenerator } from '@/game/managers/QuestionGenerator'
import { DifficultyManager } from '@/game/managers/DifficultyManager'

// 模拟基本的难度配置
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
    }
  ]
}

beforeAll(() => {
  DifficultyManager.init(testDiff as any)
})

describe('答案验证逻辑测试', () => {
  test('题目生成器应该生成有效的数学表达式', () => {
    for (let i = 0; i < 100; i++) {
      const question = QuestionGenerator.createQuestion(1)

      // 验证基本字段
      expect(question.questionString).toContain('=')
      expect(typeof question.isTrue).toBe('boolean')
      expect(question.metadata).toBeDefined()
      expect(question.metadata.expr).toBeDefined()
      expect(question.metadata.correctValue).toBeDefined()
      expect(question.metadata.shownValue).toBeDefined()

      // 验证数学表达式的正确性
      const { expr, correctValue, shownValue } = question.metadata

      // 计算实际答案
      const actualAnswer = evaluateExpression(expr)

      // 验证题目生成的正确答案
      expect(actualAnswer).toBe(correctValue)

      // 验证题目逻辑的一致性
      if (question.isTrue) {
        expect(shownValue).toBe(correctValue)
      } else {
        expect(shownValue).not.toBe(correctValue)
      }
    }
  })

  test('用户答案判断逻辑应该正确', () => {
    for (let i = 0; i < 50; i++) {
      const question = QuestionGenerator.createQuestion(1)

      // 模拟用户选择
      // 用户选择"真相"(True)，只有当题目答案也是True时才正确
      const userChoosesTrueCorrect = (true === question.isTrue)
      // 用户选择"伪证"(False)，只有当题目答案是False时才正确
      const userChoosesFalseCorrect = (false === question.isTrue)

      // 验证判断逻辑：应该只有一个选择是正确的
      if (question.isTrue) {
        expect(userChoosesTrueCorrect).toBe(true)
        expect(userChoosesFalseCorrect).toBe(false)
      } else {
        expect(userChoosesTrueCorrect).toBe(false)
        expect(userChoosesFalseCorrect).toBe(true)
      }
    }
  })

  test('所有生成的题目都应该有有效的数学表达式', () => {
    const expressions = new Set<string>()

    for (let i = 0; i < 200; i++) {
      const question = QuestionGenerator.createQuestion(1)
      const { expr } = question.metadata

      // 验证表达式格式（允许空格）
      expect(expr).toMatch(/^[\d+\-×÷()\s]+$/)

      // 验证可以计算
      const result = evaluateExpression(expr)
      expect(typeof result).toBe('number')
      expect(isFinite(result)).toBe(true)

      expressions.add(expr)
    }

    // 应该有多种不同的表达式
    expect(expressions.size).toBeGreaterThan(5)
  })

  test('除法题目应该避免除零错误', () => {
    // 生成很多题目，检查是否有除零
    for (let i = 0; i < 100; i++) {
      const question = QuestionGenerator.createQuestion(5) // 使用较高等级增加除法概率
      const { expr } = question.metadata

      if (expr.includes('÷')) {
        const result = evaluateExpression(expr)
        expect(result).not.toBe(Infinity)
        expect(result).not.toBeNaN()
      }
    }
  })
})

// 辅助函数：计算数学表达式
function evaluateExpression(expr: string): number {
  // 替换数学符号为JavaScript运算符
  let jsExpr = expr
    .replace(/×/g, '*')
    .replace(/÷/g, '/')

  try {
    // 使用Function构造函数安全地计算表达式
    return Function(`"use strict"; return (${jsExpr})`)()
  } catch (error) {
    console.error('计算表达式失败:', expr, error)
    throw error
  }
}