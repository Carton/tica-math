export type SkillTag =
  | 'estimate'
  | 'lastDigit'
  | 'parity'
  | 'castingOutNines'
  | 'carryBorrow'
  | 'specialDigits'
  | 'times11'

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
  allowFractions: boolean
  allowDecimals: boolean
  timePerQuestionMs: number
  minTimeMs: number
  questionCount: number
}

export interface ExpressionConfig {
  twoTerms: {
    simple: Record<Operator, number>
    withParentheses: Record<Operator, number>
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

// 保持向后兼容的旧接口
export interface DifficultyParams {
  numberRange: { min: number; max: number }
  operators: { plus: boolean; minus: boolean; mul: boolean; div: boolean }
  operatorWeights: { plus: number; minus: number; mul: number; div: number }
  allowFractions: boolean
  allowDecimals: boolean
  allowNegative: boolean
  threeTermsProbability: number
  allowParentheses: boolean
  timePerQuestionMs: number
  minTimeMs: number
  questionCount: number
}

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
