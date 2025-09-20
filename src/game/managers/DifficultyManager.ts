import { DifficultyConfig } from './QuestionGenerator'

export interface DifficultyLevel {
  level: number
  score: number
  config: DifficultyConfig
}

export default class DifficultyManager {
  private currentLevel: number = 1
  private currentScore: number = 0
  private difficultyLevels: DifficultyLevel[]

  constructor() {
    this.difficultyLevels = this.initializeDifficultyLevels()
  }

  private initializeDifficultyLevels(): DifficultyLevel[] {
    return [
      // Level 1-5: Basic single-digit operations
      {
        level: 1,
        score: 0,
        config: {
          numberRange: [1, 9],
          operations: ['+', '-'],
          complexity: 'simple',
          timeLimit: 30,
          allowThreeNumbers: false
        }
      },
      {
        level: 2,
        score: 100,
        config: {
          numberRange: [1, 20],
          operations: ['+', '-'],
          complexity: 'simple',
          timeLimit: 28,
          allowThreeNumbers: false
        }
      },
      {
        level: 3,
        score: 250,
        config: {
          numberRange: [1, 50],
          operations: ['+', '-'],
          complexity: 'simple',
          timeLimit: 26,
          allowThreeNumbers: false
        }
      },
      {
        level: 4,
        score: 450,
        config: {
          numberRange: [10, 99],
          operations: ['+', '-'],
          complexity: 'simple',
          timeLimit: 25,
          allowThreeNumbers: false
        }
      },
      {
        level: 5,
        score: 700,
        config: {
          numberRange: [10, 99],
          operations: ['+', '-'],
          complexity: 'simple',
          timeLimit: 24,
          allowThreeNumbers: true
        }
      },
      // Level 6-10: Introduction to multiplication
      {
        level: 6,
        score: 1000,
        config: {
          numberRange: [10, 99],
          operations: ['+', '-', '*'],
          complexity: 'simple',
          timeLimit: 23,
          allowThreeNumbers: true
        }
      },
      {
        level: 7,
        score: 1350,
        config: {
          numberRange: [20, 99],
          operations: ['+', '-', '*'],
          complexity: 'simple',
          timeLimit: 22,
          allowThreeNumbers: true
        }
      },
      {
        level: 8,
        score: 1750,
        config: {
          numberRange: [50, 99],
          operations: ['+', '-', '*'],
          complexity: 'mixed',
          timeLimit: 21,
          allowThreeNumbers: true
        }
      },
      {
        level: 9,
        score: 2200,
        config: {
          numberRange: [100, 999],
          operations: ['+', '-'],
          complexity: 'simple',
          timeLimit: 20,
          allowThreeNumbers: false
        }
      },
      {
        level: 10,
        score: 2700,
        config: {
          numberRange: [100, 999],
          operations: ['+', '-', '*'],
          complexity: 'mixed',
          timeLimit: 19,
          allowThreeNumbers: true
        }
      },
      // Level 11+: Advanced challenges
      {
        level: 11,
        score: 3250,
        config: {
          numberRange: [100, 999],
          operations: ['+', '-', '*', '/'],
          complexity: 'mixed',
          timeLimit: 18,
          allowThreeNumbers: true
        }
      }
    ]
  }

  getCurrentDifficultyConfig(): DifficultyConfig {
    const currentLevel = this.getCurrentLevel()
    return currentLevel.config
  }

  getCurrentLevel(): DifficultyLevel {
    // Find the highest level where score >= required score
    for (let i = this.difficultyLevels.length - 1; i >= 0; i--) {
      if (this.currentScore >= this.difficultyLevels[i].score) {
        this.currentLevel = this.difficultyLevels[i].level
        return this.difficultyLevels[i]
      }
    }

    // If score is below all thresholds, return level 1
    this.currentLevel = 1
    return this.difficultyLevels[0]
  }

  addScore(points: number): void {
    this.currentScore += points
  }

  getCurrentScore(): number {
    return this.currentScore
  }

  getCurrentLevelNumber(): number {
    return this.currentLevel
  }

  levelUp(): void {
    // Add bonus score for level completion
    const bonus = 100 * this.currentLevel
    this.currentScore += bonus
  }

  reset(): void {
    this.currentScore = 0
    this.currentLevel = 1
  }

  getProgressToNextLevel(): number {
    const currentLevel = this.getCurrentLevel()
    const currentIndex = this.difficultyLevels.findIndex(level => level.level === currentLevel.level)

    if (currentIndex >= this.difficultyLevels.length - 1) {
      return 1.0 // Already at max level
    }

    const nextLevel = this.difficultyLevels[currentIndex + 1]
    const currentLevelScore = currentLevel.score
    const nextLevelScore = nextLevel.score
    const scoreRange = nextLevelScore - currentLevelScore
    const progress = this.currentScore - currentLevelScore

    return Math.min(progress / scoreRange, 1.0)
  }

  getDifficultyCurve(): DifficultyLevel[] {
    return [...this.difficultyLevels]
  }

  // Allow dynamic adjustment of difficulty (for testing/tuning)
  setScore(score: number): void {
    this.currentScore = Math.max(0, score)
  }

  getRemainingScoreToNextLevel(): number {
    const currentLevel = this.getCurrentLevel()
    const currentIndex = this.difficultyLevels.findIndex(level => level.level === currentLevel.level)

    if (currentIndex >= this.difficultyLevels.length - 1) {
      return 0 // Already at max level
    }

    const nextLevel = this.difficultyLevels[currentIndex + 1]
    return Math.max(0, nextLevel.score - this.currentScore)
  }
}