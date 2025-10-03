import { SaveManager } from '@/game/managers/SaveManager'
import { ToolManager } from '@/game/managers/ToolManager'
import { DebugHelper } from '@/utils/debugHelper'

beforeEach(() => {
  localStorage.clear()
  SaveManager.createUser('test')
  SaveManager.setCurrentUser('test')
})

test('tool stock decreases on use', () => {
  const c1 = ToolManager.getCounts()

  // 检查是否为debug模式
  ToolManager.use('magnify')
  const c2 = ToolManager.getCounts()

  if (DebugHelper.isDebugMode()) {
    // debug模式下道具数不应该减少
    expect(c2.magnify).toBe(c1.magnify)
  } else {
    // 正常模式下道具数应该减少1
    expect(c2.magnify).toBe(c1.magnify - 1)
  }
})
