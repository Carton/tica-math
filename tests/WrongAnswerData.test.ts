import type { WrongAnswer } from '@/game/utils/types'

describe('WrongAnswer Data Structure', () => {
  describe('WrongAnswer interface', () => {
    test('应该包含所有必需的字段', () => {
      const wrongAnswer: WrongAnswer = {
        questionString: '123 + 456 = 579',
        userChoice: true,
        correctAnswer: false,
        metadata: {
          expr: '123 + 456',
          correctValue: 579,
          shownValue: 579
        }
      }

      expect(wrongAnswer).toHaveProperty('questionString')
      expect(wrongAnswer).toHaveProperty('userChoice')
      expect(wrongAnswer).toHaveProperty('correctAnswer')
      expect(wrongAnswer).toHaveProperty('metadata')
      expect(wrongAnswer.metadata).toHaveProperty('expr')
      expect(wrongAnswer.metadata).toHaveProperty('correctValue')
      expect(wrongAnswer.metadata).toHaveProperty('shownValue')
    })

    test('应该正确记录用户选择错误的情况', () => {
      const wrongAnswer: WrongAnswer = {
        questionString: '100 - 50 = 60',
        userChoice: true, // 用户选择真相，但实际是错误的
        correctAnswer: false, // 正确答案应该是伪证
        metadata: {
          expr: '100 - 50',
          correctValue: 50,
          shownValue: 60
        }
      }

      expect(wrongAnswer.userChoice).toBe(true)
      expect(wrongAnswer.correctAnswer).toBe(false)
      expect(wrongAnswer.questionString).toBe('100 - 50 = 60')
    })

    test('应该正确记录用户选择伪证但实际为真的情况', () => {
      const wrongAnswer: WrongAnswer = {
        questionString: '25 × 4 = 100',
        userChoice: false, // 用户选择伪证，但实际是真的
        correctAnswer: true, // 正确答案应该是真相
        metadata: {
          expr: '25 × 4',
          correctValue: 100,
          shownValue: 100
        }
      }

      expect(wrongAnswer.userChoice).toBe(false)
      expect(wrongAnswer.correctAnswer).toBe(true)
    })

    test('应该处理复杂的数学表达式', () => {
      const wrongAnswer: WrongAnswer = {
        questionString: '(12 + 8) × 5 = 100',
        userChoice: false,
        correctAnswer: true,
        metadata: {
          expr: '(12 + 8) × 5',
          correctValue: 100,
          shownValue: 100
        }
      }

      expect(wrongAnswer.questionString).toContain('(')
      expect(wrongAnswer.questionString).toContain(')')
      expect(wrongAnswer.questionString).toContain('×')
    })
  })

  describe('错题数据完整性', () => {
    test('应该包含足够的信息用于显示', () => {
      const wrongAnswer: WrongAnswer = {
        questionString: '200 ÷ 4 = 50',
        userChoice: true,
        correctAnswer: true,
        metadata: {
          expr: '200 ÷ 4',
          correctValue: 50,
          shownValue: 50
        }
      }

      // 验证显示所需的所有信息都存在
      expect(wrongAnswer.questionString).toBeTruthy()
      expect(typeof wrongAnswer.userChoice).toBe('boolean')
      expect(typeof wrongAnswer.correctAnswer).toBe('boolean')
      expect(wrongAnswer.metadata.expr).toBeTruthy()
      expect(typeof wrongAnswer.metadata.correctValue).toBe('number')
      expect(typeof wrongAnswer.metadata.shownValue).toBe('number')
    })

    test('应该区分用户选择和正确答案', () => {
      // 用户答错的情况
      const userWrong: WrongAnswer = {
        questionString: '7 × 8 = 56',
        userChoice: false, // 用户说是伪证
        correctAnswer: true, // 但实际是真的
        metadata: {
          expr: '7 × 8',
          correctValue: 56,
          shownValue: 56
        }
      }

      expect(userWrong.userChoice).not.toBe(userWrong.correctAnswer)

      // 用户答对的情况（这种不应该出现在错题中，但测试数据结构）
      const userCorrect: WrongAnswer = {
        questionString: '9 × 9 = 81',
        userChoice: true,
        correctAnswer: true,
        metadata: {
          expr: '9 × 9',
          correctValue: 81,
          shownValue: 81
        }
      }

      expect(userCorrect.userChoice).toBe(userCorrect.correctAnswer)
    })
  })
})