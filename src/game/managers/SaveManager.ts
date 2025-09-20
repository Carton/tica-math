import type { ResultSummary } from '@/game/utils/types'

const KEY = 'tica_math_game_save_v1'

export interface SaveData {
  bestLevel: number
  badges: string[]
  exp: number
  lastResult?: ResultSummary
}

export class SaveManager {
  static load(): SaveData {
    try {
      const raw = localStorage.getItem(KEY)
      if (!raw) return { bestLevel: 1, badges: [], exp: 0 }
      return JSON.parse(raw) as SaveData
    } catch {
      return { bestLevel: 1, badges: [], exp: 0 }
    }
  }

  static save(data: SaveData) {
    localStorage.setItem(KEY, JSON.stringify(data))
  }

  static updateWithResult(level: number, result: ResultSummary) {
    const data = this.load()
    data.lastResult = result
    if (level > data.bestLevel) data.bestLevel = level
    if (result.grade === 'S') data.badges = Array.from(new Set([...data.badges, `S_${level}`]))
    data.exp += Math.round(result.accuracy * 100)
    this.save(data)
  }
}
