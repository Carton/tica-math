import type { ResultSummary } from '@/game/utils/types'

const KEY = 'tica_math_game_save_v1'

export interface SaveData {
  bestLevel: number
  currentLevel: number  // 当前应该开始的关卡（闯关成功后更新）
  badges: string[]
  exp: number
  lastResult?: ResultSummary
  toolCounts?: { magnify: number; watch: number; light: number }
}

export interface MultiSave {
  currentUserId: string
  users: Record<string, SaveData>
}

function defaultUser(): SaveData {
  return { bestLevel: 1, currentLevel: 1, badges: [], exp: 0, toolCounts: SaveManager.getDefaultToolCounts() }
}

export class SaveManager {
  // 获取默认道具数，支持debug模式
  static getDefaultToolCounts(): { magnify: number; watch: number; light: number } {
    // 检查是否为debug模式
    const isDebugMode = typeof window !== 'undefined' && (
      (window as any).import_meta_env_DEV || // 兼容 import.meta.env.DEV
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.search.includes('debug=true')
    )

    if (isDebugMode) {
      return { magnify: 999, watch: 999, light: 999 } // debug模式下道具无限
    }

    return { magnify: 3, watch: 3, light: 3 } // 正常模式默认道具数
  }
  static loadRaw(): MultiSave {
    try {
      const raw = localStorage.getItem(KEY)
      if (!raw) return { currentUserId: 'default', users: { default: defaultUser() } }
      const parsed = JSON.parse(raw)
      if (parsed && !parsed.users) {
        const legacy: SaveData = parsed
        return { currentUserId: 'default', users: { default: {
          ...defaultUser(),
          ...legacy,
          currentLevel: legacy.currentLevel ?? legacy.bestLevel ?? 1, // 兼容旧数据
          toolCounts: legacy.toolCounts ?? SaveManager.getDefaultToolCounts()
        } } }
      }
      // 兼容现有用户数据中可能没有currentLevel的情况
      if (parsed.users) {
        Object.keys(parsed.users).forEach(userId => {
          const user = parsed.users[userId]
          if (!user.currentLevel) {
            user.currentLevel = user.bestLevel ?? 1
          }
        })
      }
      return parsed as MultiSave
    } catch {
      return { currentUserId: 'default', users: { default: defaultUser() } }
    }
  }

  static saveRaw(data: MultiSave) {
    localStorage.setItem(KEY, JSON.stringify(data))
  }

  static getCurrentUserId(): string {
    return this.loadRaw().currentUserId
  }

  static getCurrent(): SaveData {
    const data = this.loadRaw()
    return data.users[data.currentUserId] ?? defaultUser()
  }

  static setCurrentUser(userId: string) {
    const data = this.loadRaw()
    if (!data.users[userId]) data.users[userId] = defaultUser()
    data.currentUserId = userId
    this.saveRaw(data)
  }

  static createUser(userId: string) {
    const data = this.loadRaw()
    if (!data.users[userId]) data.users[userId] = defaultUser()
    this.saveRaw(data)
  }

  static getAllUsers(): { id: string; data: SaveData }[] {
    const data = this.loadRaw()
    return Object.entries(data.users).map(([id, d]) => ({ id, data: d }))
  }

  static calculateComboEXPBonus(comboMax: number, baseEXP: number): number {
    let bonusRatio = 0
    if (comboMax >= 10) bonusRatio = 0.3      // 10+连击：30%加成
    else if (comboMax >= 8) bonusRatio = 0.2  // 8-9连击：20%加成
    else if (comboMax >= 6) bonusRatio = 0.15  // 6-7连击：15%加成
    else if (comboMax >= 4) bonusRatio = 0.1   // 4-5连击：10%加成
    else if (comboMax >= 3) bonusRatio = 0.05  // 3连击：5%加成

    return Math.round(baseEXP * bonusRatio)
  }

  static updateWithResult(level: number, result: ResultSummary) {
    const data = this.loadRaw()
    const user = data.users[data.currentUserId] ?? (data.users[data.currentUserId] = defaultUser())
    user.lastResult = result
    if (level > user.bestLevel) user.bestLevel = level

    // 如果闯关成功，更新当前应该开始的关卡并给予EXP奖励
    if (result.pass) {
      user.currentLevel = level + 1

      // 计算基础EXP和连击加成
      const baseEXP = Math.round(result.accuracy * 100)
      const comboBonus = this.calculateComboEXPBonus(result.comboMax, baseEXP)
      const totalEXP = baseEXP + comboBonus

      user.exp += totalEXP

      if (result.grade === 'S') user.badges = Array.from(new Set([...user.badges, `S_${level}`]))
    }
    data.users[data.currentUserId] = user
    this.saveRaw(data)
  }

  static setToolCounts(counts: { magnify: number; watch: number; light: number }) {
    const data = this.loadRaw()
    const user = data.users[data.currentUserId] ?? (data.users[data.currentUserId] = defaultUser())
    user.toolCounts = { ...counts }
    this.saveRaw(data)
  }

  static resetToolCountsToDefault() {
    this.setToolCounts(SaveManager.getDefaultToolCounts())
  }

  static consumeTool(type: 'magnify'|'watch'|'light'): boolean {
    const data = this.loadRaw()
    const user = data.users[data.currentUserId] ?? (data.users[data.currentUserId] = defaultUser())

    // 检查是否为debug模式，如果是则不消耗道具
    const isDebugMode = typeof window !== 'undefined' && (
      (window as any).import_meta_env_DEV || // 兼容 import.meta.env.DEV
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.search.includes('debug=true')
    )

    if (isDebugMode) {
      return true // debug模式下道具无限，不消耗
    }

    const stock = user.toolCounts ?? (user.toolCounts = this.getDefaultToolCounts())
    if (stock[type] > 0) {
      stock[type] -= 1
      this.saveRaw(data)
      return true
    }
    return false
  }

  static getToolCounts(): { magnify: number; watch: number; light: number } {
    const data = this.loadRaw()
    const user = data.users[data.currentUserId] ?? defaultUser()
    return user.toolCounts ?? this.getDefaultToolCounts()
  }
}
