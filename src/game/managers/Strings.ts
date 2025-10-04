import type { SkillTag } from '@/game/utils/types'

export type StringsSchema = {
  ui: Record<string, string>
  manual: Record<string, string>
  skills: Record<string, { name: string; hint: string }>
  tools: Record<string, string>
  results: Record<string, string>
  errors: Record<string, string>
  debug: Record<string, string>
  user: Record<string, string>
}

export type LanguageCode = 'zh-CN' | 'en-US'

export class Strings {
  private static data: StringsSchema | null = null
  private static currentLanguage: LanguageCode = 'zh-CN'
  private static allStrings: Record<LanguageCode, StringsSchema> = {} as Record<LanguageCode, StringsSchema>

  static init(data: StringsSchema) {
    this.data = data
    this.allStrings[this.currentLanguage] = data
  }

  static setLanguage(language: LanguageCode) {
    if (this.allStrings[language]) {
      this.currentLanguage = language
      this.data = this.allStrings[language]
    }
  }

  static getLanguage(): LanguageCode {
    return this.currentLanguage
  }

  static getAvailableLanguages(): LanguageCode[] {
    return Object.keys(this.allStrings) as LanguageCode[]
  }

  static loadLanguage(language: LanguageCode, data: StringsSchema) {
    this.allStrings[language] = data
    if (language === this.currentLanguage) {
      this.data = data
    }
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

  // 便捷方法，直接访问常用字符串
  static get ui() { return this.data?.ui ?? {} }
  static get manual() { return this.data?.manual ?? {} }
  static get skills() { return this.data?.skills ?? {} }
  static get tools() { return this.data?.tools ?? {} }
  static get results() { return this.data?.results ?? {} }
  static get errors() { return this.data?.errors ?? {} }
  static get debug() { return this.data?.debug ?? {} }
  static get user() { return this.data?.user ?? {} }
}
