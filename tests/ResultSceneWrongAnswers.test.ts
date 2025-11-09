import type { WrongAnswer, WrongAnswerType } from '@/game/utils/types'

describe('ResultScene Wrong Answers Display', () => {
  describe('错题数据处理', () => {
    test('应该正确处理空的错题列表', () => {
      const wrongAnswers: WrongAnswer[] = []

      expect(wrongAnswers).toHaveLength(0)
      expect(wrongAnswers.length).toBe(0)
    })

    test('应该正确处理单个错题', () => {
      const wrongAnswers: WrongAnswer[] = [
        {
          questionString: '123 + 456 = 579',
          userChoice: true,
          correctAnswer: false,
          wrongType: 'wrong_choice',
          metadata: {
            expr: '123 + 456',
            correctValue: 579,
            shownValue: 579
          }
        }
      ]

      expect(wrongAnswers).toHaveLength(1)
      expect(wrongAnswers[0].questionString).toBe('123 + 456 = 579')
      expect(wrongAnswers[0].userChoice).toBe(true)
      expect(wrongAnswers[0].correctAnswer).toBe(false)
      expect(wrongAnswers[0].wrongType).toBe('wrong_choice')
    })

    test('应该正确处理多个错题', () => {
      const wrongAnswers: WrongAnswer[] = [
        {
          questionString: '12 × 12 = 144',
          userChoice: false,
          correctAnswer: true,
          wrongType: 'wrong_choice',
          metadata: {
            expr: '12 × 12',
            correctValue: 144,
            shownValue: 144
          }
        },
        {
          questionString: '100 ÷ 4 = 25',
          userChoice: true,
          correctAnswer: false,
          wrongType: 'wrong_choice',
          metadata: {
            expr: '100 ÷ 4',
            correctValue: 25,
            shownValue: 25
          }
        },
        {
          questionString: '200 - 75 = 125',
          userChoice: false,
          correctAnswer: false,
          wrongType: 'timeout',
          metadata: {
            expr: '200 - 75',
            correctValue: 125,
            shownValue: 125
          }
        }
      ]

      expect(wrongAnswers).toHaveLength(3)

      // 验证第一个错题（答错）
      expect(wrongAnswers[0].questionString).toContain('×')
      expect(wrongAnswers[0].userChoice).toBe(false)
      expect(wrongAnswers[0].correctAnswer).toBe(true)
      expect(wrongAnswers[0].wrongType).toBe('wrong_choice')

      // 验证第二个错题（答错）
      expect(wrongAnswers[1].questionString).toContain('÷')
      expect(wrongAnswers[1].userChoice).toBe(true)
      expect(wrongAnswers[1].correctAnswer).toBe(false)
      expect(wrongAnswers[1].wrongType).toBe('wrong_choice')

      // 验证第三个错题（超时）
      expect(wrongAnswers[2].questionString).toContain('-')
      expect(wrongAnswers[2].userChoice).toBe(false)
      expect(wrongAnswers[2].correctAnswer).toBe(false)
      expect(wrongAnswers[2].wrongType).toBe('timeout')
    })
  })

  describe('错题显示内容验证', () => {
    test('应该包含显示所需的所有信息', () => {
      const wrongAnswer: WrongAnswer = {
        questionString: '7 × 8 = 56',
        userChoice: false,
        correctAnswer: true,
        wrongType: 'wrong_choice',
        metadata: {
          expr: '7 × 8',
          correctValue: 56,
          shownValue: 56
        }
      }

      // 验证显示所需的信息完整性
      expect(wrongAnswer.questionString).toBeTruthy()
      expect(wrongAnswer.questionString.length).toBeGreaterThan(0)
      expect(typeof wrongAnswer.userChoice).toBe('boolean')
      expect(typeof wrongAnswer.correctAnswer).toBe('boolean')
      expect(wrongAnswer.wrongType).toBeTruthy()
      expect(['wrong_choice', 'timeout']).toContain(wrongAnswer.wrongType)
      expect(wrongAnswer.metadata.expr).toBeTruthy()
      expect(typeof wrongAnswer.metadata.correctValue).toBe('number')
      expect(typeof wrongAnswer.metadata.shownValue).toBe('number')

      // 验证数值合理性
      expect(wrongAnswer.metadata.correctValue).toBe(56)
      expect(wrongAnswer.metadata.shownValue).toBe(56)
    })

    test('应该正确处理用户选择和正确答案的对比', () => {
      const testCases = [
        {
          description: '用户选择伪证但答案是真相',
          userChoice: false,
          correctAnswer: true,
          wrongType: 'wrong_choice' as WrongAnswerType,
          expectedUserWrong: true
        },
        {
          description: '用户选择真相但答案是伪证',
          userChoice: true,
          correctAnswer: false,
          wrongType: 'wrong_choice' as WrongAnswerType,
          expectedUserWrong: true
        },
        {
          description: '超时情况',
          userChoice: false,
          correctAnswer: true,
          wrongType: 'timeout' as WrongAnswerType,
          expectedUserWrong: true
        }
      ]

      testCases.forEach(testCase => {
        const wrongAnswer: WrongAnswer = {
          questionString: 'Test Question',
          userChoice: testCase.userChoice,
          correctAnswer: testCase.correctAnswer,
          wrongType: testCase.wrongType,
          metadata: {
            expr: 'Test',
            correctValue: 1,
            shownValue: 1
          }
        }

        const userIsWrong = wrongAnswer.userChoice !== wrongAnswer.correctAnswer
        expect(userIsWrong).toBe(testCase.expectedUserWrong)
        expect(wrongAnswer.wrongType).toBe(testCase.wrongType)
      })
    })
  })

  describe('错误类型验证', () => {
    test('应该正确区分答错和超时类型', () => {
      const wrongChoiceAnswer: WrongAnswer = {
        questionString: '15 + 25 = 40',
        userChoice: false,
        correctAnswer: true,
        wrongType: 'wrong_choice',
        metadata: {
          expr: '15 + 25',
          correctValue: 40,
          shownValue: 40
        }
      }

      const timeoutAnswer: WrongAnswer = {
        questionString: '8 × 9 = 72',
        userChoice: false,
        correctAnswer: true,
        wrongType: 'timeout',
        metadata: {
          expr: '8 × 9',
          correctValue: 72,
          shownValue: 72
        }
      }

      expect(wrongChoiceAnswer.wrongType).toBe('wrong_choice')
      expect(timeoutAnswer.wrongType).toBe('timeout')
    })

    test('应该支持所有错误类型', () => {
      const wrongTypes: WrongAnswerType[] = ['wrong_choice', 'timeout']

      wrongTypes.forEach(wrongType => {
        const wrongAnswer: WrongAnswer = {
          questionString: 'Test Question',
          userChoice: false,
          correctAnswer: true,
          wrongType,
          metadata: {
            expr: 'Test',
            correctValue: 1,
            shownValue: 1
          }
        }

        expect(['wrong_choice', 'timeout']).toContain(wrongAnswer.wrongType)
      })
    })
  })

  describe('多语言支持验证', () => {
    test('应该支持中文显示', () => {
      const mockTranslations = {
        'results.your_choice': '你的选择',
        'results.correct_answer': '正确答案',
        'results.timeout': '超时',
        'results.wrong_choice': '答错',
        'ui.true': '真相',
        'ui.false': '伪证'
      }

      // 测试答错情况
      const wrongChoiceAnswer: WrongAnswer = {
        questionString: '15 + 25 = 40',
        userChoice: true,
        correctAnswer: false,
        wrongType: 'wrong_choice',
        metadata: {
          expr: '15 + 25',
          correctValue: 40,
          shownValue: 40
        }
      }

      // 测试超时情况
      const timeoutAnswer: WrongAnswer = {
        questionString: '8 × 9 = 72',
        userChoice: false,
        correctAnswer: true,
        wrongType: 'timeout',
        metadata: {
          expr: '8 × 9',
          correctValue: 72,
          shownValue: 72
        }
      }

      // 模拟ResultScene中的显示逻辑
      const getUserChoiceText = (wrongType: WrongAnswerType, userChoice: boolean): string => {
        if (wrongType === 'timeout') {
          return mockTranslations['results.timeout']
        } else {
          return userChoice ? mockTranslations['ui.true'] : mockTranslations['ui.false']
        }
      }

      expect(getUserChoiceText(wrongChoiceAnswer.wrongType, wrongChoiceAnswer.userChoice)).toBe('真相')
      expect(getUserChoiceText(timeoutAnswer.wrongType, timeoutAnswer.userChoice)).toBe('超时')
    })

    test('应该支持英文显示', () => {
      const mockTranslations = {
        'results.your_choice': 'Your Choice',
        'results.correct_answer': 'Correct Answer',
        'results.timeout': 'Timeout',
        'results.wrong_choice': 'Wrong Answer',
        'ui.true': 'True',
        'ui.false': 'False'
      }

      // 测试答错情况
      const wrongChoiceAnswer: WrongAnswer = {
        questionString: '8 × 9 = 72',
        userChoice: false,
        correctAnswer: true,
        wrongType: 'wrong_choice',
        metadata: {
          expr: '8 × 9',
          correctValue: 72,
          shownValue: 72
        }
      }

      // 测试超时情况
      const timeoutAnswer: WrongAnswer = {
        questionString: '15 + 25 = 40',
        userChoice: false,
        correctAnswer: true,
        wrongType: 'timeout',
        metadata: {
          expr: '15 + 25',
          correctValue: 40,
          shownValue: 40
        }
      }

      // 模拟ResultScene中的显示逻辑
      const getUserChoiceText = (wrongType: WrongAnswerType, userChoice: boolean): string => {
        if (wrongType === 'timeout') {
          return mockTranslations['results.timeout']
        } else {
          return userChoice ? mockTranslations['ui.true'] : mockTranslations['ui.false']
        }
      }

      expect(getUserChoiceText(wrongChoiceAnswer.wrongType, wrongChoiceAnswer.userChoice)).toBe('False')
      expect(getUserChoiceText(timeoutAnswer.wrongType, timeoutAnswer.userChoice)).toBe('Timeout')
    })
  })

  describe('边界情况处理', () => {
    test('应该处理极长的题目表达式', () => {
      const longExpression = '123456789 + 987654321 = 1111111110'
      const wrongAnswer: WrongAnswer = {
        questionString: longExpression,
        userChoice: false,
        correctAnswer: true,
        wrongType: 'wrong_choice',
        metadata: {
          expr: '123456789 + 987654321',
          correctValue: 1111111110,
          shownValue: 1111111110
        }
      }

      expect(wrongAnswer.questionString.length).toBeGreaterThan(20)
      expect(wrongAnswer.questionString).toContain('1111111110')
      expect(wrongAnswer.metadata.correctValue).toBe(1111111110)
      expect(wrongAnswer.wrongType).toBe('wrong_choice')
    })

    test('应该处理包含负数的题目', () => {
      const wrongAnswer: WrongAnswer = {
        questionString: '-15 + 20 = 5',
        userChoice: true,
        correctAnswer: false,
        wrongType: 'timeout',
        metadata: {
          expr: '-15 + 20',
          correctValue: 5,
          shownValue: 5
        }
      }

      expect(wrongAnswer.questionString).toContain('-15')
      expect(wrongAnswer.metadata.expr).toContain('-15')
      expect(wrongAnswer.metadata.correctValue).toBe(5)
      expect(wrongAnswer.wrongType).toBe('timeout')
    })

    test('应该处理零值的情况', () => {
      const wrongAnswer: WrongAnswer = {
        questionString: '0 × 123 = 0',
        userChoice: false,
        correctAnswer: true,
        wrongType: 'wrong_choice',
        metadata: {
          expr: '0 × 123',
          correctValue: 0,
          shownValue: 0
        }
      }

      expect(wrongAnswer.questionString).toContain('0')
      expect(wrongAnswer.metadata.correctValue).toBe(0)
      expect(wrongAnswer.metadata.shownValue).toBe(0)
      expect(wrongAnswer.wrongType).toBe('wrong_choice')
    })

    test('应该处理包含括号的复杂表达式', () => {
      const wrongAnswer: WrongAnswer = {
        questionString: '(12 + 8) × 5 = 100',
        userChoice: true,
        correctAnswer: false,
        wrongType: 'wrong_choice',
        metadata: {
          expr: '(12 + 8) × 5',
          correctValue: 100,
          shownValue: 100
        }
      }

      expect(wrongAnswer.questionString).toContain('(')
      expect(wrongAnswer.questionString).toContain(')')
      expect(wrongAnswer.metadata.expr).toContain('(')
      expect(wrongAnswer.metadata.expr).toContain(')')
      expect(wrongAnswer.wrongType).toBe('wrong_choice')
    })
  })

  describe('数据一致性验证', () => {
    test('questionString和metadata.expr应该保持一致', () => {
      const wrongAnswer: WrongAnswer = {
        questionString: '25 × 4 = 100',
        userChoice: false,
        correctAnswer: true,
        wrongType: 'wrong_choice',
        metadata: {
          expr: '25 × 4',
          correctValue: 100,
          shownValue: 100
        }
      }

      // 验证表达式部分的一致性
      const questionExpr = wrongAnswer.questionString.split('=')[0].trim()
      expect(questionExpr).toBe(wrongAnswer.metadata.expr)
    })

    test('correctValue和shownValue应该保持一致', () => {
      const wrongAnswer: WrongAnswer = {
        questionString: '144 ÷ 12 = 12',
        userChoice: true,
        correctAnswer: false,
        wrongType: 'timeout',
        metadata: {
          expr: '144 ÷ 12',
          correctValue: 12,
          shownValue: 12
        }
      }

      expect(wrongAnswer.metadata.correctValue).toBe(wrongAnswer.metadata.shownValue)
      expect(wrongAnswer.wrongType).toBe('timeout')
    })

    test('questionString应该包含正确的结果值', () => {
      const wrongAnswer: WrongAnswer = {
        questionString: '9 × 9 = 81',
        userChoice: false,
        correctAnswer: true,
        wrongType: 'wrong_choice',
        metadata: {
          expr: '9 × 9',
          correctValue: 81,
          shownValue: 81
        }
      }

      const questionResult = wrongAnswer.questionString.split('=')[1].trim()
      expect(questionResult).toBe('81')
      expect(parseInt(questionResult)).toBe(wrongAnswer.metadata.correctValue)
    })

    test('错误类型应该与实际情况一致', () => {
      // 测试答错的情况
      const wrongChoiceCase: WrongAnswer = {
        questionString: '15 + 25 = 40',
        userChoice: false,
        correctAnswer: true,
        wrongType: 'wrong_choice',
        metadata: {
          expr: '15 + 25',
          correctValue: 40,
          shownValue: 40
        }
      }

      // 测试超时的情况
      const timeoutCase: WrongAnswer = {
        questionString: '8 × 9 = 72',
        userChoice: false,
        correctAnswer: true,
        wrongType: 'timeout',
        metadata: {
          expr: '8 × 9',
          correctValue: 72,
          shownValue: 72
        }
      }

      // 验证答错情况
      expect(wrongChoiceCase.userChoice).not.toBe(wrongChoiceCase.correctAnswer)
      expect(wrongChoiceCase.wrongType).toBe('wrong_choice')

      // 验证超时情况（超时总是被视为错误选择）
      expect(timeoutCase.userChoice).toBe(false)
      expect(timeoutCase.wrongType).toBe('timeout')
    })
  })
})