import { randomInt, sampleByWeights, choose } from '@/game/utils/mathUtils'
import type { DifficultyParams, Question, SkillTag } from '@/game/utils/types'

function lastDigit(n: number) { return Math.abs(n) % 10 }
function digitSumMod9(n: number) {
  let s = 0; const abs = Math.abs(n)
  let x = abs
  while (x > 0) { s += x % 10; x = Math.floor(x / 10) }
  return s % 9
}

function buildCorrectQuestion(params: DifficultyParams): { a: number; b: number; op: '+'|'-'|'*'|'/' ; value: number; expr: string } {
  const opKey = sampleByWeights(params.operatorWeights)
  const op = opKey === 'plus' ? '+' : opKey === 'minus' ? '-' : opKey === 'mul' ? '*' : '/'
  const a = randomInt(params.numberRange.min, params.numberRange.max)
  let b = randomInt(params.numberRange.min, params.numberRange.max)

  if (op === '/' && !params.allowDecimals) {
    // 生成可整除的 b
    const divisors: number[] = []
    for (let d = 1; d <= a; d++) if (a % d === 0) divisors.push(d)
    b = choose(divisors.length ? divisors : [1])
  }

  const value = op === '+' ? a + b : op === '-' ? a - b : op === '*' ? a * b : (params.allowDecimals ? a / b : Math.floor(a / b))
  const expr = `${a} ${op} ${b}`
  return { a, b, op, value, expr }
}

function makeStrategicError(correct: number, skills: SkillTag[]): number {
  const pick = choose(skills)
  switch (pick) {
    case 'lastDigit': return correct + (Math.random() < 0.5 ? -1 : 1)
    case 'estimate': return Math.round(correct * (Math.random() < 0.5 ? 0.9 : 1.1))
    case 'parity': return correct + (correct % 2 === 0 ? 1 : -1)
    case 'castingOutNines': return correct + ((9 - (digitSumMod9(correct) || 9)) % 9 || 1)
    case 'carryBorrow': return correct + (Math.random() < 0.5 ? 10 : -10)
    case 'specialDigits': return correct + (Math.random() < 0.5 ? 5 : -5)
    case 'inverseOp': return correct + (Math.random() < 0.5 ? 2 : -2)
    case 'times11': return correct + 11
    default: return correct + 1
  }
}

export class QuestionGenerator {
  static createQuestion(params: DifficultyParams): Question {
    const { a, b, op, value, expr } = buildCorrectQuestion(params)

    // 选择与表达式相关的技能标签集合（简化映射）
    const skills: SkillTag[] = []
    skills.push('lastDigit')
    if (op === '+' || op === '-') skills.push('estimate', 'parity', 'carryBorrow')
    if (op === '*') skills.push('parity', 'specialDigits')
    if (op === '/') skills.push('castingOutNines')

    const makeFalse = Math.random() < 0.5
    const shown = makeFalse ? makeStrategicError(value, skills) : value

    const questionString = `${expr} = ${shown}`

    return {
      questionString,
      isTrue: !makeFalse,
      targetSkills: [...new Set(skills)].slice(0, 3),
      metadata: { expr, correctValue: value, shownValue: shown },
    }
  }
}
