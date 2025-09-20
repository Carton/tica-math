import Phaser from 'phaser'
import { emit, on, off } from '@/game/managers/EventBus'
import { DifficultyManager } from '@/game/managers/DifficultyManager'
import { QuestionGenerator } from '@/game/managers/QuestionGenerator'
import type { Question } from '@/game/utils/types'
import { ToolManager } from '@/game/managers/ToolManager'

export default class GameScene extends Phaser.Scene {
  private questionIndex = 0
  private total = 10
  private level = 1
  private current?: Question

  constructor() {
    super('GameScene')
  }

  create() {
    this.cameras.main.setBackgroundColor('#0b1021')
    const params = DifficultyManager.getParams(this.level)
    this.total = params.questionCount

    on('ui:choice', ({ choice }) => this.handleChoice(choice))
    on('question:timeout', () => this.handleTimeout())

    this.nextQuestion()
  }

  private nextQuestion() {
    if (this.questionIndex >= this.total) {
      off('ui:choice', ({ choice }) => this.handleChoice(choice))
      off('question:timeout', () => this.handleTimeout())
      this.scene.stop('UIScene')
      this.scene.start('ResultScene')
      return
    }

    this.children.removeAll()
    const params = DifficultyManager.getParams(this.level)
    this.current = QuestionGenerator.createQuestion(params)
    ToolManager.setQuestion(this.current)

    this.add.text(640, 360, this.current.questionString, { fontFamily: 'monospace', fontSize: '48px', color: '#ffffff' }).setOrigin(0.5)

    emit('progress:update', { index: this.questionIndex + 1, total: this.total })
    emit('question:new', { question: this.current })
    emit('ui:countdown:start', { totalMs: params.timePerQuestionMs })
  }

  private handleChoice(choice: boolean) {
    if (!this.current) return
    const isCorrect = choice === this.current.isTrue
    emit('ui:feedback', { type: isCorrect ? 'correct' : 'wrong' })
    this.cameras.main.flash(100, isCorrect ? 0 : 255, isCorrect ? 255 : 0, 0)
    this.questionIndex += 1
    this.time.delayedCall(150, () => this.nextQuestion())
  }

  private handleTimeout() {
    emit('ui:feedback', { type: 'timeout' })
    this.questionIndex += 1
    this.time.delayedCall(150, () => this.nextQuestion())
  }
}
