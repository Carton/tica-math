import { QuestionGenerator } from '@/game/managers/QuestionGenerator'
import { DifficultyManager } from '@/game/managers/DifficultyManager'

const diff = {
  levels: [
    {
      level: 1,
      numberRange: { min: 1, max: 20 },
      operators: { plus: true, minus: true, mul: false, div: false },
      operatorWeights: { plus: 0.7, minus: 0.3, mul: 0, div: 0 },
      allowFractions: false,
      allowDecimals: false,
      allowNegative: false,
      threeTermsProbability: 0,
      allowParentheses: false,
      timePerQuestionMs: 15000,
      minTimeMs: 8000,
      questionCount: 10
    },
    {
      level: 20,
      numberRange: { min: 50, max: 999 },
      operators: { plus: true, minus: true, mul: true, div: true },
      operatorWeights: { plus: 0.35, minus: 0.25, mul: 0.25, div: 0.15 },
      allowFractions: false,
      allowDecimals: false,
      allowNegative: false,
      threeTermsProbability: 0.35,
      allowParentheses: true,
      timePerQuestionMs: 11000,
      minTimeMs: 6000,
      questionCount: 10
    }
  ]
}

beforeAll(() => DifficultyManager.init(diff as any))

test('generate question basic fields', () => {
  const params = DifficultyManager.getParams(5)
  const q = QuestionGenerator.createQuestion(params)
  expect(q.questionString).toContain('=')
  expect(typeof q.isTrue).toBe('boolean')
  expect(Array.isArray(q.targetSkills)).toBe(true)
})
