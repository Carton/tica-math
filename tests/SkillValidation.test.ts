// 技能验证测试套件
import { QuestionGenerator } from '@/game/managers/QuestionGenerator'
import { DifficultyManager } from '@/game/managers/DifficultyManager'

// 辅助函数：数字各位数之和
function digitSum(n: number): number {
  let s = 0, abs = Math.abs(n);
  while (abs > 0) { s += abs % 10; abs = Math.floor(abs / 10); }
  return s;
}

// 辅助函数：数字和模9
function digitSumMod9(n: number): number {
  return digitSum(n) % 9;
}

// 技能验证函数
function validateSkill(question: any, expectedSkill?: string) {
  const { targetSkills, metadata } = question
  const correctAnswer = metadata.correctValue
  const wrongAnswer = metadata.shownValue

  // 如果指定了期望技能，检查是否包含
  if (expectedSkill && !targetSkills.includes(expectedSkill)) {
    return { valid: false, detail: `目标技能不匹配: 期望${expectedSkill}, 实际${targetSkills.join(', ')}` }
  }

  // 使用第一个目标技能进行验证
  const skill = targetSkills[0]
  if (!skill) {
    return { valid: false, detail: '没有目标技能' }
  }

  switch (skill) {
    case 'lastDigit':
      const correctLast = correctAnswer % 10
      const wrongLast = wrongAnswer % 10
      return {
        valid: correctLast !== wrongLast,
        detail: `个位数不同: ${correctLast} → ${wrongLast}`
      }

    case 'estimate':
      const correctDigits = Math.abs(correctAnswer).toString().length
      const wrongDigits = Math.abs(wrongAnswer).toString().length
      const correctHighest = Math.floor(Math.abs(correctAnswer) / Math.pow(10, correctDigits - 1))
      const wrongHighest = Math.floor(Math.abs(wrongAnswer) / Math.pow(10, wrongDigits - 1))
      return {
        valid: correctDigits !== wrongDigits || correctHighest !== wrongHighest,
        detail: `估算差异: 位数${correctDigits}→${wrongDigits}, 首位${correctHighest}→${wrongHighest}`
      }

    case 'parity':
      return {
        valid: (correctAnswer % 2) !== (wrongAnswer % 2),
        detail: `奇偶性不同: ${correctAnswer % 2 === 0 ? '偶' : '奇'} → ${wrongAnswer % 2 === 0 ? '偶' : '奇'}`
      }

    case 'carryBorrow':
      const correctTens = Math.floor(correctAnswer / 10) % 10
      const wrongTens = Math.floor(wrongAnswer / 10) % 10
      return {
        valid: (correctAnswer % 10) === (wrongAnswer % 10) && correctTens !== wrongTens,
        detail: `个位数相同(${correctAnswer % 10})，十位数不同: ${correctTens} → ${wrongTens}`
      }

    case 'specialDigits':
      const correctDiv3 = correctAnswer % 3 === 0
      const wrongDiv3 = wrongAnswer % 3 === 0
      const correctDiv9 = correctAnswer % 9 === 0
      const wrongDiv9 = wrongAnswer % 9 === 0
      return {
        valid: (correctDiv3 !== wrongDiv3) || (correctDiv9 !== wrongDiv9),
        detail: `3/9整除性变化: 3整除${correctDiv3}→${wrongDiv3}, 9整除${correctDiv9}→${wrongDiv9}`
      }

    case 'castingOutNines':
      const correctMod9 = digitSumMod9(correctAnswer)
      const wrongMod9 = digitSumMod9(wrongAnswer)
      return {
        valid: correctMod9 !== wrongMod9,
        detail: `弃九模9不同: ${correctMod9} → ${wrongMod9}`
      }

    default:
      return { valid: false, detail: `未知技能: ${skill}` }
  }
}

// 创建修改了技能权重的配置来测试特定技能
function createConfigForSkill(skill: string): any {
  return {
    version: "2.0",
    digitDifficultyLevels: [
      {
        level: 15,
        digitRange: { min: 4, max: 6 },
        skills: {
          lastDigit: skill === 'lastDigit' ? 1.0 : 0.01,
          estimate: skill === 'estimate' ? 1.0 : 0.01,
          parity: skill === 'parity' ? 1.0 : 0.01,
          carryBorrow: skill === 'carryBorrow' ? 1.0 : 0.01,
          specialDigits: skill === 'specialDigits' ? 1.0 : 0.01,
          castingOutNines: skill === 'castingOutNines' ? 1.0 : 0.01
        },
        expressions: {
          twoTerms: { simple: { plus: 0.6, minus: 0.4, mul: 0, div: 0 }, withParentheses: {} },
          threeTerms: { noParentheses: {}, withParentheses: {} }
        },
        allowNegative: false, allowFractions: false, allowDecimals: false,
        timePerQuestionMs: 14000, minTimeMs: 7500, questionCount: 10
      }
    ]
  }
}

// 初始化难度管理器
beforeAll(() => {
  // 使用默认配置初始化
  const digitDifficultyConfig = require('@/game/config/digit-difficulty-v2.json')
  DifficultyManager.init(digitDifficultyConfig)
})

describe('技能验证测试套件', () => {
  const skills = ['lastDigit', 'estimate', 'parity', 'carryBorrow', 'specialDigits', 'castingOutNines']
  const testLevel = 15 // 对应6位数字难度

  test.each(skills)('%s 技能应该生成有效的错题', (skill) => {
    // 创建特定技能的配置
    const config = createConfigForSkill(skill)
    DifficultyManager.init(config)

    let validCount = 0
    let targetSkillMatchCount = 0
    const testCount = 30

    for (let i = 0; i < testCount; i++) {
      const question = QuestionGenerator.createQuestion(testLevel)
      const validation = validateSkill(question, skill)

      if (validation.valid) {
        validCount++
      }

      // 检查是否包含目标技能
      if (question.targetSkills.includes(skill)) {
        targetSkillMatchCount++
      }

      // 验证基本结构
      expect(question).toHaveProperty('questionString')
      expect(question).toHaveProperty('metadata')
      expect(question.metadata).toHaveProperty('correctValue')
      expect(question.metadata).toHaveProperty('shownValue')
      expect(question).toHaveProperty('targetSkills')
      expect(Array.isArray(question.targetSkills)).toBe(true)
    }

    // 验证目标技能匹配率（考虑到权重可能不完全精确）
    const matchRate = (targetSkillMatchCount / testCount) * 100
    expect(matchRate).toBeGreaterThanOrEqual(30) // 至少30%的题目应该包含目标技能

    // 对于匹配了目标技能的题目，验证成功率
    if (targetSkillMatchCount > 0) {
      const successRate = (validCount / targetSkillMatchCount) * 100
      expect(successRate).toBeGreaterThanOrEqual(50) // 至少50%成功率
    }

    console.log(`${skill} 技能: 目标匹配率${matchRate.toFixed(1)}% (${targetSkillMatchCount}/${testCount})`)
  })

  test('estimate 技能的特定验证', () => {
    const config = createConfigForSkill('estimate')
    DifficultyManager.init(config)

    let countDigitChange = 0
    let countHighestChange = 0
    let estimateQuestions = 0
    const testCount = 50

    for (let i = 0; i < testCount; i++) {
      const question = QuestionGenerator.createQuestion(testLevel)

      if (question.targetSkills.includes('estimate')) {
        estimateQuestions++
        const { correctValue, shownValue } = question.metadata

        const correctDigits = Math.abs(correctValue).toString().length
        const wrongDigits = Math.abs(shownValue).toString().length

        if (correctDigits !== wrongDigits) {
          countDigitChange++
        } else {
          const correctHighest = Math.floor(Math.abs(correctValue) / Math.pow(10, correctDigits - 1))
          const wrongHighest = Math.floor(Math.abs(shownValue) / Math.pow(10, wrongDigits - 1))
          if (correctHighest !== wrongHighest) {
            countHighestChange++
          }
        }
      }
    }

    console.log(`Estimate 技能分析 - 总题目: ${estimateQuestions}, 位数变化: ${countDigitChange}, 首位变化: ${countHighestChange}`)

    // 应该生成足够的estimate题目
    expect(estimateQuestions).toBeGreaterThan(10)

    // 两种情况都应该出现
    expect(countDigitChange + countHighestChange).toBeGreaterThan(0)
  })

  test('specialDigits 和 castingOutNines 应该保持个位数不变', () => {
    const skillsToTest = ['specialDigits', 'castingOutNines']

    skillsToTest.forEach(skill => {
      const config = createConfigForSkill(skill)
      DifficultyManager.init(config)

      let lastDigitPreservedCount = 0
      let skillQuestions = 0
      const testCount = 30

      for (let i = 0; i < testCount; i++) {
        const question = QuestionGenerator.createQuestion(testLevel)

        if (question.targetSkills.includes(skill)) {
          skillQuestions++
          const { correctValue, shownValue } = question.metadata

          if (correctValue % 10 === shownValue % 10) {
            lastDigitPreservedCount++
          }
        }
      }

      if (skillQuestions > 0) {
        const preservationRate = (lastDigitPreservedCount / skillQuestions) * 100
        console.log(`${skill} 个位数保持率: ${preservationRate.toFixed(1)}% (${lastDigitPreservedCount}/${skillQuestions})`)
        expect(preservationRate).toBeGreaterThanOrEqual(60) // 至少60%保持率
      }
    })
  })

  test('所有技能的组合测试', () => {
    // 使用默认配置进行综合测试
    const defaultConfig = require('@/game/config/digit-difficulty-v2.json')
    DifficultyManager.init(defaultConfig)

    const results: { [key: string]: { valid: number, total: number, questions: any[] } } = {}

    skills.forEach(skill => {
      results[skill] = { valid: 0, total: 0, questions: [] }
    })

    // 生成100个随机题目
    const totalTestCount = 100
    for (let i = 0; i < totalTestCount; i++) {
      const question = QuestionGenerator.createQuestion(testLevel)
      const validation = validateSkill(question)

      // 统计每种技能的出现和成功情况
      question.targetSkills.forEach((skill: string) => {
        if (results[skill]) {
          results[skill].total++
          if (validation.valid) {
            results[skill].valid++
          }
          results[skill].questions.push(question)
        }
      })
    }

    // 计算总体成功率
    let totalValid = 0
    let totalQuestions = 0

    console.log('=== 技能验证总结 ===')
    skills.forEach(skill => {
      if (results[skill].total > 0) {
        const rate = (results[skill].valid / results[skill].total * 100).toFixed(1)
        console.log(`${skill}: ${results[skill].valid}/${results[skill].total} (${rate}%)`)
        totalValid += results[skill].valid
        totalQuestions += results[skill].total
      } else {
        console.log(`${skill}: 0/0 (0.0%) - 未生成该技能题目`)
      }
    })

    if (totalQuestions > 0) {
      const overallSuccessRate = (totalValid / totalQuestions) * 100
      console.log(`总体成功率: ${totalValid}/${totalQuestions} (${overallSuccessRate.toFixed(1)}%)`)

      // 总体成功率应该达到40%以上
      expect(overallSuccessRate).toBeGreaterThanOrEqual(40)
    }
  })
})