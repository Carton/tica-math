import { SaveManager } from '@/game/managers/SaveManager'

test('multi-user profiles separation', () => {
  // 清理
  localStorage.clear()

  SaveManager.createUser('a')
  SaveManager.createUser('b')
  SaveManager.setCurrentUser('a')
  const a1 = SaveManager.getCurrent()
  a1.exp = 100
  SaveManager.saveRaw({ currentUserId: 'a', users: { a: a1, b: SaveManager.getCurrent() } })

  SaveManager.setCurrentUser('b')
  const b = SaveManager.getCurrent()
  expect(b.exp).not.toBe(100)
})
