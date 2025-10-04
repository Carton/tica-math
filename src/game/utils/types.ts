export type SkillTag =
  | 'estimate'
  | 'lastDigit'
  | 'parity'
  | 'castingOutNines'
  | 'carryBorrow'
  | 'specialDigits'

export interface Question {
  questionString: string
  isTrue: boolean
  targetSkills: SkillTag[]
  digitDifficulty: number
  metadata: { expr: string; correctValue: number; shownValue: number }
}

// 新的数位难度配置接口
export interface DigitDifficultyLevel {
  level: number
  digitRange: { min: number; max: number }
  skills: Record<SkillTag, number>
  expressions: ExpressionConfig
  allowNegative: boolean
  allowFractions: boolean // TODO: 当前版本仍按整数题目处理，保留接口以便未来支持分数
  timePerQuestionMs: number
  questionCount: number
}

export interface ExpressionConfig {
  twoTerms: {
    simple: Record<Operator, number>
  }
  threeTerms: {
    noParentheses: {
      plusMinus: number
      withMul: number
      withDiv: number
    }
    withParentheses: {
      plusMinus: number
      mul: number
      div: number
    }
  }
}

export type Operator = 'plus' | 'minus' | 'mul' | 'div'

export interface ResultSummary {
  correctCount: number
  totalCount: number
  totalTimeMs: number
  averageTimeMs: number
  comboMax: number
  toolsUsed: number
  accuracy: number
  grade: 'S' | 'A' | 'B' | 'C'
  pass: boolean
  level: number
}
