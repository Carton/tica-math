import { DifficultyManager } from '@/game/managers/DifficultyManager'

const diff = {
  levels: [
    { level: 1, numberRange: { min: 1, max: 10 }, operators: { plus: true, minus: false, mul: false, div: false }, operatorWeights: { plus: 1, minus: 0, mul: 0, div: 0 }, allowFractions: false, allowDecimals: false, allowNegative: false, threeTermsProbability: 0, allowParentheses: false, timePerQuestionMs: 15000, minTimeMs: 8000, questionCount: 10 },
    { level: 20, numberRange: { min: 100, max: 999 }, operators: { plus: true, minus: true, mul: true, div: true }, operatorWeights: { plus: 0.25, minus: 0.25, mul: 0.25, div: 0.25 }, allowFractions: false, allowDecimals: false, allowNegative: false, threeTermsProbability: 0.4, allowParentheses: true, timePerQuestionMs: 11000, minTimeMs: 6000, questionCount: 10 }
  ]
}

beforeAll(() => DifficultyManager.init(diff as any))

test('interpolates number range and weights', () => {
  const p = DifficultyManager.getParams(10)
  expect(p.numberRange.min).toBeGreaterThanOrEqual(1)
  expect(p.numberRange.max).toBeLessThanOrEqual(999)
  expect(p.operatorWeights.plus).toBeGreaterThan(0)
})
