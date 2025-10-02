import { randomInt, sampleByWeights, choose } from '@/game/utils/mathUtils'
import type { DigitDifficultyLevel, Question, SkillTag, Operator, ExpressionConfig } from '@/game/utils/types'
import { DifficultyManager } from '@/game/managers/DifficultyManager'

function lastDigit(n: number) { return Math.abs(n) % 10 }
function digitSumMod9(n: number) {
  let s = 0; const abs = Math.abs(n)
  let x = abs
  while (x > 0) { s += x % 10; x = Math.floor(x / 10) }
  return s % 9
}
function digitSum(n: number) {
  let s = 0; const abs = Math.abs(n)
  let x = abs
  while (x > 0) { s += x % 10; x = Math.floor(x / 10) }
  return s
}

// 计算表达式的数字位数难度
function calculateDigitDifficulty(expr: string): number {
  const numbers = expr.match(/\d+/g)
  if (!numbers) return 0

  return numbers.reduce((total, num) => {
    // 移除前导零来计算位数
    const cleanNum = num.replace(/^0+/, '') || '0'
    return total + cleanNum.length
  }, 0)
}

// 生成指定位数的随机数
function generateNumberWithDigitCount(digits: number, allowNegative: boolean = false): number {
  if (digits <= 0) return 1

  const min = Math.pow(10, digits - 1)
  const max = Math.pow(10, digits) - 1
  let num = randomInt(min, max)

  if (allowNegative && Math.random() < 0.3) {
    num = -num
  }

  return num
}

// 分配数字位数到多个操作数
function distributeDigits(totalDigits: number, count: number): number[] {
  if (count <= 0) return []
  if (count === 1) return [totalDigits]

  const digits: number[] = []
  let remaining = totalDigits

  // 给前count-1个数分配至少1位
  for (let i = 0; i < count - 1; i++) {
    const minDigits = 1
    const maxDigits = Math.max(minDigits, remaining - (count - i - 1))
    const assignedDigits = randomInt(minDigits, maxDigits)
    digits.push(assignedDigits)
    remaining -= assignedDigits
  }

  // 最后一个数得到剩余位数
  digits.push(remaining)

  return digits
}

// 生成两数字表达式
function generateTwoTermsExpression(
  digitDifficulty: number,
  operator: Operator,
  withParentheses: boolean,
  allowNegative: boolean,
  allowFractions: boolean
): { expr: string; value: number; digitDifficulty: number } {
  const digits = distributeDigits(digitDifficulty, 2)
  const a = generateNumberWithDigitCount(digits[0], allowNegative)
  const b = generateNumberWithDigitCount(digits[1], allowNegative)

  const op = operator === 'plus' ? '+' : operator === 'minus' ? '-' : operator === 'mul' ? '*' : '/'

  let value: number
  if (op === '/') {
    // 确保除法结果为整数（如果不允许分数）
    if (!allowFractions) {
      const absA = Math.abs(a)
      const divisors: number[] = []
      for (let d = 1; d <= absA; d++) {
        if (absA % d === 0) {
          const candidate = Math.abs(b)
          if (candidate.toString().length <= digits[1]) {
            divisors.push(d)
          }
        }
      }
      const divisor = choose(divisors.length ? divisors : [1])
      const signA = a < 0 ? -1 : 1
      const signB = b < 0 ? -1 : 1
      value = (signA * absA) / divisor * signB

      const expr = `${a} ÷ ${divisor}`
      return { expr, value, digitDifficulty }
    } else {
      value = a / b
    }
  } else {
    value = op === '+' ? a + b : op === '-' ? a - b : a * b
  }

  const expr = withParentheses ? `(${a} ${op} ${b})` : `${a} ${op} ${b}`

  return { expr, value, digitDifficulty }
}

// 生成三数字表达式
function generateThreeTermsExpression(
  digitDifficulty: number,
  expressionType: 'plusMinus' | 'withMul' | 'withDiv',
  withParentheses: boolean,
  allowNegative: boolean,
  allowFractions: boolean
): { expr: string; value: number; digitDifficulty: number } {
  const digits = distributeDigits(digitDifficulty, 3)
  const numbers = digits.map(d => generateNumberWithDigitCount(d, allowNegative))

  let expr: string
  let value: number

  if (expressionType === 'plusMinus') {
    // 只有加减法
    const op1 = Math.random() < 0.5 ? '+' : '-'
    const op2 = Math.random() < 0.5 ? '+' : '-'

    if (withParentheses) {
      // (a ± b) ± c
      const tempValue = op1 === '+' ? numbers[0] + numbers[1] : numbers[0] - numbers[1]
      value = op2 === '+' ? tempValue + numbers[2] : tempValue - numbers[2]
      expr = `(${numbers[0]} ${op1} ${numbers[1]}) ${op2} ${numbers[2]}`
    } else {
      // a ± b ± c (按优先级计算)
      value = op1 === '+' ? numbers[0] + numbers[1] : numbers[0] - numbers[1]
      value = op2 === '+' ? value + numbers[2] : value - numbers[2]
      expr = `${numbers[0]} ${op1} ${numbers[1]} ${op2} ${numbers[2]}`
    }
  } else if (expressionType === 'withMul') {
    // 包含乘法
    const mulPos = Math.random() < 0.5 ? 0 : 1 // 乘法位置

    if (withParentheses) {
      if (mulPos === 0) {
        // (a × b) ± c
        value = numbers[0] * numbers[1]
        const op2 = Math.random() < 0.5 ? '+' : '-'
        value = op2 === '+' ? value + numbers[2] : value - numbers[2]
        expr = `(${numbers[0]} × ${numbers[1]}) ${op2} ${numbers[2]}`
      } else {
        // a × (b ± c)
        const op2 = Math.random() < 0.5 ? '+' : '-'
        const tempValue = op2 === '+' ? numbers[1] + numbers[2] : numbers[1] - numbers[2]
        value = numbers[0] * tempValue
        expr = `${numbers[0]} × (${numbers[1]} ${op2} ${numbers[2]})`
      }
    } else {
      if (mulPos === 0) {
        // a × b ± c (乘法优先)
        value = numbers[0] * numbers[1]
        const op2 = Math.random() < 0.5 ? '+' : '-'
        value = op2 === '+' ? value + numbers[2] : value - numbers[2]
        expr = `${numbers[0]} × ${numbers[1]} ${op2} ${numbers[2]}`
      } else {
        // a ± b × c (乘法优先)
        const tempValue = numbers[1] * numbers[2]
        const op1 = Math.random() < 0.5 ? '+' : '-'
        value = op1 === '+' ? numbers[0] + tempValue : numbers[0] - tempValue
        expr = `${numbers[0]} ${op1} ${numbers[1]} × ${numbers[2]}`
      }
    }
  } else {
    // 包含除法
    const divPos = Math.random() < 0.5 ? 0 : 1 // 除法位置

    if (withParentheses) {
      if (divPos === 0) {
        // (a ÷ b) ± c
        if (!allowFractions) {
          // 确保能整除
          const absA = Math.abs(numbers[0])
          const divisors: number[] = []
          for (let d = 1; d <= absA; d++) {
            if (absA % d === 0 && Math.abs(d).toString().length <= digits[1]) {
              divisors.push(d * (numbers[1] < 0 ? -1 : 1))
            }
          }
          const divisor = choose(divisors.length ? divisors : [1])
          value = numbers[0] / divisor
          const op2 = Math.random() < 0.5 ? '+' : '-'
          value = op2 === '+' ? value + numbers[2] : value - numbers[2]
          expr = `(${numbers[0]} ÷ ${divisor}) ${op2} ${numbers[2]}`
        } else {
          value = numbers[0] / numbers[1]
          const op2 = Math.random() < 0.5 ? '+' : '-'
          value = op2 === '+' ? value + numbers[2] : value - numbers[2]
          expr = `(${numbers[0]} ÷ ${numbers[1]}) ${op2} ${numbers[2]}`
        }
      } else {
        // a ÷ (b ± c)
        const op2 = Math.random() < 0.5 ? '+' : '-'
        const tempValue = op2 === '+' ? numbers[1] + numbers[2] : numbers[1] - numbers[2]

        if (!allowFractions && tempValue !== 0 && numbers[0] % tempValue === 0) {
          value = numbers[0] / tempValue
          expr = `${numbers[0]} ÷ (${numbers[1]} ${op2} ${numbers[2]})`
        } else if (allowFractions) {
          value = numbers[0] / tempValue
          expr = `${numbers[0]} ÷ (${numbers[1]} ${op2} ${numbers[2]})`
        } else {
          // 回退到不含除法的表达式
          return generateThreeTermsExpression(digitDifficulty, 'withMul', withParentheses, allowNegative, allowFractions)
        }
      }
    } else {
      if (divPos === 0) {
        // a ÷ b ± c (除法优先)
        if (!allowFractions) {
          const absA = Math.abs(numbers[0])
          const divisors: number[] = []
          for (let d = 1; d <= absA; d++) {
            if (absA % d === 0 && Math.abs(d).toString().length <= digits[1]) {
              divisors.push(d * (numbers[1] < 0 ? -1 : 1))
            }
          }
          const divisor = choose(divisors.length ? divisors : [1])
          value = numbers[0] / divisor
          const op2 = Math.random() < 0.5 ? '+' : '-'
          value = op2 === '+' ? value + numbers[2] : value - numbers[2]
          expr = `${numbers[0]} ÷ ${divisor} ${op2} ${numbers[2]}`
        } else {
          value = numbers[0] / numbers[1]
          const op2 = Math.random() < 0.5 ? '+' : '-'
          value = op2 === '+' ? value + numbers[2] : value - numbers[2]
          expr = `${numbers[0]} ÷ ${numbers[1]} ${op2} ${numbers[2]}`
        }
      } else {
        // a ± b ÷ c (除法优先)
        if (!allowFractions) {
          const absB = Math.abs(numbers[1])
          const divisors: number[] = []
          for (let d = 1; d <= absB; d++) {
            if (absB % d === 0 && Math.abs(d).toString().length <= digits[2]) {
              divisors.push(d * (numbers[2] < 0 ? -1 : 1))
            }
          }
          const divisor = choose(divisors.length ? divisors : [1])
          const tempValue = numbers[1] / divisor
          const op1 = Math.random() < 0.5 ? '+' : '-'
          value = op1 === '+' ? numbers[0] + tempValue : numbers[0] - tempValue
          expr = `${numbers[0]} ${op1} ${numbers[1]} ÷ ${divisor}`
        } else {
          const tempValue = numbers[1] / numbers[2]
          const op1 = Math.random() < 0.5 ? '+' : '-'
          value = op1 === '+' ? numbers[0] + tempValue : numbers[0] - tempValue
          expr = `${numbers[0]} ${op1} ${numbers[1]} ÷ ${numbers[2]}`
        }
      }
    }
  }

  return { expr, value, digitDifficulty }
}

// 根据技能类型制造策略性错误
function makeStrategicError(correct: number, skill: SkillTag, allowNegative: boolean): number {
  let v = correct

  switch (skill) {
    case 'lastDigit':
      // 只修改个位数，通常±1或±2
      const lastDigitChange = Math.random() < 0.7 ? (Math.random() < 0.5 ? -1 : 1) : (Math.random() < 0.5 ? -2 : 2)
      v = correct + lastDigitChange
      break

    case 'estimate':
      // 在估算范围边界轻微偏移，但保持个位数正确
      const lastDigit = correct % 10
      const magnitude = Math.pow(10, Math.floor(Math.log10(Math.abs(correct))) || 1)
      const estimateError = Math.round(magnitude * 0.1) * (Math.random() < 0.5 ? 1 : -1)
      v = correct + estimateError
      // 修正个位数保持正确
      v = Math.floor(v / 10) * 10 + lastDigit
      break

    case 'parity':
      // 破坏奇偶性
      v = correct + (correct % 2 === 0 ? 1 : -1)
      break

    case 'carryBorrow':
      // 个位正确但十位错误，通常是±10, ±20等
      const carryError = (Math.random() < 0.5 ? 10 : 20) * (Math.random() < 0.5 ? 1 : -1)
      v = correct + carryError
      break

    case 'specialDigits':
      // 破坏3或9的整除性，通过修改数字和
      const currentSum = digitSum(correct)
      const targetMod3 = (currentSum % 3 + 1) % 3 // 确保不被3整除
      const targetMod9 = (currentSum % 9 + 1) % 9 // 确保不被9整除
      const modTarget = Math.random() < 0.7 ? targetMod3 : targetMod9
      const diff = (modTarget - currentSum % 9 + 9) % 9 || 9
      v = correct + diff
      break

    case 'castingOutNines':
      // 使数字和模9不一致
      const currentMod9 = digitSumMod9(correct)
      const wrongMod9 = (currentMod9 + 1) % 9 || 9
      const castingError = ((wrongMod9 - currentMod9 + 9) % 9) || 9
      v = correct + castingError
      break

    case 'times11':
      // 针对11乘法规律的错误，常见的错误模式
      if (correct >= 100 && correct <= 9999) {
        // 对于两位数×11，常见错误是首位末位相加忘了进位
        const change = Math.random() < 0.5 ? 11 : 22
        v = correct + (Math.random() < 0.5 ? change : -change)
      } else {
        v = correct + (Math.random() < 0.5 ? 11 : -11)
      }
      break

    default:
      v = correct + 1
  }

  if (!allowNegative && v < 0) v = Math.abs(v)
  return v
}

// 检查题目是否符合特定技能的考察要求
function isQuestionSuitableForSkill(expr: string, value: number, skill: SkillTag): boolean {
  switch (skill) {
    case 'times11':
      // 必须是乘法且包含11
      return expr.includes('×') && expr.includes('11')

    case 'specialDigits':
      // 必须有乘数含3或9的倍数
      const numbers = expr.match(/\d+/g)
      if (!numbers) return false
      return numbers.some(num => {
        const n = parseInt(num)
        return (n % 3 === 0 || n % 9 === 0) && n !== 0
      })

    case 'castingOutNines':
      // 适合加法运算的弃九验算
      return expr.includes('+')

    default:
      return true
  }
}

export class QuestionGenerator {
  static createQuestion(level: number): Question {
    const digitParams = DifficultyManager.getDigitParams(level)
    const targetDigitDifficulty = randomInt(digitParams.digitRange.min, digitParams.digitRange.max)

    // 获取技能权重并选择目标技能
    const skillWeights = DifficultyManager.getSkillWeights(targetDigitDifficulty)
    const targetSkill = this.selectSkillByWeights(skillWeights)

    // 尝试生成符合技能要求的题目
    let attempts = 0
    let result: { expr: string; value: number; digitDifficulty: number }

    do {
      result = this.generateExpression(targetDigitDifficulty, digitParams)
      attempts++
    } while (attempts < 10 && !isQuestionSuitableForSkill(result.expr, result.value, targetSkill))

    // 如果多次尝试都不成功，使用备用策略
    if (attempts >= 10) {
      result = this.generateFallbackExpression(targetSkill, targetDigitDifficulty, digitParams)
    }

    // 决定是否制造错误（50%概率）
    const makeFalse = Math.random() < 0.5
    const shownValue = makeFalse ? makeStrategicError(result.value, targetSkill, digitParams.allowNegative) : result.value

    const questionString = `${result.expr} = ${shownValue}`

    return {
      questionString,
      isTrue: !makeFalse,
      targetSkills: [targetSkill],
      digitDifficulty: result.digitDifficulty,
      metadata: { expr: result.expr, correctValue: result.value, shownValue }
    }
  }

  private static selectSkillByWeights(weights: Record<SkillTag, number>): SkillTag {
    const entries = Object.entries(weights) as [SkillTag, number][]
    const filtered = entries.filter(([_, weight]) => weight > 0.001)

    if (filtered.length === 0) {
      return 'lastDigit' // 默认技能
    }

    const selectedKey = sampleByWeights(Object.fromEntries(filtered))
    return selectedKey as SkillTag
  }

  private static generateExpression(
    targetDifficulty: number,
    params: DigitDifficultyLevel
  ): { expr: string; value: number; digitDifficulty: number } {
    const exprWeights = this.flattenExpressionWeights(params.expressions)
    const exprType = sampleByWeights(exprWeights)

    switch (exprType) {
      case 'twoTermsSimple':
        return this.generateTwoTermsSimple(targetDifficulty, params)
      case 'twoTermsWithParentheses':
        return this.generateTwoTermsWithParentheses(targetDifficulty, params)
      case 'threeTermsNoParentheses':
        return this.generateThreeTermsNoParentheses(targetDifficulty, params)
      case 'threeTermsWithParentheses':
        return this.generateThreeTermsWithParentheses(targetDifficulty, params)
      default:
        return this.generateTwoTermsSimple(targetDifficulty, params)
    }
  }

  private static flattenExpressionWeights(expressions: ExpressionConfig): Record<string, number> {
    const weights: Record<string, number> = {}

    // 两数字简单表达式
    Object.entries(expressions.twoTerms.simple).forEach(([op, weight]) => {
      weights[`twoTermsSimple_${op}`] = weight
    })

    // 两数字带括号表达式
    Object.entries(expressions.twoTerms.withParentheses).forEach(([op, weight]) => {
      weights[`twoTermsWithParentheses_${op}`] = weight
    })

    // 三数字无括号表达式
    Object.entries(expressions.threeTerms.noParentheses).forEach(([type, weight]) => {
      weights[`threeTermsNoParentheses_${type}`] = weight
    })

    // 三数字带括号表达式
    Object.entries(expressions.threeTerms.withParentheses).forEach(([type, weight]) => {
      weights[`threeTermsWithParentheses_${type}`] = weight
    })

    return weights
  }

  private static generateTwoTermsSimple(
    targetDifficulty: number,
    params: DigitDifficultyLevel
  ): { expr: string; value: number; digitDifficulty: number } {
    const operators = Object.entries(params.expressions.twoTerms.simple)
      .filter(([_, weight]) => weight > 0.001) as [Operator, number][]
    const operator = sampleByWeights(Object.fromEntries(operators)) as Operator

    return generateTwoTermsExpression(
      targetDifficulty,
      operator,
      false,
      params.allowNegative,
      params.allowFractions
    )
  }

  private static generateTwoTermsWithParentheses(
    targetDifficulty: number,
    params: DigitDifficultyLevel
  ): { expr: string; value: number; digitDifficulty: number } {
    const operators = Object.entries(params.expressions.twoTerms.withParentheses)
      .filter(([_, weight]) => weight > 0.001) as [Operator, number][]
    const operator = sampleByWeights(Object.fromEntries(operators)) as Operator

    return generateTwoTermsExpression(
      targetDifficulty,
      operator,
      true,
      params.allowNegative,
      params.allowFractions
    )
  }

  private static generateThreeTermsNoParentheses(
    targetDifficulty: number,
    params: DigitDifficultyLevel
  ): { expr: string; value: number; digitDifficulty: number } {
    const types = Object.entries(params.expressions.threeTerms.noParentheses)
      .filter(([_, weight]) => weight > 0.001)
    const type = sampleByWeights(Object.fromEntries(types)) as 'plusMinus' | 'withMul' | 'withDiv'

    return generateThreeTermsExpression(
      targetDifficulty,
      type,
      false,
      params.allowNegative,
      params.allowFractions
    )
  }

  private static generateThreeTermsWithParentheses(
    targetDifficulty: number,
    params: DigitDifficultyLevel
  ): { expr: string; value: number; digitDifficulty: number } {
    const types = Object.entries(params.expressions.threeTerms.withParentheses)
      .filter(([_, weight]) => weight > 0.001)
    const type = sampleByWeights(Object.fromEntries(types)) as 'plusMinus' | 'mul' | 'div'

    if (type === 'plusMinus') {
      return generateThreeTermsExpression(
        targetDifficulty,
        'plusMinus',
        true,
        params.allowNegative,
        params.allowFractions
      )
    } else if (type === 'mul') {
      return generateThreeTermsExpression(
        targetDifficulty,
        'withMul',
        true,
        params.allowNegative,
        params.allowFractions
      )
    } else {
      return generateThreeTermsExpression(
        targetDifficulty,
        'withDiv',
        true,
        params.allowNegative,
        params.allowFractions
      )
    }
  }

  private static generateFallbackExpression(
    skill: SkillTag,
    targetDifficulty: number,
    params: DigitDifficultyLevel
  ): { expr: string; value: number; digitDifficulty: number } {
    // 为特定技能生成备用表达式
    switch (skill) {
      case 'times11':
        // 生成包含11的乘法
        const otherDigits = targetDifficulty - 2 // 11占2位
        const otherNum = generateNumberWithDigitCount(Math.max(1, otherDigits), params.allowNegative)
        const result = generateTwoTermsExpression(
          targetDifficulty,
          'mul',
          false,
          params.allowNegative,
          params.allowFractions
        )
        return {
          expr: `${otherNum} × 11`,
          value: otherNum * 11,
          digitDifficulty: targetDifficulty
        }

      case 'specialDigits':
        // 生成包含3或9倍数的乘法
        const digits = distributeDigits(targetDifficulty, 2)
        const a = generateNumberWithDigitCount(digits[0], params.allowNegative)
        let b = generateNumberWithDigitCount(digits[1], false)

        // 确保b是3或9的倍数
        if (b % 3 !== 0) {
          b = b + (3 - (b % 3))
        }

        return {
          expr: `${a} × ${b}`,
          value: a * b,
          digitDifficulty: targetDifficulty
        }

      default:
        // 默认生成简单的加法
        return generateTwoTermsExpression(
          targetDifficulty,
          'plus',
          false,
          params.allowNegative,
          params.allowFractions
        )
    }
  }
}