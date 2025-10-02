import { SaveManager } from '@/game/managers/SaveManager'
import { ToolManager } from '@/game/managers/ToolManager'

test('tool stock resets to default on new run', () => {
  localStorage.clear()
  SaveManager.createUser('u')
  SaveManager.setCurrentUser('u')
  // 消耗一次
  ToolManager.use('magnify')
  const c1 = ToolManager.getCounts()

  // 检查是否为debug模式
  const isDebugMode = typeof window !== 'undefined' && (
    (window as any).import_meta_env_DEV ||
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.search.includes('debug=true')
  )

  if (isDebugMode) {
    // debug模式下应该有999个道具，消耗后仍为999
    expect(c1.magnify).toBe(999)
    ToolManager.resetToDefault()
    const c2 = ToolManager.getCounts()
    expect(c2.magnify).toBe(999)
    expect(c2.watch).toBe(999)
    expect(c2.light).toBe(999)
  } else {
    // 正常模式下应该有2个道具，重置后为3个
    expect(c1.magnify).toBe(2)
    ToolManager.resetToDefault()
    const c2 = ToolManager.getCounts()
    expect(c2.magnify).toBe(3)
    expect(c2.watch).toBe(3)
    expect(c2.light).toBe(3)
  }
})
