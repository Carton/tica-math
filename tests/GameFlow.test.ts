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
  expect(resultPrimaryActionLabel(true)).toBe('下一局')
  expect(resultPrimaryActionLabel(false)).toBe('再来一局')
})
