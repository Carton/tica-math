import { Question } from './QuestionGenerator'

export interface ToolUsage {
  magnify: number
  timeSlow: number
  insight: number
}

export interface ToolEffect {
  type: 'TIME_ADD' | 'SHOW_HINT' | 'SHOW_INSIGHT'
  value?: number
  message?: string
  targetSkill?: string
}

export default class DetectiveToolsManager {
  private maxUsesPerLevel: number = 3
  private toolUsage: ToolUsage
  private totalUsesRemaining: number

  constructor() {
    this.toolUsage = {
      magnify: this.maxUsesPerLevel,
      timeSlow: this.maxUsesPerLevel,
      insight: this.maxUsesPerLevel
    }
    this.totalUsesRemaining = this.maxUsesPerLevel
  }

  useTool(toolName: string, question: Question): ToolEffect | null {
    if (this.totalUsesRemaining <= 0) {
      return null
    }

    if (this.toolUsage[toolName as keyof ToolUsage] <= 0) {
      return null
    }

    // Use the tool
    this.toolUsage[toolName as keyof ToolUsage]--
    this.totalUsesRemaining--

    // Generate tool effect based on tool type
    const effect = this.generateToolEffect(toolName, question)

    return effect
  }

  private generateToolEffect(toolName: string, question: Question): ToolEffect {
    switch (toolName) {
      case 'magnify':
        return {
          type: 'SHOW_HINT',
          message: this.getHintForSkill(question.targetSkill),
          targetSkill: question.targetSkill
        }

      case 'timeSlow':
        return {
          type: 'TIME_ADD',
          value: 10
        }

      case 'insight':
        return {
          type: 'SHOW_INSIGHT',
          message: this.getInsightForQuestion(question),
          targetSkill: question.targetSkill
        }

      default:
        return {
          type: 'SHOW_HINT',
          message: '工具效果未知'
        }
    }
  }

  private getHintForSkill(skill: string): string {
    const hints: Record<string, string> = {
      '尾数追踪术': '破案口诀：别管前面多复杂，先看尾巴抓一抓！',
      '估算神功': '破案口诀：大数取整算，结果差不远！',
      '奇偶性判断': '破案口诀：奇偶性，看尾巴，奇数偶数分清楚！',
      '弃九法': '破案口诀：数字相加弃九取，验算结果不失误！'
    }

    return hints[skill] || '仔细检查每个数字！'
  }

  private getInsightForQuestion(question: Question): string {
    // Analyze the question and provide a specific insight
    const parts = question.questionString.split('=')
    if (parts.length !== 2) return 'Tica灵光一闪：这道题需要仔细计算！'

    const expression = parts[0].trim()
    const result = parseInt(parts[1].trim())

    // Extract numbers from expression
    const numbers = expression.match(/\d+/g)?.map(n => parseInt(n)) || []

    if (numbers.length < 2) return 'Tica灵光一闪：这道题需要仔细计算！'

    // Check for specific patterns
    if (expression.includes('+')) {
      const sum = numbers.reduce((a, b) => a + b, 0)
      if (sum !== result) {
        return `Tica灵光一闪：这道题的**加法**计算是**错误**的！正确答案应该是 ${sum}`
      }
    } else if (expression.includes('-')) {
      const difference = numbers[0] - numbers[1]
      if (difference !== result) {
        return `Tica灵光一闪：这道题的**减法**计算是**错误**的！正确答案应该是 ${difference}`
      }
    } else if (expression.includes('×')) {
      const product = numbers[0] * numbers[1]
      if (product !== result) {
        return `Tica灵光一闪：这道题的**乘法**计算是**错误**的！正确答案应该是 ${product}`
      }
    } else if (expression.includes('÷')) {
      const quotient = numbers[0] / numbers[1]
      if (quotient !== result) {
        return `Tica灵光一闪：这道题的**除法**计算是**错误**的！正确答案应该是 ${quotient}`
      }
    }

    // If no calculation error found, check if it's a trick question
    if (question.isTrue) {
      return 'Tica灵光一闪：这道题的答案是**正确**的！'
    } else {
      return 'Tica灵光一闪：这道题的答案是**错误**的！'
    }
  }

  getRemainingUses(toolName?: string): number | ToolUsage {
    if (toolName) {
      return this.toolUsage[toolName as keyof ToolUsage]
    }
    return this.toolUsage
  }

  getTotalRemainingUses(): number {
    return this.totalUsesRemaining
  }

  canUseTool(toolName: string): boolean {
    return this.totalUsesRemaining > 0 && this.toolUsage[toolName as keyof ToolUsage] > 0
  }

  resetForNewLevel(): void {
    this.toolUsage = {
      magnify: this.maxUsesPerLevel,
      timeSlow: this.maxUsesPerLevel,
      insight: this.maxUsesPerLevel
    }
    this.totalUsesRemaining = this.maxUsesPerLevel
  }

  setMaxUsesPerLevel(maxUses: number): void {
    this.maxUsesPerLevel = maxUses
    this.resetForNewLevel()
  }

  // For debugging/testing
  refillAllTools(): void {
    this.toolUsage = {
      magnify: this.maxUsesPerLevel,
      timeSlow: this.maxUsesPerLevel,
      insight: this.maxUsesPerLevel
    }
    this.totalUsesRemaining = this.maxUsesPerLevel
  }

  // For game balancing adjustments
  adjustToolUsage(toolName: string, adjustment: number): void {
    const key = toolName as keyof ToolUsage
    this.toolUsage[key] = Math.max(0, Math.min(this.maxUsesPerLevel, this.toolUsage[key] + adjustment))
  }

  getToolNames(): string[] {
    return ['magnify', 'timeSlow', 'insight']
  }

  getToolDisplayName(toolName: string): string {
    const displayNames: Record<string, string> = {
      magnify: '真相放大镜',
      timeSlow: '时间慢走怀表',
      insight: '思维闪电'
    }
    return displayNames[toolName] || toolName
  }

  getToolDescription(toolName: string): string {
    const descriptions: Record<string, string> = {
      magnify: '根据题目类型给出相应的破案口诀和视觉提示',
      timeSlow: '为当前题目增加10秒的思考时间',
      insight: 'Tica的灵光一闪，验证题目中的关键计算环节'
    }
    return descriptions[toolName] || '神秘工具'
  }
}