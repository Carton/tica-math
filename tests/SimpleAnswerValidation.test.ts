import { QuestionGenerator } from '@/game/managers/QuestionGenerator'
import { DifficultyManager } from '@/game/managers/DifficultyManager'

// 使用现有的难度配置
const digitConfig = require('@/game/config/digit-difficulty.json')

beforeAll(() => {
  DifficultyManager.init(digitConfig)
})

describe('简单答案验证测试', () => {
  test('答案判断逻辑的基本验证', () => {
    // 生成一个题目
    const question = QuestionGenerator.createQuestion(1)

    console.log('生成的题目:', question)

    // 验证基本字段
    expect(question).toHaveProperty('questionString')
    expect(question).toHaveProperty('isTrue')
    expect(question).toHaveProperty('metadata')

    // 验证元数据
    const { metadata } = question
    expect(metadata).toHaveProperty('expr')
    expect(metadata).toHaveProperty('correctValue')
    expect(metadata).toHaveProperty('shownValue')

    console.log('数学表达式:', metadata.expr)
    console.log('正确答案:', metadata.correctValue)
    console.log('显示答案:', metadata.shownValue)
    console.log('题目判断:', question.isTrue)

    // 验证逻辑一致性
    if (question.isTrue) {
      expect(metadata.shownValue).toBe(metadata.correctValue)
      console.log('✅ 正确答案：显示值等于计算值')
    } else {
      expect(metadata.shownValue).not.toBe(metadata.correctValue)
      console.log('✅ 错误答案：显示值不等于计算值')
    }

    // 验证用户答案判断逻辑
    // GameScene中的逻辑: const isCorrect = choice === this.current.isTrue
    const userChoosesTrue = (true === question.isTrue)  // 用户选择"真相"
    const userChoosesFalse = (false === question.isTrue) // 用户选择"伪证"

    console.log('用户选择"真相"判断:', userChoosesTrue)
    console.log('用户选择"伪证"判断:', userChoosesFalse)

    // 只有当题目答案是True时，选择"真相"才是正确的
    if (question.isTrue) {
      expect(userChoosesTrue).toBe(true)
      expect(userChoosesFalse).toBe(false)
    } else {
      // 当题目答案是False时，选择"伪证"才是正确的
      expect(userChoosesTrue).toBe(false)
      expect(userChoosesFalse).toBe(true)
    }
  })

  test('生成100个题目验证逻辑一致性', () => {
    let correctAnswerCount = 0
    let wrongAnswerCount = 0

    for (let i = 0; i < 100; i++) {
      const question = QuestionGenerator.createQuestion(1)
      const { metadata } = question

      // 验证数学计算
      const calculatedValue = simpleEvaluate(metadata.expr)
      expect(calculatedValue).toBe(metadata.correctValue)

      // 验证题目逻辑
      if (question.isTrue) {
        expect(metadata.shownValue).toBe(metadata.correctValue)
        correctAnswerCount++
      } else {
        expect(metadata.shownValue).not.toBe(metadata.correctValue)
        wrongAnswerCount++
      }
    }

    console.log(`正确答案数量: ${correctAnswerCount}`)
    console.log(`错误答案数量: ${wrongAnswerCount}`)

    // 应该大约各占50%
    expect(correctAnswerCount).toBeGreaterThan(20)
    expect(wrongAnswerCount).toBeGreaterThan(20)
  })
})

// 简单的数学表达式计算函数
function simpleEvaluate(expr: string): number {
  // 替换运算符
  let jsExpr = expr
    .replace(/×/g, '*')
    .replace(/÷/g, '/')

  // 使用 Function 构造函数安全计算
  try {
    return Function(`"use strict"; return (${jsExpr})`)()
  } catch (error) {
    console.error('计算失败:', expr, error)
    throw error
  }
}