import Phaser from 'phaser'
import { emit } from '@/game/managers/EventBus'

export default class GameScene extends Phaser.Scene {
  private questionIndex = 0
  private total = 10

  constructor() {
    super('GameScene')
  }

  create() {
    this.cameras.main.setBackgroundColor('#0b1021')
    this.nextQuestion()

    this.input.keyboard?.on('keydown-T', () => this.answer(true))
    this.input.keyboard?.on('keydown-F', () => this.answer(false))
    this.input.keyboard?.on('keydown-RIGHT', () => this.answer(true))
    this.input.keyboard?.on('keydown-LEFT', () => this.answer(false))
  }

  private nextQuestion() {
    if (this.questionIndex >= this.total) {
      this.scene.stop('UIScene')
      this.scene.start('ResultScene')
      return
    }

    const expr = '22 + 33 = 55' // 占位题目，后续接入 QuestionGenerator
    this.add.text(640, 360, expr, { fontFamily: 'monospace', fontSize: '48px', color: '#ffffff' }).setOrigin(0.5)
    emit('progress:update', { index: this.questionIndex + 1, total: this.total })
    emit('question:new', { question: { questionString: expr, isTrue: true } as any })
  }

  private answer(isTrue: boolean) {
    // 占位：固定正确
    emit('question:answer', { isCorrect: isTrue === true, timeMs: 1000 })
    this.questionIndex += 1
    this.cameras.main.flash(100, isTrue ? 0 : 255, isTrue ? 255 : 0, 0)
    this.time.delayedCall(150, () => {
      this.children.removeAll()
      this.nextQuestion()
    })
  }
}
