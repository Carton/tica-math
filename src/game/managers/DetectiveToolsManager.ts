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
          message: this.getSmartHintForQuestion(question),
          targetSkill: question.targetSkill
        }

      case 'timeSlow':
        return {
          type: 'TIME_ADD',
          value: 15,
          message: '⏰ **时间慢走怀表**启动！时间增加了15秒！\n\n**破案秘诀**：多出的时间让你能从容使用**尾数追踪术**和**估算神功**来验证答案！'
        }

      case 'insight':
        return {
          type: 'SHOW_INSIGHT',
          message: this.getEnhancedInsightForQuestion(question),
          targetSkill: question.targetSkill
        }

      default:
        return {
          type: 'SHOW_HINT',
          message: '工具效果未知'
        }
    }
  }

  private getSmartHintForQuestion(question: Question): string {
    const parts = question.questionString.split('=')
    if (parts.length !== 2) return this.getHintForSkill(question.targetSkill)

    const expression = parts[0].trim()
    const givenResult = parts[1].trim()

    // Analyze the expression and provide targeted hints
    if (expression.includes('+')) {
      return this.getAdditionHint(expression, givenResult)
    } else if (expression.includes('-')) {
      return this.getSubtractionHint(expression, givenResult)
    } else if (expression.includes('×')) {
      return this.getMultiplicationHint(expression, givenResult)
    } else if (expression.includes('÷')) {
      return this.getDivisionHint(expression, givenResult)
    }

    return this.getHintForSkill(question.targetSkill)
  }

  private getAdditionHint(expression: string, givenResult: string): string {
    const numbers = expression.match(/\d+/g)?.map(n => parseInt(n)) || []
    if (numbers.length < 2) return this.getHintForSkill('估算神功')

    // **尾数追踪术** - 最适合加法
    const lastDigits = numbers.map(n => n % 10)
    const expectedLastDigit = lastDigits.reduce((sum, digit) => (sum + digit) % 10, 0)
    const givenLastDigit = parseInt(givenResult) % 10

    if (expectedLastDigit !== givenLastDigit) {
      return `🔍 **尾数追踪术**发现线索！\n个位数计算：${lastDigits.join(' + ')} 的个位数应该是 ${expectedLastDigit}，但答案的个位数是 ${givenLastDigit}！\n\n**破案口诀**：别管前面多复杂，先看尾巴抓一抓！`
    }

    // **估算神功** - 对于大数字
    if (numbers.some(n => n >= 100)) {
      const estimated = numbers.map(n => Math.round(n / 10) * 10)
      const estimatedSum = estimated.reduce((sum, num) => sum + num, 0)
      return `🔍 **估算神功**分析！\n估算：${estimated.join(' + ')} ≈ ${estimatedSum}\n实际答案应该接近 ${estimatedSum}！\n\n**破案口诀**：凑个整，估个大概！`
    }

    // **奇偶密码** - 检查奇偶性
    const oddCount = numbers.filter(n => n % 2 === 1).length
    const expectedParity = oddCount % 2 === 0 ? '偶数' : '奇数'
    const givenParity = parseInt(givenResult) % 2 === 0 ? '偶数' : '奇数'

    if (expectedParity !== givenParity) {
      return `🔍 **奇偶密码**发现异常！\n奇数个数：${oddCount} 个，结果应该是${expectedParity}\n但答案是${givenParity}！\n\n**破案口诀**：奇奇变偶，偶偶还偶，奇偶得奇！`
    }

    return `🔍 **综合分析**：这道加法题看起来合理，建议用**尾数追踪术**进一步验证！`
  }

  private getSubtractionHint(expression: string, givenResult: string): string {
    const numbers = expression.match(/\d+/g)?.map(n => parseInt(n)) || []
    if (numbers.length < 2) return this.getHintForSkill('估算神功')

    // **尾数追踪术** - 最适合减法
    const lastDigits = numbers.map(n => n % 10)
    let expectedLastDigit = (lastDigits[0] - lastDigits[1] + 10) % 10
    const givenLastDigit = parseInt(givenResult) % 10

    if (expectedLastDigit !== givenLastDigit) {
      return `🔍 **尾数追踪术**发现线索！\n个位数计算：${lastDigits[0]} - ${lastDigits[1]} 的个位数应该是 ${expectedLastDigit}，但答案的个位数是 ${givenLastDigit}！\n\n**破案口诀**：别管前面多复杂，先看尾巴抓一抓！`
    }

    return `🔍 **建议**：这道减法题可以用**估算神功**快速验证结果范围！`
  }

  private getMultiplicationHint(expression: string, givenResult: string): string {
    const numbers = expression.match(/\d+/g)?.map(n => parseInt(n)) || []
    if (numbers.length < 2) return this.getHintForSkill('估算神功')

    // **估算神功** - 最适合乘法
    const estimated = numbers.map(n => {
      if (n < 10) return n
      return Math.round(n / 10) * 10
    })
    const estimatedProduct = estimated.reduce((product, num) => product * num, 1)

    return `🔍 **估算神功**分析！\n估算：${estimated.join(' × ')} ≈ ${estimatedProduct}\n实际答案应该在这个数量级！\n\n**破案口诀**：凑个整，估个大概！`
  }

  private getDivisionHint(expression: string, givenResult: string): string {
    const numbers = expression.match(/\d+/g)?.map(n => parseInt(n)) || []
    if (numbers.length < 2) return this.getHintForSkill('估算神功')

    return `🔍 **除法检查**：可以用**逆运算大法**验证！\n用答案 × 除数，看看是否等于被除数！\n\n**破案口诀**：乘变除，除变乘，反向追踪不会输！`
  }

  private getHintForSkill(skill: string): string {
    const hints: Record<string, string> = {
      '尾数追踪术': '🔍 **尾数追踪术**：别管前面多复杂，先看尾巴抓一抓！答案的个位数只取决于每个数字的个位数！',
      '估算神功': '🔍 **估算神功**：凑个整，估个大概！把数字变成容易计算的整数，快速判断答案范围！',
      '奇偶密码': '🔍 **奇偶密码**：奇奇变偶，偶偶还偶，奇偶得奇，乘法有偶便是偶！先判断答案应该是单数还是双数！',
      '弃九验算法': '🔍 **弃九验算法**：数字加加加，加到一位查一查！把大数字"瘦身"成一位数来验证！',
      '分数运算': '🔍 **分数运算**：先通分，再计算，最后化简要记牢！注意分子分母的变化规律！'
    }

    return hints[skill] || '🔍 仔细检查每个数字，寻找破案线索！'
  }

  private getEnhancedInsightForQuestion(question: Question): string {
    // Analyze the question and provide powerful insight
    const parts = question.questionString.split('=')
    if (parts.length !== 2) return '⚡ **思维闪电**：这道题需要仔细分析！'

    const expression = parts[0].trim()
    const givenResult = parts[1].trim()

    // Extract numbers and operations
    const numbers = expression.match(/(\d+(\.\d+)?)/g)?.map(n => parseFloat(n)) || []
    const operators = expression.match(/[\+\-\×\÷]/g) || []

    if (numbers.length < 2) return '⚡ **思维闪电**：这道题的线索不够清晰！'

    // **闪电洞察** - 直接验证答案正确性
    const validationResult = this.validateExpression(expression, givenResult)
    if (validationResult.isCorrect !== null) {
      if (validationResult.isCorrect === question.isTrue) {
        return `⚡ **思维闪电**验证：这道题的答案是**${question.isTrue ? '正确' : '错误'}**的！\n\n**闪电分析**：${validationResult.explanation}\n\n**破案结论**：相信你的判断！`
      } else {
        return `⚡ **思维闪电**警告：这道题可能有陷阱！\n\n**闪电分析**：${validationResult.explanation}\n\n**破案建议**：仔细检查每个计算步骤！`
      }
    }

    // **智能提示** - 基于题目特征给出最佳解决策略
    const strategyHint = this.getOptimalStrategyHint(expression, numbers, operators)
    return `⚡ **思维闪电**策略建议：\n\n${strategyHint}\n\n**破案口诀**：选择最优方法，快速破案！`
  }

  private validateExpression(expression: string, givenResult: string): { isCorrect: boolean | null; explanation: string } {
    try {
      // Clean the expression for evaluation
      const cleanExpression = expression.replace(/×/g, '*').replace(/÷/g, '/')

      // Extract numbers for calculation
      const numbers = cleanExpression.match(/(\d+(\.\d+)?)/g)?.map(n => parseFloat(n)) || []
      const operators = cleanExpression.match(/[\+\-\*\/]/g) || []

      if (numbers.length < 2 || operators.length === 0) {
        return { isCorrect: null, explanation: '表达式格式不正确' }
      }

      let correctResult: number

      if (numbers.length === 2 && operators.length === 1) {
        // Simple two-number operation
        switch (operators[0]) {
          case '+':
            correctResult = numbers[0] + numbers[1]
            break
          case '-':
            correctResult = numbers[0] - numbers[1]
            break
          case '*':
            correctResult = numbers[0] * numbers[1]
            break
          case '/':
            if (numbers[1] === 0) return { isCorrect: null, explanation: '除数不能为零' }
            correctResult = numbers[0] / numbers[1]
            break
          default:
            return { isCorrect: null, explanation: '未知运算符' }
        }
      } else {
        // Complex expression - evaluate left to right
        correctResult = numbers[0]
        for (let i = 0; i < operators.length && i + 1 < numbers.length; i++) {
          switch (operators[i]) {
            case '+':
              correctResult += numbers[i + 1]
              break
            case '-':
              correctResult -= numbers[i + 1]
              break
            case '*':
              correctResult *= numbers[i + 1]
              break
            case '/':
              if (numbers[i + 1] === 0) return { isCorrect: null, explanation: '除数不能为零' }
              correctResult /= numbers[i + 1]
              break
          }
        }
      }

      const givenNum = parseFloat(givenResult)
      const isCorrect = Math.abs(correctResult - givenNum) < 0.0001 // Account for floating point precision

      let explanation = ''
      if (expression.includes('+')) {
        explanation = `通过精确计算，${expression.replace(/=/g, '等于')} ${correctResult}`
      } else if (expression.includes('-')) {
        explanation = `减法结果验证：${numbers.join(' - ')} = ${correctResult}`
      } else if (expression.includes('*') || expression.includes('×')) {
        explanation = `乘法计算：${numbers.join(' × ')} = ${correctResult}`
      } else if (expression.includes('/') || expression.includes('÷')) {
        explanation = `除法验算：${numbers.join(' ÷ ')} = ${correctResult.toFixed(2)}`
      }

      return { isCorrect, explanation }
    } catch (error) {
      return { isCorrect: null, explanation: '计算过程中出现错误' }
    }
  }

  private getOptimalStrategyHint(expression: string, numbers: number[], operators: string[]): string {
    // Analyze the expression and recommend the best solution strategy
    if (expression.includes('+')) {
      const largeNumbers = numbers.filter(n => Math.abs(n) >= 100).length
      if (largeNumbers > 0) {
        return '**推荐策略**：使用**估算神功**快速验证！\n把大数字四舍五入到整十数，估算结果范围。'
      }
      return '**推荐策略**：**尾数追踪术**最有效！\n只计算个位数，快速验证答案的个位数是否正确。'
    }

    if (expression.includes('-')) {
      return '**推荐策略**：**尾数追踪术**是最佳选择！\n减法的个位数计算：被减数个位 - 减数个位（不够减时加10）。'
    }

    if (expression.includes('*') || expression.includes('×')) {
      const hasLargeNumbers = numbers.some(n => Math.abs(n) >= 50)
      if (hasLargeNumbers) {
        return '**推荐策略**：先用**估算神功**确定数量级，再用**尾数追踪术**验证个位数！'
      }
      return '**推荐策略**：**奇偶密码**快速判断！\n乘法中只要有偶数，结果就是偶数；只有奇数×奇数才是奇数。'
    }

    if (expression.includes('/') || expression.includes('÷')) {
      return '**推荐策略**：**逆运算大法**最可靠！\n用答案 × 除数，验证是否等于被除数。'
    }

    return '**推荐策略**：综合运用多种破案技巧，快速找到答案！'
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