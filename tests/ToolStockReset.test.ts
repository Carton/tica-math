import { SaveManager } from '@/game/managers/SaveManager'
import { ToolManager } from '@/game/managers/ToolManager'

test('tool stock resets to default on new run', () => {
  localStorage.clear()
  SaveManager.createUser('u')
  SaveManager.setCurrentUser('u')
  // 消耗一次
  ToolManager.use('magnify')
  const c1 = ToolManager.getCounts()
  expect(c1.magnify).toBe(2)
  // 重置
  ToolManager.resetToDefault()
  const c2 = ToolManager.getCounts()
  expect(c2.magnify).toBe(3)
  expect(c2.watch).toBe(3)
  expect(c2.flash).toBe(3)
})
