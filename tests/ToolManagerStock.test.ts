import { SaveManager } from '@/game/managers/SaveManager'
import { ToolManager } from '@/game/managers/ToolManager'

beforeEach(() => {
  localStorage.clear()
  SaveManager.createUser('test')
  SaveManager.setCurrentUser('test')
})

test('tool stock decreases on use', () => {
  const c1 = ToolManager.getCounts()
  ToolManager.use('magnify')
  const c2 = ToolManager.getCounts()
  expect(c2.magnify).toBe(c1.magnify - 1)
})
