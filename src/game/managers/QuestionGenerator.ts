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
  allowNegativeNumbers: boolean
  allowFractions: boolean
  allowDecimals: boolean
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

    // Handle fractions if enabled
    if (this.difficultyConfig.allowFractions && Math.random() > 0.8) {
      return this.generateFractionQuestion(operation)
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

    // Format the answer based on number type
    let formattedAnswer: string
    if (this.difficultyConfig.allowDecimals && displayAnswer % 1 !== 0) {
      formattedAnswer = displayAnswer.toFixed(1)
    } else {
      formattedAnswer = displayAnswer.toString()
    }

    const finalQuestionString = questionString + formattedAnswer
    const targetSkill = this.determineTargetSkill(operation, !isCorrect)

    return {
      questionString: finalQuestionString,
      isTrue: isCorrect,
      targetSkill
    }
  }

  private getRandomNumber(min: number, max: number): number {
    let num = Math.floor(Math.random() * (max - min + 1)) + min

    // Apply advanced number types based on configuration
    if (this.difficultyConfig.allowDecimals && Math.random() > 0.7) {
      // Generate decimal with 1 decimal place
      num = Math.round(num * 10) / 10
    }

    if (this.difficultyConfig.allowNegativeNumbers && Math.random() > 0.8) {
      // Make number negative
      num = -num
    }

    return num
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

  private generateFractionQuestion(operation: '+' | '-' | '*' | '/'): Question {
    const [min, max] = this.difficultyConfig.numberRange
    const denominators = [2, 3, 4, 5, 8, 10] // Common denominators

    const denom1 = denominators[Math.floor(Math.random() * denominators.length)]
    const denom2 = denominators[Math.floor(Math.random() * denominators.length)]

    const num1 = Math.floor(Math.random() * (max - min + 1) + min) * denom1
    const num2 = Math.floor(Math.random() * (max - min + 1) + min) * denom2

    let correctAnswer: number
    let questionString: string

    switch (operation) {
      case '+':
        correctAnswer = num1 + num2
        questionString = `${num1}/${denom1} + ${num2}/${denom2} = `
        break
      case '-':
        correctAnswer = num1 - num2
        questionString = `${num1}/${denom1} - ${num2}/${denom2} = `
        break
      case '*':
        correctAnswer = (num1 * num2) / (denom1 * denom2)
        questionString = `${num1}/${denom1} × ${num2}/${denom2} = `
        break
      case '/':
        correctAnswer = (num1 * denom2) / (num2 * denom1)
        questionString = `${num1}/${denom1} ÷ ${num2}/${denom2} = `
        break
      default:
        correctAnswer = num1 + num2
        questionString = `${num1}/${denom1} + ${num2}/${denom2} = `
    }

    // Simplify fraction answer
    const simplifiedAnswer = this.simplifyFraction(correctAnswer)

    const isCorrect = Math.random() > 0.5
    let displayAnswer: string

    if (isCorrect) {
      displayAnswer = simplifiedAnswer
    } else {
      // Generate wrong fraction answer
      displayAnswer = this.generateWrongFractionAnswer(simplifiedAnswer)
    }

    const finalQuestionString = questionString + displayAnswer

    return {
      questionString: finalQuestionString,
      isTrue: isCorrect,
      targetSkill: '分数运算'
    }
  }

  private simplifyFraction(value: number): string {
    if (Number.isInteger(value)) {
      return value.toString()
    }

    // Convert to simplified fraction representation
    const tolerance = 1.0E-6
    let h1 = 1, h2 = 0, k1 = 0, k2 = 1
    let b = value
    do {
      const a = Math.floor(b)
      let aux = h1
      h1 = a * h1 + h2
      h2 = aux
      aux = k1
      k1 = a * k1 + k2
      k2 = aux
      b = 1 / (b - a)
    } while (Math.abs(value - h1 / k1) > value * tolerance)

    return h1 === k1 ? h1.toString() : `${h1}/${k1}`
  }

  private generateWrongFractionAnswer(correctAnswer: string): string {
    if (correctAnswer.includes('/')) {
      const parts = correctAnswer.split('/')
      const numerator = parseInt(parts[0])
      const denominator = parseInt(parts[1])

      // Generate wrong fraction by slightly modifying numerator or denominator
      if (Math.random() > 0.5) {
        return `${numerator + 1}/${denominator}`
      } else {
        return `${numerator}/${denominator + 1}`
      }
    } else {
      // For whole numbers, add or subtract 1
      const num = parseInt(correctAnswer)
      return (num + (Math.random() > 0.5 ? 1 : -1)).toString()
    }
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