import { SaveManager } from '@/game/managers/SaveManager'
import { ToolManager } from '@/game/managers/ToolManager'

beforeEach(() => {
  localStorage.clear()
  SaveManager.createUser('test')
  SaveManager.setCurrentUser('test')
})

test('tool stock decreases on use', () => {
  const c1 = ToolManager.getCounts()

  // 检查是否为debug模式
  const isDebugMode = typeof window !== 'undefined' && (
    (window as any).import_meta_env_DEV ||
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.search.includes('debug=true')
  )

  ToolManager.use('magnify')
  const c2 = ToolManager.getCounts()

  if (isDebugMode) {
    // debug模式下道具数不应该减少
    expect(c2.magnify).toBe(c1.magnify)
  } else {
    // 正常模式下道具数应该减少1
    expect(c2.magnify).toBe(c1.magnify - 1)
  }
})
