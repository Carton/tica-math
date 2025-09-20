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

  let tries = 0
  while (tries++ < 100) {
    const a = randomInt(params.numberRange.min, params.numberRange.max)
    let b = randomInt(params.numberRange.min, params.numberRange.max)

    if (op === '/' && !params.allowDecimals) {
      const divisors: number[] = []
      for (let d = 1; d <= a; d++) if (a % d === 0) divisors.push(d)
      b = choose(divisors.length ? divisors : [1])
    }

    const valueRaw = op === '+' ? a + b : op === '-' ? a - b : op === '*' ? a * b : (params.allowDecimals ? a / b : Math.floor(a / b))
    if (!params.allowNegative && valueRaw < 0) continue

    const expr = `${a} ${op} ${b}`
    return { a, b, op, value: valueRaw, expr }
  }

  // 回退到加法
  const a = randomInt(params.numberRange.min, params.numberRange.max)
  const b = randomInt(params.numberRange.min, params.numberRange.max)
  const value = a + b
  const expr = `${a} + ${b}`
  return { a, b, op: '+', value, expr }
}

function makeStrategicError(correct: number, skills: SkillTag[], allowNegative: boolean): number {
  const pick = choose(skills)
  let v = correct
  switch (pick) {
    case 'lastDigit': v = correct + (Math.random() < 0.5 ? -1 : 1); break
    case 'estimate': v = Math.round(correct * (Math.random() < 0.5 ? 0.9 : 1.1)); break
    case 'parity': v = correct + (correct % 2 === 0 ? 1 : -1); break
    case 'castingOutNines': v = correct + ((9 - (digitSumMod9(correct) || 9)) % 9 || 1); break
    case 'carryBorrow': v = correct + (Math.random() < 0.5 ? 10 : -10); break
    case 'specialDigits': v = correct + (Math.random() < 0.5 ? 5 : -5); break
    case 'inverseOp': v = correct + (Math.random() < 0.5 ? 2 : -2); break
    case 'times11': v = correct + 11; break
    default: v = correct + 1
  }
  if (!allowNegative && v < 0) v = Math.abs(v)
  return v
}

export class QuestionGenerator {
  static createQuestion(params: DifficultyParams): Question {
    const { a, b, op, value, expr } = buildCorrectQuestion(params)

    const skills: SkillTag[] = []
    skills.push('lastDigit')
    if (op === '+' || op === '-') skills.push('estimate', 'parity', 'carryBorrow')
    if (op === '*') skills.push('parity', 'specialDigits')
    if (op === '/') skills.push('castingOutNines')

    const makeFalse = Math.random() < 0.5
    const shown = makeFalse ? makeStrategicError(value, skills, params.allowNegative) : value

    const questionString = `${expr} = ${shown}`

    return {
      questionString,
      isTrue: !makeFalse,
      targetSkills: [...new Set(skills)].slice(0, 3),
      metadata: { expr, correctValue: value, shownValue: shown },
    }
  }
}
