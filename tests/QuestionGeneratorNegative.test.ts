import { QuestionGenerator } from '@/game/managers/QuestionGenerator'
import { DifficultyManager } from '@/game/managers/DifficultyManager'

const diff = {
  version: "2.0",
  digitDifficultyLevels: [
    {
      level: 1,
      digitRange: { min: 2, max: 3 },
      skills: { "lastDigit": 70, "estimate": 30, "parity": 0, "castingOutNines": 0, "carryBorrow": 0, "specialDigits": 0 },
      expressions: { "twoTerms": { "simple": {"plus": 60, "minus": 40, "mul": 0, "div": 0 } }, "threeTerms": { "noParentheses": {}, "withParentheses": {}}},
      allowNegative: false, "allowFractions": false,
      timePerQuestionMs: 15000, "questionCount": 10
    }
  ]
}

beforeAll(() => DifficultyManager.init(diff as any))

test('no negative results when allowNegative=false', () => {
  for (let i = 0; i < 50; i++) {
    const q = QuestionGenerator.createQuestion(1)
    expect(q.metadata.shownValue).toBeGreaterThanOrEqual(0)
    expect(q.metadata.correctValue).toBeGreaterThanOrEqual(0)
  }
})
