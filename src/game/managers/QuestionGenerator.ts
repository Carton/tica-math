export interface Question {
  questionString: string
  isTrue: boolean
  targetSkill: string
}

export interface DifficultyConfig {
  numberRange: [number, number]
  operations: ('+' | '-' | '*' | '/')[]
  complexity: 'simple' | 'mixed'
  timeLimit: number
  allowThreeNumbers: boolean
}

export default class QuestionGenerator {
  private difficultyConfig: DifficultyConfig

  constructor(difficultyConfig: DifficultyConfig) {
    this.difficultyConfig = difficultyConfig
  }

  generate(): Question {
    const [min, max] = this.difficultyConfig.numberRange
    const operation = this.getRandomOperation()

    let correctAnswer: number
    let questionString: string

    if (this.difficultyConfig.allowThreeNumbers && Math.random() > 0.7) {
      // Generate three-number operation
      const num1 = this.getRandomNumber(min, max)
      const num2 = this.getRandomNumber(min, max)
      const num3 = this.getRandomNumber(min, max)
      const op1 = operation
      const op2 = Math.random() > 0.5 ? '+' : '-'

      // Simple left-to-right evaluation for now
      if (op1 === '+' && op2 === '+') {
        correctAnswer = num1 + num2 + num3
        questionString = `${num1} + ${num2} + ${num3} = `
      } else if (op1 === '+' && op2 === '-') {
        correctAnswer = num1 + num2 - num3
        questionString = `${num1} + ${num2} - ${num3} = `
      } else if (op1 === '-' && op2 === '+') {
        correctAnswer = num1 - num2 + num3
        questionString = `${num1} - ${num2} + ${num3} = `
      } else {
        correctAnswer = num1 - num2 - num3
        questionString = `${num1} - ${num2} - ${num3} = `
      }
    } else {
      // Generate two-number operation
      const num1 = this.getRandomNumber(min, max)
      const num2 = this.getRandomNumber(min, max)

      switch (operation) {
        case '+':
          correctAnswer = num1 + num2
          questionString = `${num1} + ${num2} = `
          break
        case '-':
          correctAnswer = num1 - num2
          questionString = `${num1} - ${num2} = `
          break
        case '*':
          correctAnswer = num1 * num2
          questionString = `${num1} × ${num2} = `
          break
        case '/':
          // Ensure clean division
          const product = num1 * num2
          correctAnswer = num1
          questionString = `${product} ÷ ${num2} = `
          break
        default:
          correctAnswer = num1 + num2
          questionString = `${num1} + ${num2} = `
      }
    }

    // Decide if this should be a correct or incorrect equation
    const isCorrect = Math.random() > 0.5
    let displayAnswer: number

    if (isCorrect) {
      displayAnswer = correctAnswer
    } else {
      // Generate a strategic wrong answer
      displayAnswer = this.generateStrategicWrongAnswer(correctAnswer, operation)
    }

    const finalQuestionString = questionString + displayAnswer.toString()
    const targetSkill = this.determineTargetSkill(operation, !isCorrect)

    return {
      questionString: finalQuestionString,
      isTrue: isCorrect,
      targetSkill
    }
  }

  private getRandomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  private getRandomOperation(): '+' | '-' | '*' | '/' {
    const operations = this.difficultyConfig.operations
    const randomIndex = Math.floor(Math.random() * operations.length)
    return operations[randomIndex]
  }

  private generateStrategicWrongAnswer(correctAnswer: number, operation: string): number {
    const errorTypes = [
      () => correctAnswer + 1,
      () => correctAnswer - 1,
      () => correctAnswer + 10,
      () => correctAnswer - 10,
      () => {
        if (operation === '+' || operation === '-') {
          return correctAnswer + (Math.random() > 0.5 ? 2 : -2)
        }
        return correctAnswer + 1
      }
    ]

    const errorType = errorTypes[Math.floor(Math.random() * errorTypes.length)]
    return errorType()
  }

  private determineTargetSkill(operation: string, isStrategicError: boolean): string {
    const skills = [
      '尾数追踪术',
      '估算神功',
      '奇偶性判断',
      '弃九法'
    ]

    // For strategic errors, prioritize relevant skills
    if (isStrategicError) {
      if (operation === '+' || operation === '-') {
        return '尾数追踪术'
      } else if (operation === '*') {
        return '估算神功'
      }
    }

    return skills[Math.floor(Math.random() * skills.length)]
  }

  generateMultiple(count: number): Question[] {
    const questions: Question[] = []
    for (let i = 0; i < count; i++) {
      questions.push(this.generate())
    }
    return questions
  }

  updateDifficulty(newConfig: DifficultyConfig): void {
    this.difficultyConfig = newConfig
  }
}