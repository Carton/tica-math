export type SkillTag =
  | 'estimate'
  | 'lastDigit'
  | 'parity'
  | 'castingOutNines'
  | 'carryBorrow'
  | 'specialDigits'
  | 'inverseOp'
  | 'times11'

export interface Question {
  questionString: string
  isTrue: boolean
  targetSkills: SkillTag[]
  metadata: { expr: string; correctValue: number; shownValue: number }
}

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
