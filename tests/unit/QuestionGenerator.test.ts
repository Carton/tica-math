import QuestionGenerator from '@/game/managers/QuestionGenerator'

describe('QuestionGenerator', () => {
  let generator: QuestionGenerator

  beforeEach(() => {
    const simpleConfig = {
      numberRange: [1, 10] as [number, number],
      operations: ['+', '-'] as ('+' | '-' | '*' | '/')[],
      complexity: 'simple' as const,
      timeLimit: 30,
      allowThreeNumbers: false,
      allowNegativeNumbers: false,
      allowFractions: false,
      allowDecimals: false
    }
    generator = new QuestionGenerator(simpleConfig)
  })

  describe('generate', () => {
    it('should generate a question with correct structure', () => {
      const question = generator.generate()

      expect(question).toHaveProperty('questionString')
      expect(question).toHaveProperty('isTrue')
      expect(question).toHaveProperty('targetSkill')
      expect(typeof question.questionString).toBe('string')
      expect(typeof question.isTrue).toBe('boolean')
      expect(typeof question.targetSkill).toBe('string')
    })

    it('should generate questions within specified number range', () => {
      const question = generator.generate()
      const numbers = question.questionString.match(/\d+/g)

      expect(numbers).toBeTruthy()
      numbers!.forEach(num => {
        const value = parseInt(num)
        expect(value).toBeGreaterThanOrEqual(1)
        expect(value).toBeLessThanOrEqual(10)
      })
    })

    it('should only use specified operations', () => {
      const question = generator.generate()

      expect(question.questionString).toMatch(/[\+\-]/)
      expect(question.questionString).not.toMatch(/[\×\÷]/)
    })

    it('should generate both true and false questions', () => {
      const questions = Array.from({ length: 20 }, () => generator.generate())
      const trueQuestions = questions.filter(q => q.isTrue)
      const falseQuestions = questions.filter(q => !q.isTrue)

      expect(trueQuestions.length).toBeGreaterThan(0)
      expect(falseQuestions.length).toBeGreaterThan(0)
    })

    it('should assign target skills', () => {
      const question = generator.generate()
      const validSkills = ['尾数追踪术', '估算神功', '奇偶性判断', '弃九法']

      expect(validSkills).toContain(question.targetSkill)
    })
  })

  describe('generateMultiple', () => {
    it('should generate specified number of questions', () => {
      const questions = generator.generateMultiple(5)

      expect(questions).toHaveLength(5)
      questions.forEach(question => {
        expect(question).toHaveProperty('questionString')
        expect(question).toHaveProperty('isTrue')
        expect(question).toHaveProperty('targetSkill')
      })
    })

    it('should generate different questions', () => {
      const questions = generator.generateMultiple(10)
      const uniqueQuestions = new Set(questions.map(q => q.questionString))

      expect(uniqueQuestions.size).toBeGreaterThan(1)
    })
  })

  describe('updateDifficulty', () => {
    it('should update difficulty configuration', () => {
      const newConfig = {
        numberRange: [50, 100] as [number, number],
        operations: ['*', '/'] as ('+' | '-' | '*' | '/')[],
        complexity: 'mixed' as const,
        timeLimit: 20,
        allowThreeNumbers: true,
        allowNegativeNumbers: false,
        allowFractions: false,
        allowDecimals: false
      }

      generator.updateDifficulty(newConfig)
      const question = generator.generate()

      expect(question.questionString).toMatch(/[\×\÷]/)
    })
  })

  describe('strategic wrong answers', () => {
    it('should generate strategic wrong answers', () => {
      const questions = generator.generateMultiple(50)
      const falseQuestions = questions.filter(q => !q.isTrue)

      falseQuestions.forEach(question => {
        const parts = question.questionString.split('=')
        const expression = parts[0].trim()
        const givenResult = parseInt(parts[1].trim())

        // Extract numbers and calculate correct result
        const numbers = expression.match(/\d+/g)!.map(n => parseInt(n))
        let correctResult: number

        if (expression.includes('+')) {
          correctResult = numbers[0] + numbers[1]
        } else {
          correctResult = numbers[0] - numbers[1]
        }

        // Wrong answer should be close but not equal to correct result
        expect(givenResult).not.toBe(correctResult)
        expect(Math.abs(givenResult - correctResult)).toBeLessThanOrEqual(20)
      })
    })
  })
})