import type { Question, WrongAnswer } from '@/game/utils/types'

describe('GameScene Wrong Answers Collection', () => {
  // 模拟GameScene的错题收集逻辑
  describe('错题收集逻辑', () => {
    let mockWrongAnswers: WrongAnswer[] = []

    beforeEach(() => {
      mockWrongAnswers = []
    })

    function mockHandleChoice(choice: boolean, current: Question): void {
      const isCorrect = choice === current.isTrue

      if (!isCorrect) {
        // 模拟GameScene中的错题记录逻辑
        mockWrongAnswers.push({
          questionString: current.questionString,
          userChoice: choice,
          correctAnswer: current.isTrue,
          metadata: {
            expr: current.metadata.expr,
            correctValue: current.metadata.correctValue,
            shownValue: current.metadata.shownValue
          }
        })
      }
    }

    function mockHandleTimeout(current: Question): void {
      // 模拟超时处理逻辑
      mockWrongAnswers.push({
        questionString: current.questionString,
        userChoice: false, // 超时视为错误选择
        correctAnswer: current.isTrue,
        metadata: {
          expr: current.metadata.expr,
          correctValue: current.metadata.correctValue,
          shownValue: current.metadata.shownValue
        }
      })
    }

    test('应该记录用户选择错误的题目', () => {
      const question: Question = {
        questionString: '12 + 13 = 25',
        isTrue: true,
        targetSkills: ['estimate'],
        digitDifficulty: 2,
        metadata: {
          expr: '12 + 13',
          correctValue: 25,
          shownValue: 25
        }
      }

      // 用户选择伪证，但答案是真相
      mockHandleChoice(false, question)

      expect(mockWrongAnswers).toHaveLength(1)
      expect(mockWrongAnswers[0].questionString).toBe('12 + 13 = 25')
      expect(mockWrongAnswers[0].userChoice).toBe(false)
      expect(mockWrongAnswers[0].correctAnswer).toBe(true)
    })

    test('应该记录用户选择为真的错误题目', () => {
      const question: Question = {
        questionString: '15 × 4 = 60',
        isTrue: false,
        targetSkills: ['lastDigit'],
        digitDifficulty: 2,
        metadata: {
          expr: '15 × 4',
          correctValue: 60,
          shownValue: 60
        }
      }

      // 用户选择真相，但答案是伪证
      mockHandleChoice(true, question)

      expect(mockWrongAnswers).toHaveLength(1)
      expect(mockWrongAnswers[0].userChoice).toBe(true)
      expect(mockWrongAnswers[0].correctAnswer).toBe(false)
    })

    test('不应该记录正确答案', () => {
      const question: Question = {
        questionString: '8 × 7 = 56',
        isTrue: true,
        targetSkills: ['specialDigits'],
        digitDifficulty: 2,
        metadata: {
          expr: '8 × 7',
          correctValue: 56,
          shownValue: 56
        }
      }

      // 用户选择正确
      mockHandleChoice(true, question)

      expect(mockWrongAnswers).toHaveLength(0)
    })

    test('应该记录超时的题目', () => {
      const question: Question = {
        questionString: '144 ÷ 12 = 12',
        isTrue: true,
        targetSkills: ['castingOutNines'],
        digitDifficulty: 3,
        metadata: {
          expr: '144 ÷ 12',
          correctValue: 12,
          shownValue: 12
        }
      }

      mockHandleTimeout(question)

      expect(mockWrongAnswers).toHaveLength(1)
      expect(mockWrongAnswers[0].questionString).toBe('144 ÷ 12 = 12')
      expect(mockWrongAnswers[0].userChoice).toBe(false) // 超时视为错误选择
      expect(mockWrongAnswers[0].correctAnswer).toBe(true)
    })

    test('应该按顺序记录多个错题', () => {
      const questions: Question[] = [
        {
          questionString: '9 + 6 = 15',
          isTrue: true,
          targetSkills: ['estimate'],
          digitDifficulty: 1,
          metadata: { expr: '9 + 6', correctValue: 15, shownValue: 15 }
        },
        {
          questionString: '25 - 8 = 17',
          isTrue: false,
          targetSkills: ['lastDigit'],
          digitDifficulty: 2,
          metadata: { expr: '25 - 8', correctValue: 17, shownValue: 17 }
        },
        {
          questionString: '7 × 8 = 56',
          isTrue: true,
          targetSkills: ['specialDigits'],
          digitDifficulty: 2,
          metadata: { expr: '7 × 8', correctValue: 56, shownValue: 56 }
        }
      ]

      // 第一题答错
      mockHandleChoice(false, questions[0])
      // 第二题答错
      mockHandleChoice(true, questions[1])
      // 第三题答对，不应该记录
      mockHandleChoice(true, questions[2])

      expect(mockWrongAnswers).toHaveLength(2)
      expect(mockWrongAnswers[0].questionString).toBe('9 + 6 = 15')
      expect(mockWrongAnswers[1].questionString).toBe('25 - 8 = 17')
    })

    test('应该处理包含各种运算符的题目', () => {
      const questions: Question[] = [
        {
          questionString: '100 + 200 = 300',
          isTrue: true,
          targetSkills: ['carryBorrow'],
          digitDifficulty: 3,
          metadata: { expr: '100 + 200', correctValue: 300, shownValue: 300 }
        },
        {
          questionString: '500 - 150 = 350',
          isTrue: false,
          targetSkills: ['carryBorrow'],
          digitDifficulty: 3,
          metadata: { expr: '500 - 150', correctValue: 350, shownValue: 350 }
        },
        {
          questionString: '12 × 12 = 144',
          isTrue: true,
          targetSkills: ['specialDigits'],
          digitDifficulty: 3,
          metadata: { expr: '12 × 12', correctValue: 144, shownValue: 144 }
        },
        {
          questionString: '81 ÷ 9 = 9',
          isTrue: false,
          targetSkills: ['castingOutNines'],
          digitDifficulty: 2,
          metadata: { expr: '81 ÷ 9', correctValue: 9, shownValue: 9 }
        }
      ]

      // 故意答错所有题目
      mockHandleChoice(false, questions[0]) // 真题说伪证
      mockHandleChoice(true, questions[1])   // 伪题说真相
      mockHandleChoice(false, questions[2]) // 真题说伪证
      mockHandleChoice(true, questions[3])  // 伪题说真相

      expect(mockWrongAnswers).toHaveLength(4)

      // 验证每种运算符都被正确处理
      const operators = ['+', '-', '×', '÷']
      mockWrongAnswers.forEach((wrongAnswer, index) => {
        expect(wrongAnswer.questionString).toContain(operators[index])
        expect(wrongAnswer.metadata.expr).toContain(operators[index])
      })
    })
  })

  describe('ResultSummary扩展验证', () => {
    test('应该包含wrongAnswers字段', () => {
      const mockWrongAnswers: WrongAnswer[] = [
        {
          questionString: '15 + 25 = 40',
          userChoice: false,
          correctAnswer: true,
          metadata: {
            expr: '15 + 25',
            correctValue: 40,
            shownValue: 40
          }
        }
      ]

      const summary = {
        correctCount: 8,
        totalCount: 10,
        totalTimeMs: 45000,
        averageTimeMs: 4500,
        comboMax: 3,
        toolsUsed: 1,
        accuracy: 0.8,
        grade: 'A' as const,
        pass: true,
        level: 5,
        wrongAnswers: mockWrongAnswers
      }

      expect(summary).toHaveProperty('wrongAnswers')
      expect(summary.wrongAnswers).toHaveLength(1)
      expect(summary.wrongAnswers![0].questionString).toBe('15 + 25 = 40')
    })

    test('wrongAnswers字段应该是可选的', () => {
      const summaryWithoutWrongAnswers = {
        correctCount: 10,
        totalCount: 10,
        totalTimeMs: 40000,
        averageTimeMs: 4000,
        comboMax: 5,
        toolsUsed: 0,
        accuracy: 1.0,
        grade: 'S' as const,
        pass: true,
        level: 5
        // 没有wrongAnswers字段
      }

      expect(summaryWithoutWrongAnswers).not.toHaveProperty('wrongAnswers')
    })
  })
})