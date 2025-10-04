import { QuestionGenerator } from '@/game/managers/QuestionGenerator'
import { DifficultyManager } from '@/game/managers/DifficultyManager'

const diff = {
  version: "2.0",
  digitDifficultyLevels: [
    {
      level: 1,
      digitRange: { min: 2, max: 3 },
      skills: { "lastDigit": 70, "estimate": 30, "parity": 0, "castingOutNines": 0, "carryBorrow": 0, "specialDigits": 0 },
      expressions: { "twoTerms": { "simple": {"plus": 70, "minus": 30, "mul": 0, "div": 0 } }, "threeTerms": { "noParentheses": {}, "withParentheses": {}}},
      allowNegative: false, "allowFractions": false,
      timePerQuestionMs: 15000, "questionCount": 10
    },
    {
      level: 20,
      digitRange: { min: 3, max: 6 },
      skills: { "lastDigit": 30, "estimate": 30, "parity": 10, "castingOutNines": 10, "carryBorrow": 10, "specialDigits": 10 },
      expressions: {
        "twoTerms": { "simple": { "plus": 35, "minus": 25, "mul": 25, "div": 15 } },
        "threeTerms": { "noParentheses": { "plusMinus": 35 }, "withParentheses": {} }
      },
      allowNegative: false, "allowFractions": false,
      timePerQuestionMs: 11000, "questionCount": 10
    }
  ]
}

beforeAll(() => DifficultyManager.init(diff as any))

test('generate question basic fields', () => {
  const q = QuestionGenerator.createQuestion(5)
  expect(q.questionString).toContain('=')
  expect(typeof q.isTrue).toBe('boolean')
  expect(Array.isArray(q.targetSkills)).toBe(true)
  expect(typeof q.digitDifficulty).toBe('number')
})

test('level 30 以上会生成三项加减题', () => {
  const digitConfig = require('@/game/config/digit-difficulty.json')
  DifficultyManager.init(digitConfig)

  const samples = Array.from({ length: 200 }, () => QuestionGenerator.createQuestion(35))
  const hasThreeTerms = samples.some(q => q.metadata.expr.split(/\+|\-|×|÷/).length >= 3)

  expect(hasThreeTerms).toBe(true)
})

test('乘法表达式避免出现 × 1', () => {
  const digitConfig = require('@/game/config/digit-difficulty.json')
  DifficultyManager.init(digitConfig)

  const samples = Array.from({ length: 200 }, () => QuestionGenerator.createQuestion(40))
  const invalid = samples.some(q => /×\s*1(?![0-9])/u.test(q.metadata.expr))

  expect(invalid).toBe(false)
})