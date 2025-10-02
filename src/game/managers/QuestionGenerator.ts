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
  const lastDigit = correct % 10
  const absCorrect = Math.abs(correct)

  switch (skill) {
    case 'lastDigit':
      // 只修改个位数，在±5范围内（排除0）
      let lastDigitChange
      do {
        lastDigitChange = Math.floor(Math.random() * 11) - 5 // -5 到 5
      } while (lastDigitChange === 0)
      v = correct + lastDigitChange
      break

    case 'estimate':
      // 估算错误：首位±1（50%）或者中间位数插入/删除（50%）
      if (Math.random() < 0.5) {
        // 方案1：在最高位上±1
        const digits = absCorrect.toString().length
        if (digits >= 2) {
          const highestPlace = Math.pow(10, digits - 1)
          let change
          do {
            change = Math.floor(Math.random() * 3) - 1 // -1 到 1，排除0
          } while (change === 0)
          v = correct + change * highestPlace
        } else {
          let change
          do {
            change = Math.floor(Math.random() * 3) - 1 // -1 到 1，排除0
          } while (change === 0)
          v = correct + change
        }
      } else {
        // 方案2：在中间插入或删除一个数字
        const digits = absCorrect.toString().length
        const correctStr = absCorrect.toString()

        if (Math.random() < 0.5) {
          // 插入一个数字
          if (digits >= 2) {
            const insertPos = Math.floor(Math.random() * (digits - 1)) + 1 // 1到digits-1位（不在首位插入）
            const insertDigit = Math.floor(Math.random() * 10) // 0-9
            const newStr = correctStr.slice(0, insertPos) + insertDigit + correctStr.slice(insertPos)
            v = parseInt(newStr) * (correct < 0 ? -1 : 1)
          } else {
            // 一位数，简单在后面加一位
            const insertDigit = Math.floor(Math.random() * 10)
            v = parseInt(correctStr + insertDigit) * (correct < 0 ? -1 : 1)
          }
        } else {
          // 删除一个数字
          if (digits >= 3) {
            const deletePos = Math.floor(Math.random() * (digits - 1)) + 1 // 1到digits-1位（不删除首位）
            const newStr = correctStr.slice(0, deletePos) + correctStr.slice(deletePos + 1)
            v = parseInt(newStr) * (correct < 0 ? -1 : 1)
          } else if (digits === 2) {
            // 两位数，删除第二位
            v = parseInt(correctStr[0]) * (correct < 0 ? -1 : 1)
          } else {
            // 一位数，只能变成0
            v = 0
          }
        }
      }
      // 保持个位数正确
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
      // 破坏3或9的整除性，但不修改个位数，支持更大的数值变化
      const currentSum = digitSum(correct)
      const targetMod3 = (currentSum % 3 + 1) % 3 // 确保不被3整除
      const targetMod9 = (currentSum % 9 + 1) % 9 // 确保不被9整除
      const modTarget = Math.random() < 0.7 ? targetMod3 : targetMod9

      // 支持更大的数值变化：±10, ±100, ±1000等
      const magnitudes = [10, 100, 1000]
      let found = false

      for (let attempt = 0; attempt < 50 && !found; attempt++) {
        // 随机选择一个数量级
        const magnitude = magnitudes[Math.floor(Math.random() * magnitudes.length)]
        // 在该数量级内寻找合适的修改
        for (let i = 1; i <= magnitude / 10 && i <= 100; i++) {
          const testDiff = i * magnitude * (Math.random() < 0.5 ? 1 : -1)
          const candidate = correct + testDiff
          if (candidate % 10 === lastDigit) {
            const candidateSum = digitSum(candidate)
            if ((modTarget === targetMod3 && candidateSum % 3 !== currentSum % 3) ||
                (modTarget === targetMod9 && candidateSum % 9 !== currentSum % 9)) {
              v = candidate
              found = true
              break
            }
          }
        }
      }

      // 如果还没找到，尝试更大的变化（±5000等）
      if (!found) {
        for (let attempt = 0; attempt < 20 && !found; attempt++) {
          const largeChange = (Math.random() < 0.5 ? 1 : -1) * (5000 + Math.floor(Math.random() * 5000))
          const candidate = correct + largeChange
          if (candidate % 10 === lastDigit) {
            const candidateSum = digitSum(candidate)
            if ((modTarget === targetMod3 && candidateSum % 3 !== currentSum % 3) ||
                (modTarget === targetMod9 && candidateSum % 9 !== currentSum % 9)) {
              v = candidate
              found = true
            }
          }
        }
      }

      // 最后的回退方案
      if (!found) {
        const diff = 100 * (Math.random() < 0.5 ? 1 : -1)
        v = correct + diff
      }
      break

    case 'castingOutNines':
      // 使数字和模9不一致，但保证个位数不变
      const currentMod9_value = digitSumMod9(correct)
      const wrongMod9_value = (currentMod9_value + 1) % 9 || 9

      // 寻找合适的修改方案，确保个位数不变且弃九验算失效
      let foundCasting = false

      // 尝试不同的修改策略
      const strategies = [
        () => {
          // 策略1：修改十位数，保持个位数不变
          for (let tensChange = -9; tensChange <= 9; tensChange++) {
            if (tensChange === 0) continue
            const candidate = correct + tensChange * 10
            if (candidate % 10 === lastDigit && digitSumMod9(candidate) === wrongMod9_value) {
              return candidate
            }
          }
          return null
        },
        () => {
          // 策略2：修改百位数
          for (let hundredsChange = -9; hundredsChange <= 9; hundredsChange++) {
            if (hundredsChange === 0) continue
            const candidate = correct + hundredsChange * 100
            if (candidate % 10 === lastDigit && digitSumMod9(candidate) === wrongMod9_value) {
              return candidate
            }
          }
          return null
        },
        () => {
          // 策略3：修改千位数
          for (let thousandsChange = -9; thousandsChange <= 9; thousandsChange++) {
            if (thousandsChange === 0) continue
            const candidate = correct + thousandsChange * 1000
            if (candidate % 10 === lastDigit && digitSumMod9(candidate) === wrongMod9_value) {
              return candidate
            }
          }
          return null
        },
        () => {
          // 策略4：组合修改多个位数
          const baseChanges = [9, 18, 27, 36, 45, 54, 63, 72, 81]
          for (let change of baseChanges) {
            const candidate1 = correct + change
            const candidate2 = correct - change
            if (candidate1 % 10 === lastDigit && digitSumMod9(candidate1) === wrongMod9_value) {
              return candidate1
            }
            if (candidate2 % 10 === lastDigit && digitSumMod9(candidate2) === wrongMod9_value) {
              return candidate2
            }
          }
          return null
        }
      ]

      // 尝试所有策略
      for (let strategy of strategies) {
        const result = strategy()
        if (result !== null) {
          v = result
          foundCasting = true
          break
        }
      }

      // 如果所有策略都失败，使用强制修改
      if (!foundCasting) {
        // 直接修改数字，然后调整以保持个位数
        const baseChange = 9 // 9的倍数可以改变弃九验算结果
        const attempts = 100
        for (let i = 1; i <= attempts; i++) {
          const multiplier = Math.floor(Math.random() * 10) + 1
          const testChange = baseChange * multiplier * (Math.random() < 0.5 ? 1 : -1)
          const candidate = correct + testChange
          if (candidate % 10 === lastDigit && digitSumMod9(candidate) !== currentMod9_value) {
            v = candidate
            foundCasting = true
            break
          }
        }

        // 最后的回退
        if (!foundCasting) {
          // 强制调整：先改变数字，再调整回个位数
          let finalCandidate = correct + 90 // 修改十位数
          if (finalCandidate % 10 !== lastDigit) {
            finalCandidate = Math.floor(finalCandidate / 10) * 10 + lastDigit
          }
          v = finalCandidate
        }
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

      case 'castingOutNines':
        // 生成加法题目用于弃九验算
        return generateTwoTermsExpression(
          targetDifficulty,
          'plus',
          false,
          params.allowNegative,
          params.allowFractions
        )

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