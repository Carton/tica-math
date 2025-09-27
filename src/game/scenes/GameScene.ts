import Phaser from 'phaser'
import { emit, on, off } from '@/game/managers/EventBus'
import { DifficultyManager } from '@/game/managers/DifficultyManager'
import { QuestionGenerator } from '@/game/managers/QuestionGenerator'
import type { Question, ResultSummary } from '@/game/utils/types'
import { ToolManager } from '@/game/managers/ToolManager'
import { gradeByAccuracy } from '@/game/utils/scoring'
import { SaveManager } from '@/game/managers/SaveManager'
import { isPass, nextLevel } from '@/game/utils/gameFlow'

export default class GameScene extends Phaser.Scene {
  private questionIndex = 0
  private total = 10
  private level = 1
  private current?: Question

  private correctCount = 0
  private totalTimeMs = 0
  private combo = 0
  private comboMax = 0

  private choiceHandler = ({ choice }: { choice: boolean }) => this.handleChoice(choice)
  private timeoutHandler = () => this.handleTimeout()

  private questionContainer?: Phaser.GameObjects.Container
  private notePaper?: Phaser.GameObjects.Image
  private deskBackground?: Phaser.GameObjects.Image

  constructor() {
    super('GameScene')
  }

  init(data: { level?: number } = {}) {
    if (data.level) this.level = data.level
    this.questionIndex = 0
    this.correctCount = 0
    this.totalTimeMs = 0
    this.combo = 0
    this.comboMax = 0
  }

  create() {
    this.cameras.main.setBackgroundColor('#0b1021')
    const params = DifficultyManager.getParams(this.level)
    this.total = params.questionCount

    on('ui:choice', this.choiceHandler)
    on('question:timeout', this.timeoutHandler)

    this.questionContainer = this.add.container(0, 0)

    // 创建桌面背景（如果资源存在）
    if (this.textures.exists('bg_desk')) {
      try {
        this.deskBackground = this.add.image(640, 360, 'bg_desk').setOrigin(0.5)
        this.deskBackground.setDisplaySize(1280, 720)
      } catch (error) {
        console.warn('Failed to create bg_desk:', error)
      }
    }

    // 创建便签纸背景（如果资源存在）
    if (this.textures.exists('paper_note')) {
      try {
        this.notePaper = this.add.image(640, 360, 'paper_note').setOrigin(0.5)
        this.questionContainer.add(this.notePaper)
      } catch (error) {
        console.warn('Failed to create paper_note:', error)
      }
    }

    this.nextQuestion()
  }

  private nextQuestion() {
    if (this.questionIndex >= this.total) {
      off('ui:choice', this.choiceHandler)
      off('question:timeout', this.timeoutHandler)
      this.finish()
      return
    }

    // 清除之前的题目文字（保留便签纸背景）
    const children = this.questionContainer?.getAll()
    children?.forEach(child => {
      if (child !== this.notePaper) {
        this.questionContainer?.remove(child, true)
      }
    })

    const params = DifficultyManager.getParams(this.level)
    this.current = QuestionGenerator.createQuestion(params)
    ToolManager.setQuestion(this.current)

    const text = this.add.text(640, 360, this.current.questionString, { fontFamily: 'monospace', fontSize: '48px', color: '#0b1021' }).setOrigin(0.5)
    this.questionContainer?.add(text)

    emit('progress:update', { index: this.questionIndex + 1, total: this.total })
    emit('question:new', { question: this.current })
    emit('ui:countdown:start', { totalMs: params.timePerQuestionMs })
  }

  private handleChoice(choice: boolean) {
    if (!this.current) return
    const isCorrect = choice === this.current.isTrue
    emit('ui:feedback', { type: isCorrect ? 'correct' : 'wrong' })
    this.cameras.main.flash(100, isCorrect ? 0 : 255, isCorrect ? 255 : 0, 0)

    if (isCorrect) {
      this.correctCount += 1
      this.combo += 1
      this.comboMax = Math.max(this.comboMax, this.combo)
    } else {
      this.combo = 0
    }

    this.questionIndex += 1
    this.time.delayedCall(120, () => this.nextQuestion())
  }

  private handleTimeout() {
    emit('ui:feedback', { type: 'timeout' })
    this.cameras.main.flash(100, 255, 0, 0)
    this.combo = 0
    this.questionIndex += 1
    this.time.delayedCall(120, () => this.nextQuestion())
  }

  private finish() {
    const toolsCounts = ToolManager.getCounts()
    const toolsUsed = (3 - toolsCounts.magnify) + (3 - toolsCounts.watch) + (3 - toolsCounts.flash)
    const accuracy = this.total > 0 ? this.correctCount / this.total : 0
    const grade = gradeByAccuracy(accuracy, toolsUsed)
    const pass = isPass(accuracy)
    const summary: ResultSummary = {
      correctCount: this.correctCount,
      totalCount: this.total,
      totalTimeMs: this.totalTimeMs,
      averageTimeMs: this.total > 0 ? Math.round(this.totalTimeMs / this.total) : 0,
      comboMax: this.comboMax,
      toolsUsed,
      accuracy,
      grade,
      pass,
      level: this.level,
    }
    SaveManager.updateWithResult(this.level, summary)

    this.scene.stop('UIScene')
    this.scene.start('ResultScene', { summary, nextLevel: nextLevel(this.level, pass) })
  }
}
