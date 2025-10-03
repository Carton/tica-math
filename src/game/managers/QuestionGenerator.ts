import { randomInt, sampleByWeights, choose } from '@/game/utils/mathUtils'
import type { DigitDifficultyLevel, ExpressionConfig, Operator, Question, SkillTag } from '@/game/utils/types'
import { DifficultyManager } from '@/game/managers/DifficultyManager'

type StructureKey =
  | 'twoTermsSimple_plus'
  | 'twoTermsSimple_minus'
  | 'twoTermsSimple_mul'
  | 'twoTermsSimple_div'
  | 'threeTermsNoParentheses_plusMinus'
  | 'threeTermsNoParentheses_withMul'
  | 'threeTermsNoParentheses_withDiv'

type ExpressionStructure =
  | { kind: 'twoTerms'; operator: Operator }
  | { kind: 'threeTerms'; variant: 'plusMinus' | 'withMul' | 'withDiv' }

type OperandPlan = { digits: number }

type ExpressionPlan = {
  structure: ExpressionStructure
  digitDifficulty: number
  operands: OperandPlan[]
}

const MAX_DIGIT_SPREAD = 2
const MAX_ATTEMPTS = 10
const FRACTIONS_ENABLED = false

function distributeDigits(totalDigits: number, operandCount: number): number[] {
  if (operandCount <= 0) return []
  if (operandCount === 1) return [totalDigits]

  const base = Math.floor(totalDigits / operandCount)
  const remainder = totalDigits - base * operandCount

  const result = Array.from({ length: operandCount }, (_, idx) => base + (idx < remainder ? 1 : 0))

  for (let i = 1; i < result.length; i++) {
    const spread = Math.abs(result[i] - result[i - 1])
    if (spread > MAX_DIGIT_SPREAD) {
      const adjust = Math.floor((spread - MAX_DIGIT_SPREAD) / 2)
      if (result[i] > result[i - 1]) {
        result[i] -= adjust
        result[i - 1] += adjust
      } else {
        result[i] += adjust
        result[i - 1] -= adjust
      }
    }
  }

  return result
}

function generateIntegerWithDigits(digits: number, allowNegative: boolean): number {
  const min = Math.pow(10, digits - 1)
  const max = Math.pow(10, digits) - 1
  let value = randomInt(min, max)

  if (allowNegative && Math.random() < 0.3) {
    value = -value
  }

  return value
}

function isStructureAllowedForSkill(structure: StructureKey, skill: SkillTag): boolean {
  switch (skill) {
    case 'carryBorrow':
      return structure.includes('plus') || structure.includes('minus')
    case 'specialDigits':
      return structure.includes('withMul') || structure === 'twoTermsSimple_mul'
    case 'castingOutNines':
      return structure.includes('plus')
    default:
      return true
  }
}

function flattenExpressionWeights(expressions: ExpressionConfig): Record<StructureKey, number> {
  const weights: Partial<Record<StructureKey, number>> = {}

  Object.entries(expressions.twoTerms.simple).forEach(([op, weight]) => {
    weights[`twoTermsSimple_${op}` as StructureKey] = weight
  })

  Object.entries(expressions.threeTerms.noParentheses).forEach(([variant, weight]) => {
    weights[`threeTermsNoParentheses_${variant}` as StructureKey] = weight
  })

  return weights as Record<StructureKey, number>
}

function buildExpressionPlan(
  digitDifficulty: number,
  config: DigitDifficultyLevel,
  skill: SkillTag
): ExpressionPlan {
  const weights = flattenExpressionWeights(config.expressions)
  const filtered: Record<string, number> = {}

  Object.entries(weights).forEach(([structure, weight]) => {
    if (weight <= 0) return
    if (isStructureAllowedForSkill(structure as StructureKey, skill)) {
      filtered[structure] = weight
    }
  })

  let selected = sampleByWeights(filtered)
  if (!selected) {
    console.warn(`[QuestionGenerator] 未找到符合技能 ${skill} 的表达式结构，使用 threeTermsPlusMinus 兜底`)
    selected = 'threeTermsNoParentheses_plusMinus'
  }

  if (selected.startsWith('twoTermsSimple')) {
    const operator = selected.split('_')[1] as Operator
    return {
      structure: { kind: 'twoTerms', operator },
      digitDifficulty,
      operands: distributeDigits(digitDifficulty, 2).map(d => ({ digits: d }))
    }
  }

  const variant = selected.split('_')[1] as 'plusMinus' | 'withMul' | 'withDiv'
  return {
    structure: { kind: 'threeTerms', variant },
    digitDifficulty,
    operands: distributeDigits(digitDifficulty, 3).map(d => ({ digits: d }))
  }
}

function ensureSkillCompatibility(expr: string, skill: SkillTag): boolean {
  switch (skill) {
    case 'specialDigits': {
      const numbers = expr.match(/-?\d+/g)
      if (!numbers) return false
      return numbers.some(n => {
        const value = parseInt(n, 10)
        if (value === 0) return false
        return value % 3 === 0 || value % 9 === 0
      })
    }
    case 'castingOutNines':
      return expr.includes('+')
    default:
      return true
  }
}

function executeBinary(operator: Operator, a: number, b: number): number {
  switch (operator) {
    case 'plus':
      return a + b
    case 'minus':
      return a - b
    case 'mul':
      return a * b
    case 'div':
      return a / b
  }
}

function symbolForOperator(operator: Operator): string {
  switch (operator) {
    case 'plus':
      return '+'
    case 'minus':
      return '-'
    case 'mul':
      return '×'
    case 'div':
      return '÷'
  }
}

function digitSum(value: number): number {
  let sum = 0
  let current = Math.abs(value)
  while (current > 0) {
    sum += current % 10
    current = Math.floor(current / 10)
  }
  return sum
}

function digitSumMod9(value: number): number {
  const sum = digitSum(value)
  return sum % 9
}

function makeStrategicError(expr: string, correctValue: number, skill: SkillTag, allowNegative: boolean): number {
  switch (skill) {
    case 'lastDigit': {
      let delta = 0
      while (delta === 0) {
        delta = randomInt(-5, 5)
      }
      let result = correctValue + delta
      if (!allowNegative && result < 0) {
        result = Math.abs(result)
      }
      return result
    }
    case 'estimate': {
      const abs = Math.abs(correctValue)
      const digits = abs.toString().length
      let result = correctValue
      if (digits > 1 && Math.random() < 0.5) {
          const highestPlace = Math.pow(10, digits - 1)
        const change = Math.random() < 0.5 ? -1 : 1
        result += change * highestPlace
      } else {
        const str = abs.toString()
        if (str.length > 1) {
          const insertPos = randomInt(1, str.length - 1)
          const insertDigit = randomInt(0, 9)
          const mutated = str.slice(0, insertPos) + insertDigit + str.slice(insertPos)
          result = parseInt(mutated, 10) * Math.sign(correctValue)
        } else {
          result += Math.random() < 0.5 ? -1 : 1
        }
      }
      const preservedLast = Math.floor(Math.abs(result) / 10) * 10 + Math.abs(correctValue % 10)
      return correctValue < 0 ? -preservedLast : preservedLast
    }
    case 'parity':
      return correctValue + (correctValue % 2 === 0 ? 1 : -1)
    case 'carryBorrow': {
      if (!(expr.includes('+') || expr.includes('-'))) return correctValue
      const step = Math.random() < 0.5 ? 10 : 20
      const direction = Math.random() < 0.5 ? -1 : 1
      let result = correctValue + step * direction
      if (!allowNegative && result < 0) {
        result = Math.abs(result)
      }
      return result
    }
    case 'specialDigits': {
      const base = correctValue
      for (let i = 0; i < 20; i++) {
        const delta = randomInt(1, 9) * 10 * (Math.random() < 0.5 ? -1 : 1)
        const candidate = base + delta
        if (Math.abs(candidate % 10) !== Math.abs(base % 10)) continue
        const sum = digitSum(candidate)
        const original = digitSum(base)
        if (sum % 3 !== original % 3 || sum % 9 !== original % 9) {
          return candidate
        }
      }
      return base + 10
    }
    case 'castingOutNines': {
      const base = correctValue
      const options = [9, 18, 27, 36, 45]
      for (const step of options) {
        let candidate = base + step
        if (Math.abs(candidate % 10) !== Math.abs(base % 10)) {
          candidate = Math.floor(candidate / 10) * 10 + Math.abs(base % 10)
        }
        if (digitSumMod9(candidate) !== digitSumMod9(base)) {
          return candidate
        }
      }
      return base + 9
    }
    default:
      return correctValue + 1
  }
}

function generateTwoTermsExpression(plan: ExpressionPlan, allowNegative: boolean, allowFractions: boolean): { expr: string; value: number } {
  const [leftPlan, rightPlan] = plan.operands
  let left = generateIntegerWithDigits(leftPlan.digits, allowNegative)
  let right = generateIntegerWithDigits(rightPlan.digits, allowNegative)
  const operator = plan.structure.kind === 'twoTerms' ? plan.structure.operator : 'plus'

  if (operator === 'minus' && !allowNegative && left < right) {
    [left, right] = [right, left]
  }

  if (operator === 'div') {
    if (!allowFractions) {
      const absLeft = Math.abs(left)
      const divisors: number[] = []
      for (let i = 1; i <= absLeft; i++) {
        if (absLeft % i === 0) {
          divisors.push(i)
        }
      }
      const divisor = choose(divisors.length ? divisors : [1])
      const value = absLeft / divisor
      const expr = `${Math.sign(left) < 0 ? '-' : ''}${Math.abs(left)} ÷ ${divisor}`
      return { expr, value }
    }
  }

  const expr = `${left} ${symbolForOperator(operator)} ${right}`
  return { expr, value: executeBinary(operator, left, right) }
}

function generateThreeTermsExpression(plan: ExpressionPlan, allowNegative: boolean, allowFractions: boolean): { expr: string; value: number } {
  const [firstPlan, secondPlan, thirdPlan] = plan.operands
  const numbers = [firstPlan, secondPlan, thirdPlan].map(op => generateIntegerWithDigits(op.digits, allowNegative))
  const [a, b, c] = numbers

  switch (plan.structure.kind === 'threeTerms' ? plan.structure.variant : 'plusMinus') {
    case 'plusMinus': {
      const op1 = Math.random() < 0.5 ? 'plus' : 'minus'
      const op2 = Math.random() < 0.5 ? 'plus' : 'minus'
      const expr = `${a} ${symbolForOperator(op1)} ${b} ${symbolForOperator(op2)} ${c}`
      const value = executeBinary(op2, executeBinary(op1, a, b), c)
      return { expr, value }
    }
    case 'withMul': {
      const mulFirst = Math.random() < 0.5
      if (mulFirst) {
        const op = Math.random() < 0.5 ? 'plus' : 'minus'
        const expr = `${a} × ${b} ${symbolForOperator(op)} ${c}`
        const value = executeBinary(op, a * b, c)
        return { expr, value }
      }
      const op = Math.random() < 0.5 ? 'plus' : 'minus'
      const expr = `${a} ${symbolForOperator(op)} ${b} × ${c}`
      const value = executeBinary(op, a, b * c)
      return { expr, value }
    }
    case 'withDiv': {
      if (!allowFractions) {
        return generateThreeTermsExpression({ ...plan, structure: { kind: 'threeTerms', variant: 'withMul' } }, allowNegative, allowFractions)
      }
      const op = Math.random() < 0.5 ? 'plus' : 'minus'
      const expr = `${a} ${symbolForOperator(op)} ${b} ÷ ${c}`
      const value = executeBinary(op, a, b / c)
      return { expr, value }
    }
  }
}

function generateExpression(plan: ExpressionPlan, allowNegative: boolean, allowFractions: boolean): { expr: string; value: number } {
  return plan.structure.kind === 'twoTerms'
    ? generateTwoTermsExpression(plan, allowNegative, allowFractions)
    : generateThreeTermsExpression(plan, allowNegative, allowFractions)
}

function tryGenerateExpression(
  plan: ExpressionPlan,
  allowNegative: boolean,
  allowFractions: boolean,
  skill: SkillTag
): { expr: string; value: number } | null {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const candidate = generateExpression(plan, allowNegative, allowFractions)
    if (!allowNegative && candidate.value < 0) {
      continue
    }
    if (!ensureSkillCompatibility(candidate.expr, skill)) {
      continue
    }
    return candidate
  }
  return null
}

function generateFallback(skill: SkillTag, digitDifficulty: number, allowNegative: boolean): { expr: string; value: number } {
  const digitParams = DifficultyManager.getDigitParams(digitDifficulty)
  const allowFractionsFlag = FRACTIONS_ENABLED && digitParams.allowFractions

  const digits = distributeDigits(digitDifficulty, skill === 'specialDigits' ? 2 : 2)

  switch (skill) {
    case 'specialDigits': {
      const left = generateIntegerWithDigits(digits[0], allowNegative)
      let right = generateIntegerWithDigits(digits[1], false)
      if (right % 3 !== 0) {
        right += (3 - (right % 3))
      }
      return { expr: `${left} × ${right}`, value: left * right }
    }
    case 'castingOutNines':
      return { expr: `${digits[0]} + ${digits[1]}`, value: digits[0] + digits[1] }
    default:
      return { expr: `${digits[0]} + ${digits[1]}`, value: digits[0] + digits[1] }
  }
}

export class QuestionGenerator {
  static createQuestion(level: number): Question {
    const digitParams = DifficultyManager.getDigitParams(level)
    const digitDifficulty = randomInt(digitParams.digitRange.min, digitParams.digitRange.max)

    const skillWeights = DifficultyManager.getSkillWeights(digitDifficulty)
    const skill = this.selectSkillByWeights(skillWeights)

    const allowFractionsFlag = FRACTIONS_ENABLED && digitParams.allowFractions

    const plan = buildExpressionPlan(digitDifficulty, digitParams, skill)
    const attempt = tryGenerateExpression(plan, digitParams.allowNegative, allowFractionsFlag, skill)

    const result = attempt ?? (() => {
      console.warn(`[QuestionGenerator] 在 ${MAX_ATTEMPTS} 次尝试后仍未生成技能 ${skill} 的合适题目，使用兜底方案`)
      return generateFallback(skill, digitDifficulty, digitParams.allowNegative)
    })()

    const makeFalse = Math.random() < 0.5
    const shownValue = makeFalse ? makeStrategicError(result.expr, result.value, skill, digitParams.allowNegative) : result.value

    return {
      questionString: `${result.expr} = ${shownValue}`,
      isTrue: !makeFalse,
      targetSkills: [skill],
      digitDifficulty,
      metadata: {
        expr: result.expr,
        correctValue: result.value,
        shownValue
      }
    }
  }

  private static selectSkillByWeights(weights: Record<SkillTag, number>): SkillTag {
    const candidates = Object.entries(weights).filter(([_, weight]) => weight > 0.001)
    if (candidates.length === 0) {
      return 'lastDigit'
    }
    return sampleByWeights(Object.fromEntries(candidates)) as SkillTag
  }
}