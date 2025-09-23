import { gradeByAccuracy } from '@/game/utils/scoring'

describe('Scoring', () => {
  describe('gradeByAccuracy', () => {
    test('应该根据准确率正确评级', () => {
      expect(gradeByAccuracy(0.95, 0)).toBe('S')
      expect(gradeByAccuracy(0.85, 0)).toBe('A')
      expect(gradeByAccuracy(0.70, 0)).toBe('B')
      expect(gradeByAccuracy(0.50, 0)).toBe('C')
    })

    test('应该考虑道具使用惩罚', () => {
      const rank = { S: 3, A: 2, B: 1, C: 0 } as const
      const without = gradeByAccuracy(0.9, 0)
      const withTools = gradeByAccuracy(0.9, 3)
      expect(rank[withTools] <= rank[without]).toBe(true)
    })

    test('边界情况应该被正确处理', () => {
      // 刚好达到阈值
      expect(gradeByAccuracy(0.90, 0)).toBe('S')
      expect(gradeByAccuracy(0.80, 0)).toBe('A')
      expect(gradeByAccuracy(0.65, 0)).toBe('B')

      // 刚好低于阈值
      expect(gradeByAccuracy(0.899, 0)).toBe('A')
      expect(gradeByAccuracy(0.799, 0)).toBe('B')
      expect(gradeByAccuracy(0.649, 0)).toBe('C')
    })

    test('道具使用应该动态调整阈值', () => {
      const testCases = [
        { accuracy: 0.95, tools: 0, expected: 'S' },
        { accuracy: 0.93, tools: 1, expected: 'S' }, // 0.93 >= 0.92
        { accuracy: 0.91, tools: 2, expected: 'A' }, // 0.91 < 0.84? 否，应该是A
        { accuracy: 0.97, tools: 3, expected: 'S' }, // 0.97 >= 0.97
      ]

      testCases.forEach(({ accuracy, tools, expected }) => {
        expect(gradeByAccuracy(accuracy, tools)).toBe(expected)
      })
    })

    test('极端准确率应该被正确处理', () => {
      expect(gradeByAccuracy(1.0, 0)).toBe('S')
      expect(gradeByAccuracy(0.0, 0)).toBe('C')
      expect(gradeByAccuracy(1.0, 5)).toBe('S') // 即使使用很多道具，完美准确率仍应该是S
    })

    test('负数准确率应该被处理', () => {
      expect(gradeByAccuracy(-0.1, 0)).toBe('C')
    })

    test('超过1的准确率应该被处理', () => {
      expect(gradeByAccuracy(1.5, 0)).toBe('S')
    })

    test('不同数量道具的影响', () => {
      // 测试不同道具数量对阈值的影响
      expect(gradeByAccuracy(0.89, 0)).toBe('A')  // 0.89 < 0.90 -> A
      expect(gradeByAccuracy(0.89, 1)).toBe('A')  // 0.89 < 0.92 -> A
      expect(gradeByAccuracy(0.89, 2)).toBe('A')  // 0.89 < 0.84? 否，应该是A
      expect(gradeByAccuracy(0.89, 3)).toBe('A')  // 0.89 < 0.97 -> A
    })
  })
})
