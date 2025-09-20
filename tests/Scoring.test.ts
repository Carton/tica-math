import { gradeByAccuracy } from '@/game/utils/scoring'

test('grading thresholds', () => {
  expect(gradeByAccuracy(0.95, 0)).toBe('S')
  expect(gradeByAccuracy(0.85, 0)).toBe('A')
  expect(gradeByAccuracy(0.7, 0)).toBe('B')
  expect(gradeByAccuracy(0.5, 0)).toBe('C')
})

test('tool penalty raises thresholds', () => {
  const rank = { S: 3, A: 2, B: 1, C: 0 } as const
  const without = gradeByAccuracy(0.9, 0)
  const withTools = gradeByAccuracy(0.9, 3)
  expect(rank[withTools] <= rank[without]).toBe(true)
})
