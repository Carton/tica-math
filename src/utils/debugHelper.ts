// 调试助手 - 快速设置关卡进行测试
import { SaveManager } from '@/game/managers/SaveManager'

export class DebugHelper {
  // 检查是否为开发环境
  private static isDevelopment(): boolean {
    return import.meta.env.DEV ||
           window.location.hostname === 'localhost' ||
           window.location.hostname === '127.0.0.1' ||
           window.location.search.includes('debug=true')
  }

  /**
   * 快速设置关卡（仅开发环境可用）
   * @param level 目标关卡数
   * @param options 额外选项
   */
  static setLevel(level: number, options: {
    keepExp?: boolean
    keepBadges?: boolean
    enableInfiniteTools?: boolean
  } = {}): boolean {
    if (!this.isDevelopment()) {
      console.warn('DebugHelper.setLevel() 仅在开发环境中可用')
      return false
    }

    try {
      const data = SaveManager.loadRaw()
      const userId = data.currentUserId
      const userData = data.users[userId]

      // 设置关卡
      userData.bestLevel = Math.max(userData.bestLevel, level)
      userData.currentLevel = level

      // 可选：重置其他数据
      if (!options.keepExp) userData.exp = 0
      if (!options.keepBadges) userData.badges = []

      // 调试模式下道具无限
      if (options.enableInfiniteTools !== false) {
        userData.toolCounts = { magnify: 999, watch: 999, light: 999 }
      }

      SaveManager.saveRaw(data)
      console.log(`✅ 调试：关卡已设置为 ${level}`)
      console.log('💡 提示：刷新页面生效，或调用 DebugHelper.reloadGame()')

      return true
    } catch (error) {
      console.error('❌ 调试：设置关卡失败', error)
      return false
    }
  }

  // addTools方法已移除 - 调试模式下道具无限

  /**
   * 完全重置游戏进度（仅开发环境可用）
   */
  static resetGame(): boolean {
    if (!this.isDevelopment()) {
      console.warn('DebugHelper.resetGame() 仅在开发环境中可用')
      return false
    }

    try {
      const data = SaveManager.loadRaw()
      const userId = data.currentUserId
      data.users[userId] = {
        bestLevel: 1,
        currentLevel: 1,
        badges: [],
        exp: 0,
        toolCounts: { magnify: 3, watch: 3, light: 3 }
      }
      SaveManager.saveRaw(data)
      console.log('✅ 调试：游戏已重置')
      return true
    } catch (error) {
      console.error('❌ 调试：重置游戏失败', error)
      return false
    }
  }

  /**
   * 重载页面以应用更改
   */
  static reloadGame(): void {
    window.location.reload()
  }

  /**
   * 获取当前调试信息
   */
  static getDebugInfo(): any {
    if (!this.isDevelopment()) {
      return { error: '仅在开发环境中可用' }
    }

    const data = SaveManager.loadRaw()
    const userId = data.currentUserId
    const userData = data.users[userId]

    return {
      currentLevel: userData.currentLevel,
      bestLevel: userData.bestLevel,
      exp: userData.exp,
      badges: userData.badges,
      tools: userData.toolCounts,
      isDevelopment: this.isDevelopment()
    }
  }
}

// 在开发环境中将DebugHelper暴露到全局，方便在控制台使用
if (typeof window !== 'undefined') {
  (window as any).DebugHelper = DebugHelper

  // 开发环境自动加载调试助手
  if (import.meta.env.DEV) {
    console.log('🎮 游戏调试助手已加载！')
    console.log('💡 使用方法：')
    console.log('  DebugHelper.setLevel(50) - 设置关卡为50')
    console.log('  DebugHelper.addTools(10, 5, 3) - 添加道具')
    console.log('  DebugHelper.resetGame() - 重置游戏')
    console.log('  DebugHelper.getDebugInfo() - 查看调试信息')
    console.log('  DebugHelper.reloadGame() - 重载游戏')
  }
}