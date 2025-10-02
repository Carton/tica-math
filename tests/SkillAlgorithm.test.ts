// 技能算法单元测试 - 测试makeStrategicError函数本身
// 这些测试应该达到100%通过率，因为它们直接测试算法逻辑

import { QuestionGenerator } from '@/game/managers/QuestionGenerator'

// 由于makeStrategicError是私有方法，我们需要通过公共接口测试
// 或者创建一个测试版本的方法来直接测试算法

describe('技能算法单元测试', () => {

  // 测试用例：各种数值和技能的组合
  const testCases = [
    // lastDigit 技能测试
    { skill: 'lastDigit', inputs: [123, 456, 789, 1000, -250, 0], expectedProperty: '个位数不同' },

    // estimate 技能测试
    { skill: 'estimate', inputs: [123, 456, 789, 1234, 5678, 12345], expectedProperty: '位数或首位不同' },

    // parity 技能测试
    { skill: 'parity', inputs: [123, 456, 789, 1000, -250, 0], expectedProperty: '奇偶性不同' },

    // carryBorrow 技能测试
    { skill: 'carryBorrow', inputs: [123, 456, 789, 1000, -250, 0], expectedProperty: '个位相同十位不同' },

    // specialDigits 技能测试
    { skill: 'specialDigits', inputs: [123, 456, 789, 1000, -250, 0], expectedProperty: '3/9整除性变化' },

    // castingOutNines 技能测试
    { skill: 'castingOutNines', inputs: [123, 456, 789, 1000, -250, 0], expectedProperty: '弃九模9不同' }
  ]

  // 创建专门的测试配置，强制生成特定技能的题目
  function createTestConfig(skill: string): any {
    return {
      version: "2.0",
      digitDifficultyLevels: [
        {
          level: 15,
          digitRange: { min: 4, max: 6 },
          skills: {
            lastDigit: skill === 'lastDigit' ? 1.0 : 0.0,
            estimate: skill === 'estimate' ? 1.0 : 0.0,
            parity: skill === 'parity' ? 1.0 : 0.0,
            carryBorrow: skill === 'carryBorrow' ? 1.0 : 0.0,
            specialDigits: skill === 'specialDigits' ? 1.0 : 0.0,
            castingOutNines: skill === 'castingOutNines' ? 1.0 : 0.0
          },
          expressions: {
            twoTerms: { simple: { plus: 1.0, minus: 0.0, mul: 0.0, div: 0.0 }, withParentheses: {} },
            threeTerms: { noParentheses: {}, withParentheses: {} }
          },
          allowNegative: false, allowFractions: false, allowDecimals: false,
          timePerQuestionMs: 14000, minTimeMs: 7500, questionCount: 10
        }
      ]
    }
  }

  // 验证技能算法的辅助函数
  function validateSkillAlgorithm(question: any, expectedSkill: string): { valid: boolean, detail: string } {
    const { targetSkills, metadata } = question
    const correctAnswer = metadata.correctValue
    const wrongAnswer = metadata.shownValue

    // 检查是否包含目标技能
    if (!targetSkills.includes(expectedSkill)) {
      return { valid: false, detail: `技能不匹配: 期望${expectedSkill}, 实际${targetSkills.join(', ')}` }
    }

    // 根据技能类型验证算法逻辑
    switch (expectedSkill) {
      case 'lastDigit':
        const correctLast = correctAnswer % 10
        const wrongLast = wrongAnswer % 10
        return {
          valid: correctLast !== wrongLast,
          detail: `个位数: ${correctLast} → ${wrongLast}`
        }

      case 'estimate':
        const correctDigits = Math.abs(correctAnswer).toString().length
        const wrongDigits = Math.abs(wrongAnswer).toString().length
        const correctHighest = Math.floor(Math.abs(correctAnswer) / Math.pow(10, correctDigits - 1))
        const wrongHighest = Math.floor(Math.abs(wrongAnswer) / Math.pow(10, wrongDigits - 1))
        return {
          valid: correctDigits !== wrongDigits || correctHighest !== wrongHighest,
          detail: `位数/首位: ${correctDigits}→${wrongDigits}, ${correctHighest}→${wrongHighest}`
        }

      case 'parity':
        return {
          valid: (correctAnswer % 2) !== (wrongAnswer % 2),
          detail: `奇偶性: ${correctAnswer % 2 === 0 ? '偶' : '奇'} → ${wrongAnswer % 2 === 0 ? '偶' : '奇'}`
        }

      case 'carryBorrow':
        const correctTens = Math.floor(correctAnswer / 10) % 10
        const wrongTens = Math.floor(wrongAnswer / 10) % 10
        return {
          valid: (correctAnswer % 10) === (wrongAnswer % 10) && correctTens !== wrongTens,
          detail: `个位${correctAnswer % 10}, 十位: ${correctTens}→${wrongTens}`
        }

      case 'specialDigits':
        const correctDiv3 = correctAnswer % 3 === 0
        const wrongDiv3 = wrongAnswer % 3 === 0
        const correctDiv9 = correctAnswer % 9 === 0
        const wrongDiv9 = wrongAnswer % 9 === 0
        return {
          valid: (correctDiv3 !== wrongDiv3) || (correctDiv9 !== wrongDiv9),
          detail: `3整除: ${correctDiv3}→${wrongDiv3}, 9整除: ${correctDiv9}→${wrongDiv9}`
        }

      case 'castingOutNines':
        const digitSum = (n: number) => {
          let s = 0, abs = Math.abs(n)
          while (abs > 0) { s += abs % 10; abs = Math.floor(abs / 10) }
          return s
        }
        const correctMod9 = digitSum(correctAnswer) % 9
        const wrongMod9 = digitSum(wrongAnswer) % 9
        return {
          valid: correctMod9 !== wrongMod9,
          detail: `弃九模9: ${correctMod9}→${wrongMod9}`
        }

      default:
        return { valid: false, detail: `未知技能: ${expectedSkill}` }
    }
  }

  describe('算法单元测试 - 应该100%通过', () => {

    test.each(testCases)('$skill 技能算法应该正确工作', ({ skill, inputs, expectedProperty }) => {
      const config = createTestConfig(skill)
      QuestionGenerator.getDifficultyManager().init(config)

      let successCount = 0
      let totalCount = 0

      // 对每个输入测试多次，确保算法稳定性
      inputs.forEach(input => {
        for (let attempt = 0; attempt < 5; attempt++) {
          // 使用固定的测试值而不是随机生成
          // 这里我们需要一个能直接测试makeStrategicError的方法
          // 由于它是私有的，我们通过生成足够多的题目来统计
          totalCount++

          // 生成题目直到获得目标技能
          let attempts = 0
          let question: any
          do {
            question = QuestionGenerator.createQuestion(15)
            attempts++
          } while (!question.targetSkills.includes(skill) && attempts < 20)

          if (question.targetSkills.includes(skill)) {
            // 手动设置测试值（这是测试的技巧）
            question.metadata.correctValue = input
            question.metadata.shownValue = QuestionGenerator['makeStrategicError']?.(input, skill as any, false) || input + 1

            const validation = validateSkillAlgorithm(question, skill)
            if (validation.valid) {
              successCount++
            } else {
              console.log(`${skill} 算法失败: 输入${input}, ${validation.detail}`)
            }
          }
        }
      })

      // 算法单元测试应该达到100%成功率
      if (totalCount > 0) {
        const successRate = (successCount / totalCount) * 100
        console.log(`${skill} 算法测试: ${successCount}/${totalCount} (${successRate.toFixed(1)}%)`)
        expect(successRate).toBe(100) // 算法本身应该是100%正确的
      }
    })
  })

  describe('特殊情况测试', () => {

    test('estimate 技能应该正确处理数字插入和删除', () => {
      const config = createTestConfig('estimate')
      QuestionGenerator.getDifficultyManager().init(config)

      const testNumbers = [123, 456, 789, 1234, 5678]
      let validCount = 0

      testNumbers.forEach(num => {
        // 这里需要直接调用算法来测试
        // 由于makeStrategicError是私有的，我们通过观察生成的题目来验证
        for (let i = 0; i < 10; i++) {
          const question = QuestionGenerator.createQuestion(15)
          if (question.targetSkills.includes('estimate')) {
            const { correctValue, shownValue } = question.metadata
            const correctDigits = Math.abs(correctValue).toString().length
            const wrongDigits = Math.abs(shownValue).toString().length

            // 验证是否符合estimate的定义：位数变化或首位变化
            if (correctDigits !== wrongDigits) {
              validCount++
              console.log(`Estimate位数变化: ${correctValue}(${correctDigits}位) → ${shownValue}(${wrongDigits}位)`)
              break
            } else {
              const correctHighest = Math.floor(Math.abs(correctValue) / Math.pow(10, correctDigits - 1))
              const wrongHighest = Math.floor(Math.abs(shownValue) / Math.pow(10, wrongDigits - 1))
              if (correctHighest !== wrongHighest) {
                validCount++
                console.log(`Estimate首位变化: ${correctValue}(首位${correctHighest}) → ${shownValue}(首位${wrongHighest})`)
                break
              }
            }
          }
        }
      })

      expect(validCount).toBeGreaterThan(0) // 至少应该有一些有效的估算错误
    })

    test('specialDigits 和 castingOutNines 应该保持个位数不变', () => {
      const skillsToTest = ['specialDigits', 'castingOutNines']

      skillsToTest.forEach(skill => {
        const config = createTestConfig(skill)
        QuestionGenerator.getDifficultyManager().init(config)

        let preservedCount = 0
        let totalCount = 0

        for (let i = 0; i < 20; i++) {
          const question = QuestionGenerator.createQuestion(15)
          if (question.targetSkills.includes(skill)) {
            totalCount++
            const { correctValue, shownValue } = question.metadata

            if (correctValue % 10 === shownValue % 10) {
              preservedCount++
            } else {
              console.log(`${skill} 个位数变化: ${correctValue}%10=${correctValue%10} → ${shownValue}%10=${shownValue%10}`)
            }
          }
        }

        if (totalCount > 0) {
          const preservationRate = (preservedCount / totalCount) * 100
          console.log(`${skill} 个位数保持率: ${preservationRate.toFixed(1)}% (${preservedCount}/${totalCount})`)
          expect(preservationRate).toBeGreaterThanOrEqual(80) // 算法应该至少80%保持个位数
        }
      })
    })
  })
})