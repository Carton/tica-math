import type { SkillTag } from '@/game/utils/types'

export type StringsSchema = {
  ui: Record<string, string>
  skills: Record<string, { name: string; hint: string }>
  tools: Record<string, string>
}

export class Strings {
  private static data: StringsSchema | null = null

  static init(data: StringsSchema) {
    this.data = data
  }

  static t(path: string, fallback = ''): string {
    if (!this.data) return fallback
    const parts = path.split('.')
    let cur: any = this.data
    for (const p of parts) {
      cur = cur?.[p]
      if (cur == null) return fallback
    }
    return typeof cur === 'string' ? cur : fallback
  }

  static skillHint(tag: SkillTag): string {
    if (!this.data) return ''
    return this.data.skills?.[tag]?.hint ?? ''
  }
}
