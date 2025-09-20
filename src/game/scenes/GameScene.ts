import QuestionGenerator, { Question } from '@/game/managers/QuestionGenerator'
import DifficultyManager from '@/game/managers/DifficultyManager'
import DetectiveToolsManager from '@/game/managers/DetectiveToolsManager'

export default class GameScene extends Phaser.Scene {
  private questionGenerator!: QuestionGenerator
  private difficultyManager!: DifficultyManager
  private detectiveToolsManager!: DetectiveToolsManager
  private currentQuestion: Question | null = null
  private timerEvent!: Phaser.Time.TimerEvent
  private questionText!: Phaser.GameObjects.Text
  private timerText!: Phaser.GameObjects.Text
  private progressText!: Phaser.GameObjects.Text
  private progressFill!: Phaser.GameObjects.Rectangle
  private isProcessingAnswer: boolean = false
  private questionStartTime: number = 0

  constructor() {
    super({ key: 'GameScene' })
  }

  init() {
    // Initialize managers
    this.difficultyManager = new DifficultyManager()
    this.detectiveToolsManager = new DetectiveToolsManager()

    const difficultyConfig = this.difficultyManager.getCurrentDifficultyConfig()
    this.questionGenerator = new QuestionGenerator(difficultyConfig)

    // Reset level state
    this.registry.set('game:level', this.registry.get('game:level') || 1)
    this.registry.set('game:score', 0)
    this.registry.set('tools:remaining', 3)

    this.isProcessingAnswer = false
  }

  create() {
    this.setupEventListeners()
    this.createBackground()
    this.createQuestionArea()
    this.createAnswerButtons()
    this.createTimer()
    this.createProgressBar()

    // Notify game start
    this.game.events.emit('LEVEL/START', {
      level: this.registry.get('game:level'),
      difficulty: this.difficultyManager.getCurrentLevelNumber()
    })

    this.startNewQuestion()
  }

  createBackground() {
    const background = this.add.rectangle(
      0, 0,
      this.cameras.main.width,
      this.cameras.main.height,
      0x1a1a2e
    )
    background.setOrigin(0, 0)
  }

  createQuestionArea() {
    const centerX = this.cameras.main.width / 2
    const centerY = this.cameras.main.height / 3

    const noteBackground = this.add.rectangle(centerX, centerY, 400, 200, 0xffffff)
    noteBackground.setStrokeStyle(2, 0x333333)

    this.add.text(centerX, centerY - 60, '线索', {
      fontSize: '24px',
      color: '#333333'
    }).setOrigin(0.5)

    this.questionText = this.add.text(centerX, centerY, '等待题目...', {
      fontSize: '32px',
      color: '#333333',
      wordWrap: { width: 350 }
    }).setOrigin(0.5)
  }

  createAnswerButtons() {
    const centerX = this.cameras.main.width / 2
    const centerY = this.cameras.main.height * 0.6

    const trueButton = this.add.container(centerX - 120, centerY)
    const falseButton = this.add.container(centerX + 120, centerY)

    const trueBg = this.add.rectangle(0, 0, 100, 60, 0x10b981)
    trueBg.setStrokeStyle(2, 0x059669)

    const falseBg = this.add.rectangle(0, 0, 100, 60, 0xef4444)
    falseBg.setStrokeStyle(2, 0xdc2626)

    const trueText = this.add.text(0, 0, '真相', {
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(0.5)

    const falseText = this.add.text(0, 0, '伪证', {
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(0.5)

    trueButton.add([trueBg, trueText])
    falseButton.add([falseBg, falseText])

    this.setupButton(trueButton, () => this.answerQuestion(true))
    this.setupButton(falseButton, () => this.answerQuestion(false))
  }

  setupButton(button: Phaser.GameObjects.Container, onClick: () => void) {
    button.setInteractive(new Phaser.Geom.Rectangle(-50, -30, 100, 60), Phaser.Geom.Rectangle.Contains)
      .on('pointerover', () => {
        const bg = button.list[0] as Phaser.GameObjects.Rectangle
        bg.setAlpha(0.8)
        this.input.setDefaultCursor('pointer')
      })
      .on('pointerout', () => {
        const bg = button.list[0] as Phaser.GameObjects.Rectangle
        bg.setAlpha(1)
        this.input.setDefaultCursor('default')
      })
      .on('pointerdown', () => {
        const bg = button.list[0] as Phaser.GameObjects.Rectangle
        const originalColor = bg.fillColor
        bg.setFillStyle(0x3d4758)
        this.time.delayedCall(100, () => {
          bg.setFillStyle(originalColor)
        })
        onClick()
      })
  }

  createTimer() {
    const centerX = this.cameras.main.width / 2
    const centerY = this.cameras.main.height * 0.8

    this.add.text(centerX - 50, centerY, '时间:', {
      fontSize: '20px',
      color: '#ffffff'
    })

    this.timerText = this.add.text(centerX + 20, centerY, '30', {
      fontSize: '20px',
      color: '#ffffff'
    })

    this.startTimer()
  }

  createProgressBar() {
    const centerX = this.cameras.main.width / 2
    const centerY = 50

    this.progressText = this.add.text(centerX - 100, centerY - 20, '线索 1/10', {
      fontSize: '18px',
      color: '#ffffff'
    }).setOrigin(0.5)

    const progressBg = this.add.rectangle(centerX, centerY, 200, 10, 0x333333)
    this.progressFill = this.add.rectangle(centerX - 100, centerY, 20, 10, 0x10b981)
    this.progressFill.setOrigin(0, 0.5)
  }

  generateQuestion() {
    this.currentQuestion = this.questionGenerator.generate()
    this.updateQuestionDisplay()
    this.updateProgressBar()

    // Emit question event
    this.game.events.emit('QUESTION/NEXT', {
      question: this.currentQuestion,
      questionIndex: this.getCurrentQuestionIndex()
    })
  }

  updateQuestionDisplay() {
    if (this.currentQuestion) {
      this.questionText.setText(this.currentQuestion.questionString)
    }
  }

  updateTimer() {
    const config = this.difficultyManager.getCurrentDifficultyConfig()
    const newTime = Math.max(0, parseInt(this.timerText.text) - 1)
    this.timerText.setText(newTime.toString())

    if (newTime <= 0) {
      this.answerQuestion(false)
    }
  }

  answerQuestion(userAnswer: boolean) {
    if (this.isProcessingAnswer || !this.currentQuestion) return

    this.isProcessingAnswer = true
    this.timerEvent.remove()

    const isCorrect = userAnswer === this.currentQuestion.isTrue
    const responseTime = Date.now() - this.questionStartTime

    // Update score and accuracy
    if (isCorrect) {
      const currentScore = this.registry.get('game:score') || 0
      this.registry.set('game:score', currentScore + 10)
      this.difficultyManager.addScore(10)
    }

    // Emit answer event
    this.game.events.emit('QUESTION/ANSWERED', {
      question: this.currentQuestion,
      userAnswer,
      isCorrect,
      responseTime,
      questionIndex: this.getCurrentQuestionIndex()
    })

    // Show feedback
    this.showAnswerFeedback(isCorrect)

    // Move to next question or end level
    this.time.delayedCall(1500, () => {
      if (this.getCurrentQuestionIndex() >= 10) {
        this.endLevel()
      } else {
        this.startNewQuestion()
      }
    })
  }

  endLevel() {
    const finalScore = this.registry.get('game:score') || 0
    const accuracy = finalScore / 100 // Max score is 100 (10 questions × 10 points each)

    // Update level progress
    if (accuracy >= 0.8) {
      this.difficultyManager.levelUp()
      const newLevel = this.difficultyManager.getCurrentLevelNumber()
      this.registry.set('game:level', newLevel)
    }

    // Store level results
    this.registry.set('level:score', finalScore)
    this.registry.set('level:accuracy', accuracy)
    this.registry.set('level:completed', accuracy >= 0.8)

    // Emit level end event
    this.game.events.emit('LEVEL/END', {
      score: finalScore,
      accuracy,
      level: this.registry.get('game:level'),
      success: accuracy >= 0.8
    })

    // Stop timer
    if (this.timerEvent) {
      this.timerEvent.remove()
    }

    // Transition to end scene
    this.time.delayedCall(2000, () => {
      this.scene.stop('UIScene')
      this.scene.start('LevelEndScene')
    })
  }

  // Helper methods
  private setupEventListeners() {
    // Listen for tool usage
    this.game.events.on('TOOLS/USE', (data: { toolName: string }) => {
      this.useTool(data.toolName)
    })

    // Listen for timer modifications
    this.game.events.on('TIMER/ADD_SECONDS', (data: { seconds: number }) => {
      this.addTime(data.seconds)
    })

    // Listen for keyboard answer shortcuts
    this.game.events.on('GAME/ANSWER', (data: { answer: boolean }) => {
      this.answerQuestion(data.answer)
    })
  }

  private startNewQuestion() {
    this.isProcessingAnswer = false
    this.generateQuestion()
    this.startTimer()
    this.questionStartTime = Date.now()
  }

  private startTimer() {
    const config = this.difficultyManager.getCurrentDifficultyConfig()
    this.timerText.setText(config.timeLimit.toString())

    if (this.timerEvent) {
      this.timerEvent.remove()
    }

    this.timerEvent = this.time.addEvent({
      delay: 1000,
      callback: this.updateTimer,
      callbackScope: this,
      loop: true
    })
  }

  private getCurrentQuestionIndex(): number {
    return Math.floor((this.registry.get('game:score') || 0) / 10)
  }

  private updateProgressBar() {
    const currentIndex = this.getCurrentQuestionIndex()
    this.progressText.setText(`线索 ${currentIndex + 1}/10`)

    const progress = (currentIndex + 1) / 10
    this.progressFill.width = 200 * progress
  }

  private showAnswerFeedback(isCorrect: boolean) {
    const centerX = this.cameras.main.width / 2
    const centerY = this.cameras.main.height / 2

    const feedback = isCorrect ? '证据确凿！' : '这是伪证！'
    const color = isCorrect ? 0x10b981 : 0xef4444

    const feedbackText = this.add.text(centerX, centerY, feedback, {
      fontSize: '36px',
      color: `#${color.toString(16).padStart(6, '0')}`
    }).setOrigin(0.5)

    // Animate feedback
    this.tweens.add({
      targets: feedbackText,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 200,
      yoyo: true,
      onComplete: () => feedbackText.destroy()
    })
  }

  private useTool(toolName: string) {
    if (!this.currentQuestion) return

    const toolEffect = this.detectiveToolsManager.useTool(toolName, this.currentQuestion)

    if (toolEffect) {
      this.applyToolEffect(toolEffect)

      // Update tool usage in registry
      const remaining = this.detectiveToolsManager.getTotalRemainingUses()
      this.registry.set('tools:remaining', remaining)

      // Emit tool usage event
      this.game.events.emit('TOOLS/USED', {
        toolName,
        effect: toolEffect,
        remainingUses: remaining
      })
    }
  }

  private applyToolEffect(effect: any) {
    switch (effect.type) {
      case 'TIME_ADD':
        this.addTime(effect.value || 10)
        break
      case 'SHOW_HINT':
        this.showHint(effect.message || '使用道具获得提示！')
        break
      case 'SHOW_INSIGHT':
        this.showInsight(effect.message || 'Tica有了一个想法！')
        break
    }
  }

  private addTime(seconds: number) {
    const currentTime = parseInt(this.timerText.text)
    const newTime = currentTime + seconds
    this.timerText.setText(newTime.toString())

    this.game.events.emit('TIMER/UPDATED', {
      addedSeconds: seconds,
      newTime
    })
  }

  private showHint(message: string) {
    const centerX = this.cameras.main.width / 2
    const centerY = this.cameras.main.height * 0.4

    const hintText = this.add.text(centerX, centerY, message, {
      fontSize: '18px',
      color: '#ffd700',
      backgroundColor: '#333333',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5)

    this.time.delayedCall(3000, () => hintText.destroy())
  }

  private showInsight(message: string) {
    const centerX = this.cameras.main.width / 2
    const centerY = this.cameras.main.height * 0.4

    const insightText = this.add.text(centerX, centerY, message, {
      fontSize: '16px',
      color: '#00ffff',
      backgroundColor: '#1a1a2e',
      padding: { x: 15, y: 8 }
    }).setOrigin(0.5)

    this.time.delayedCall(4000, () => insightText.destroy())
  }
}