import { QuestionGenerator } from '@/game/managers/QuestionGenerator'
import { DifficultyManager } from '@/game/managers/DifficultyManager'

const diff = {
  levels: [
    {
      level: 1,
      numberRange: { min: 1, max: 9 },
      operators: { plus: true, minus: true, mul: false, div: false },
      operatorWeights: { plus: 0.5, minus: 0.5, mul: 0, div: 0 },
      allowFractions: false,
      allowDecimals: false,
      allowNegative: false,
      threeTermsProbability: 0,
      allowParentheses: false,
      timePerQuestionMs: 15000,
      minTimeMs: 8000,
      questionCount: 5
    }
  ]
}

beforeAll(() => DifficultyManager.init(diff as any))

test('no negative results when allowNegative=false', () => {
  for (let i = 0; i < 50; i++) {
    const p = DifficultyManager.getParams(1)
    const q = QuestionGenerator.createQuestion(p)
    expect(q.metadata.shownValue).toBeGreaterThanOrEqual(0)
    expect(q.metadata.correctValue).toBeGreaterThanOrEqual(0)
  }
})
