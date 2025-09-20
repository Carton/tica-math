import type { ResultSummary } from '@/game/utils/types'

const KEY = 'tica_math_game_save_v1'

export interface SaveData {
  bestLevel: number
  badges: string[]
  exp: number
  lastResult?: ResultSummary
  toolCounts?: { magnify: number; watch: number; flash: number }
}

export interface MultiSave {
  currentUserId: string
  users: Record<string, SaveData>
}

function defaultUser(): SaveData {
  return { bestLevel: 1, badges: [], exp: 0, toolCounts: { magnify: 3, watch: 3, flash: 3 } }
}

export class SaveManager {
  static loadRaw(): MultiSave {
    try {
      const raw = localStorage.getItem(KEY)
      if (!raw) return { currentUserId: 'default', users: { default: defaultUser() } }
      const parsed = JSON.parse(raw)
      // 兼容旧结构
      if (parsed && !parsed.users) {
        const legacy: SaveData = parsed
        return { currentUserId: 'default', users: { default: { ...defaultUser(), ...legacy, toolCounts: legacy.toolCounts ?? { magnify: 3, watch: 3, flash: 3 } } } }
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

  static updateWithResult(level: number, result: ResultSummary) {
    const data = this.loadRaw()
    const user = data.users[data.currentUserId] ?? (data.users[data.currentUserId] = defaultUser())
    user.lastResult = result
    if (level > user.bestLevel) user.bestLevel = level
    if (result.grade === 'S') user.badges = Array.from(new Set([...user.badges, `S_${level}`]))
    user.exp += Math.round(result.accuracy * 100)
    data.users[data.currentUserId] = user
    this.saveRaw(data)
  }

  static consumeTool(type: 'magnify'|'watch'|'flash'): boolean {
    const data = this.loadRaw()
    const user = data.users[data.currentUserId] ?? (data.users[data.currentUserId] = defaultUser())
    const stock = user.toolCounts ?? (user.toolCounts = { magnify: 3, watch: 3, flash: 3 })
    if (stock[type] > 0) {
      stock[type] -= 1
      this.saveRaw(data)
      return true
    }
    return false
  }

  static getToolCounts(): { magnify: number; watch: number; flash: number } {
    const data = this.loadRaw()
    const user = data.users[data.currentUserId] ?? defaultUser()
    return user.toolCounts ?? { magnify: 3, watch: 3, flash: 3 }
  }
}
