import { emit } from '@/game/managers/EventBus'
import type { Question, SkillTag } from '@/game/utils/types'
import { Strings } from '@/game/managers/Strings'
import { SaveManager } from '@/game/managers/SaveManager'

export type ToolType = 'magnify' | 'watch' | 'light'

export class ToolManager {
  private static current?: Question

  static resetToDefault() {
    SaveManager.resetToolCountsToDefault()
    emit('tool:update', this.getCounts() as any)
  }

  static setQuestion(q: Question | undefined) {
    this.current = q
  }

  static getCounts() { return SaveManager.getToolCounts() }

  static use(type: ToolType) {
    if (!SaveManager.consumeTool(type)) return
    emit('tool:use', { type })
    switch (type) {
      case 'magnify':
        this.useMagnify()
        break
      case 'watch':
        this.useWatch()
        break
      case 'light':
        this.useLight()
        break
    }
    emit('tool:update', this.getCounts() as any)
  }

  private static useMagnify() {
    const skills = this.current?.targetSkills ?? []
    const primary = skills[0] as SkillTag | undefined
    const hint = primary ? Strings.skillHint(primary) : ''
    emit('tool:hints', { targetSkills: skills, hint })
  }

  private static useWatch() {
    emit('ui:countdown:extend', { deltaMs: 10000 })
  }

  private static useLight() {
    // 直接选择正确答案
    if (this.current) {
      emit('ui:choice', { choice: this.current.isTrue })
    }
  }
}
