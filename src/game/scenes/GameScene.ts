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
  private currentQuestionText?: Phaser.GameObjects.Text

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
    this.questionContainer.setDepth(15)  // 确保container的层级正确

    // 创建桌面背景（如果资源存在）
    if (this.textures.exists('bg_desk')) {
      try {
        this.deskBackground = this.add.image(640, 360, 'bg_desk').setOrigin(0.5)
        this.deskBackground.setDisplaySize(1280, 720)
        this.deskBackground.setDepth(0)  // 背景在最底层
      } catch (error) {
        console.warn('Failed to create bg_desk:', error)
      }
    }

    // 创建便签纸背景（如果资源存在）- 直接添加到scene，设置更高层级
    if (this.textures.exists('paper_note')) {
      try {
        this.notePaper = this.add.image(640, 360, 'paper_note').setOrigin(0.5)
        this.notePaper.setDepth(10)  // 便签纸在背景之上
        // 调整便签纸大小，使用更适合的比例
        this.notePaper.setDisplaySize(1024, 800)
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

    // 清除之前的题目文字
    if (this.currentQuestionText) {
      this.currentQuestionText.destroy()
      this.currentQuestionText = undefined
    }

    const params = DifficultyManager.getParams(this.level)
    this.current = QuestionGenerator.createQuestion(params)
    ToolManager.setQuestion(this.current)

    // 创建题目文字
    const text = this.add.text(640, 360, this.current.questionString, {
      fontFamily: 'monospace',
      fontSize: '42px',
      color: '#0b1021',  // 回到原来的深色
      wordWrap: { width: 700 },  // 添加文字换行
      align: 'center'
    }).setOrigin(0.5)
    text.setDepth(30)  // 题目文字在便签纸之上

    // 不添加到container，直接添加到scene，但保存引用
    this.currentQuestionText = text

    emit('progress:update', { index: this.questionIndex + 1, total: this.total })
    emit('question:new', { question: this.current })
    emit('ui:countdown:start', { totalMs: params.timePerQuestionMs })
  }

  private handleChoice(choice: boolean) {
    if (!this.current) return
    const isCorrect = choice === this.current.isTrue
    emit('ui:feedback', { type: isCorrect ? 'correct' : 'wrong' })

    if (isCorrect) {
      this.correctCount += 1
      this.combo += 1
      this.comboMax = Math.max(this.comboMax, this.combo)
      // 添加正确答案的stamp动画效果
      this.showCorrectStamp()
    } else {
      this.combo = 0
    }

    this.questionIndex += 1
    this.time.delayedCall(120, () => this.nextQuestion())
  }

  private handleTimeout() {
    emit('ui:feedback', { type: 'timeout' })
    // 移除背景闪烁效果，因为现在有音效反馈了
    this.combo = 0
    this.questionIndex += 1
    this.time.delayedCall(120, () => this.nextQuestion())
  }

  private showCorrectStamp() {
    if (!this.notePaper) return

    // 计算paper note右上角的位置
    const noteWidth = 1024
    const noteHeight = 800
    const noteX = 640
    const noteY = 360

    // stamp在右上角的偏移位置
    const stampX = noteX + noteWidth * 0.35  // 右上角区域
    const stampY = noteY - noteHeight * 0.35  // 右上角区域

    // 创建stamp图像
    const stamp = this.add.image(stampX, stampY, 'stamp_true')
      .setOrigin(0.5)
      .setDepth(40)  // 确保在便签纸和题目文字之上
      .setAlpha(0)   // 初始透明
      .setScale(0.5) // 初始较小尺寸

    // 动画效果：缩放 + 淡入 + 轻微旋转
    this.tweens.add({
      targets: stamp,
      alpha: 1,
      scaleX: 1,
      scaleY: 1,
      angle: 5, // 轻微旋转角度，模拟真实盖章效果
      duration: 300,
      ease: 'Back.out', // 弹性效果
      onComplete: () => {
        // 保持显示一段时间后淡出
        this.time.delayedCall(800, () => {
          this.tweens.add({
            targets: stamp,
            alpha: 0,
            duration: 200,
            onComplete: () => {
              stamp.destroy()
            }
          })
        })
      }
    })
  }

  private finish() {
    const toolsCounts = ToolManager.getCounts()
    const toolsUsed = (3 - toolsCounts.magnify) + (3 - toolsCounts.watch) + (3 - toolsCounts.light)
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
