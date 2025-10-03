import { isPass, nextLevel, resultPrimaryActionLabel } from '@/game/utils/gameFlow'

test('pass decision by accuracy', () => {
  expect(isPass(0.8)).toBe(true)
  expect(isPass(0.79)).toBe(false)
})

test('next level logic', () => {
  expect(nextLevel(1, true)).toBe(2)
  expect(nextLevel(5, false)).toBe(5)
})

test('primary action label', () => {
  const mockT = (key: string) => key === 'ui.next_case' ? '下个案件' : '重新分析此案件'
  expect(resultPrimaryActionLabel(true, mockT)).toBe('下个案件')
  expect(resultPrimaryActionLabel(false, mockT)).toBe('重新分析此案件')
})
