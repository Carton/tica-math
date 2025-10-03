import { SaveManager } from '@/game/managers/SaveManager'
import { ToolManager } from '@/game/managers/ToolManager'
import { DebugHelper } from '@/utils/debugHelper'

test('tool stock resets to default on new run', () => {
  localStorage.clear()
  SaveManager.createUser('u')
  SaveManager.setCurrentUser('u')
  // 消耗一次
  ToolManager.use('magnify')
  const c1 = ToolManager.getCounts()

  // 检查是否为debug模式
  if (DebugHelper.isDebugMode()) {
    // debug模式下应该有999个道具，消耗后仍为999
    expect(c1.magnify).toBe(999)
    ToolManager.resetToDefault()
    const c2 = ToolManager.getCounts()
    expect(c2.magnify).toBe(999)
    expect(c2.watch).toBe(999)
    expect(c2.light).toBe(999)
  } else {
    // 正常模式下应该有2个道具，重置后恢复默认值
    expect(c1.magnify).toBe(2)
    ToolManager.resetToDefault()
    const c2 = ToolManager.getCounts()
    expect(c2.magnify).toBe(3) // 默认3个放大镜
    expect(c2.watch).toBe(2)   // 默认2个时钟
    expect(c2.light).toBe(1)   // 默认1个灯泡
  }
})
