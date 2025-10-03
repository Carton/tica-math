// 调试助手 - 快速设置关卡进行测试
import { SaveManager } from '@/game/managers/SaveManager'

export class DebugHelper {
  /**
   * 检查是否为调试模式
   * 统一的调试模式判断逻辑，避免重复实现
   */
  public static isDebugMode(): boolean {
    // 在浏览器环境中
    if (typeof window !== 'undefined') {
      // 检查 URL 参数或其他浏览器特定的调试标志
      const urlParams = new URLSearchParams(window.location.search)
      return window.location.hostname === 'localhost' ||
             window.location.hostname === '127.0.0.1' ||
             urlParams.has('debug') ||
             // 检查全局调试标志（如果存在）
             (window as any).__DEBUG_MODE__ === true
    }

    // 在 Node.js 环境中（测试环境）
    if (typeof process !== 'undefined') {
      return process.env.NODE_ENV === 'development' ||
             process.env.DEBUG === 'true' ||
             process.env.JEST_WORKER_ID !== undefined // Jest 测试环境
    }

    return false
  }


  /**
   * 快速设置关卡（仅调试模式下可用）
   * @param level 目标关卡数
   * @param options 额外选项
   */
  static setLevel(level: number, options: {
    keepExp?: boolean
    keepBadges?: boolean
    enableInfiniteTools?: boolean
  } = {}): boolean {
    if (!this.isDebugMode()) {
      console.warn('DebugHelper.setLevel() 仅在调试模式下可用')
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
   * 完全重置游戏进度（仅调试模式下可用）
   */
  static resetGame(): boolean {
    if (!this.isDebugMode()) {
      console.warn('DebugHelper.resetGame() 仅在调试模式下可用')
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
    if (!this.isDebugMode()) {
      return { error: '仅在调试模式下可用' }
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
      isDebugMode: this.isDebugMode()
    }
  }
}

// 在调试模式下将DebugHelper暴露到全局，方便在控制台使用
if (typeof window !== 'undefined') {
  (window as any).DebugHelper = DebugHelper

  // 调试模式自动加载调试助手
  if (DebugHelper.isDebugMode()) {
    console.log('🎮 游戏调试助手已加载！')
    console.log('💡 使用方法：')
    console.log('  DebugHelper.setLevel(50) - 设置关卡为50')
    console.log('  DebugHelper.resetGame() - 重置游戏')
    console.log('  DebugHelper.getDebugInfo() - 查看调试信息')
    console.log('  DebugHelper.reloadGame() - 重载游戏')
  }
}