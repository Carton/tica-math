import QuestionGenerator, { Question } from '@/game/managers/QuestionGenerator'
import DifficultyManager from '@/game/managers/DifficultyManager'
import DetectiveToolsManager from '@/game/managers/DetectiveToolsManager'
import AssetManager from '@/game/managers/AssetManager'
import { DEFAULT_ASSET_CONFIG } from '@/game/config/AssetConfig'

export default class GameScene extends Phaser.Scene {
  private questionGenerator!: QuestionGenerator
  private difficultyManager!: DifficultyManager
  private detectiveToolsManager!: DetectiveToolsManager
  private assetManager!: AssetManager
  private currentQuestion: Question | null = null
  private timerEvent!: Phaser.Time.TimerEvent
  private questionText!: Phaser.GameObjects.Text
  private timerText!: Phaser.GameObjects.Text
  private progressText!: Phaser.GameObjects.Text
  private progressFill!: Phaser.GameObjects.Rectangle
  private isProcessingAnswer: boolean = false
  private questionStartTime: number = 0
  private isPaused: boolean = false
  private pauseMenu!: Phaser.GameObjects.Container
  private pauseButton!: Phaser.GameObjects.Container
  private questionArea!: Phaser.GameObjects.Container
  private background!: Phaser.GameObjects.Image

  constructor() {
    super({ key: 'GameScene' })
  }

  preload() {
    // Initialize asset manager and preload all assets
    this.assetManager = new AssetManager(this, DEFAULT_ASSET_CONFIG)
    this.assetManager.preload()
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

    // Start background music if audio is available
    try {
      this.assetManager.playBackgroundMusic()
    } catch (error) {
      console.warn('Background music could not be played:', error)
    }

    // Create animations for feedback
    this.createAnimations()

    // Notify game start
    this.game.events.emit('LEVEL/START', {
      level: this.registry.get('game:level'),
      difficulty: this.difficultyManager.getCurrentLevelNumber()
    })

    this.startNewQuestion()
  }

  createBackground() {
    // Try to use asset background, fallback to colored rectangle if not loaded
    try {
      this.background = this.assetManager.createBackground()
    } catch (error) {
      console.warn('Background asset not loaded, using fallback:', error)
      const background = this.add.rectangle(
        0, 0,
        this.cameras.main.width,
        this.cameras.main.height,
        0x1a1a2e
      )
      background.setOrigin(0, 0)
      this.background = background as any
    }
  }

  createQuestionArea() {
    const centerX = this.cameras.main.width / 2
    const centerY = this.cameras.main.height / 3

    // Try to use asset-based question area, fallback to simple design
    try {
      const questionElements = this.assetManager.createQuestionArea(centerX, centerY)
      this.questionArea = questionElements.container
      this.questionText = questionElements.text
    } catch (error) {
      console.warn('Question area assets not loaded, using fallback:', error)
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

      this.questionArea = this.add.container(centerX, centerY)
      this.questionArea.add([noteBackground, this.questionText])
    }
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

    // Create pause button
    this.createPauseButton()
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
    if (this.isPaused) return

    const config = this.difficultyManager.getCurrentDifficultyConfig()
    const newTime = Math.max(0, parseInt(this.timerText.text) - 1)
    this.timerText.setText(newTime.toString())

    if (newTime <= 0) {
      this.answerQuestion(false)
    }
  }

  answerQuestion(userAnswer: boolean) {
    if (this.isProcessingAnswer || !this.currentQuestion || this.isPaused) return

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

    // Setup keyboard shortcuts
    this.setupKeyboardShortcuts()
  }

  private startNewQuestion() {
    if (this.isPaused) return

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
    if (!this.currentQuestion || this.isPaused) return

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
        if (effect.message) {
          this.showTimeMessage(effect.message)
        }
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

    // Visual feedback for timer
    this.tweens.add({
      targets: this.timerText,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 200,
      yoyo: true,
      ease: 'Power2'
    })

    this.game.events.emit('TIMER/UPDATED', {
      addedSeconds: seconds,
      newTime
    })
  }

  private showTimeMessage(message: string) {
    const centerX = this.cameras.main.width / 2
    const centerY = this.cameras.main.height * 0.3

    const timeMessage = this.add.text(centerX, centerY, message, {
      fontSize: '16px',
      color: '#00ffff',
      backgroundColor: '#1a1a2e',
      padding: { x: 15, y: 8 },
      wordWrap: { width: 400 }
    }).setOrigin(0.5)

    // Add clock icon animation
    this.tweens.add({
      targets: timeMessage,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 300,
      yoyo: true,
      repeat: 1,
      ease: 'Power2',
      onComplete: () => {
        this.time.delayedCall(3000, () => timeMessage.destroy())
      }
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

  private createPauseButton() {
    const buttonSize = 40
    const padding = 20

    this.pauseButton = this.add.container(
      this.cameras.main.width - buttonSize - padding,
      buttonSize + padding
    )

    const buttonBg = this.add.rectangle(0, 0, buttonSize, buttonSize, 0x374151)
    buttonBg.setStrokeStyle(2, 0x6b7280)
    buttonBg.setAlpha(0.8)

    const pauseIcon = this.add.text(0, 0, '❚❚', {
      fontSize: '16px',
      color: '#ffffff'
    }).setOrigin(0.5)

    this.pauseButton.add([buttonBg, pauseIcon])

    this.pauseButton.setInteractive(
      new Phaser.Geom.Rectangle(-buttonSize/2, -buttonSize/2, buttonSize, buttonSize),
      Phaser.Geom.Rectangle.Contains
    )
    .on('pointerover', () => {
      buttonBg.setAlpha(1)
      this.input.setDefaultCursor('pointer')
    })
    .on('pointerout', () => {
      buttonBg.setAlpha(0.8)
      this.input.setDefaultCursor('default')
    })
    .on('pointerdown', () => {
      this.togglePause()
    })
  }

  private createPauseMenu() {
    const centerX = this.cameras.main.width / 2
    const centerY = this.cameras.main.height / 2
    const menuWidth = 300
    const menuHeight = 250

    // Create semi-transparent overlay
    const overlay = this.add.rectangle(
      centerX, centerY,
      this.cameras.main.width,
      this.cameras.main.height,
      0x000000
    )
    overlay.setAlpha(0.7)
    overlay.setOrigin(0.5)
    overlay.setInteractive()

    // Create menu background
    const menuBg = this.add.rectangle(centerX, centerY, menuWidth, menuHeight, 0x1f2937)
    menuBg.setStrokeStyle(3, 0x4b5563)
    menuBg.setOrigin(0.5)

    // Title
    const title = this.add.text(centerX, centerY - 80, '游戏暂停', {
      fontSize: '28px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5)

    // Menu buttons
    const resumeButton = this.createMenuButton(centerX, centerY - 20, '继续游戏', () => this.togglePause())
    const restartButton = this.createMenuButton(centerX, centerY + 30, '重新开始', () => this.restartGame())
    const mainMenuButton = this.createMenuButton(centerX, centerY + 80, '主菜单', () => this.goToMainMenu())

    this.pauseMenu = this.add.container(0, 0)
    this.pauseMenu.add([overlay, menuBg, title, resumeButton, restartButton, mainMenuButton])
    this.pauseMenu.setVisible(false)
  }

  private createMenuButton(x: number, y: number, text: string, onClick: () => void): Phaser.GameObjects.Container {
    const buttonWidth = 200
    const buttonHeight = 40

    const button = this.add.container(x, y)

    const buttonBg = this.add.rectangle(0, 0, buttonWidth, buttonHeight, 0x3b82f6)
    buttonBg.setStrokeStyle(2, 0x2563eb)

    const buttonText = this.add.text(0, 0, text, {
      fontSize: '18px',
      color: '#ffffff'
    }).setOrigin(0.5)

    button.add([buttonBg, buttonText])

    button.setInteractive(
      new Phaser.Geom.Rectangle(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight),
      Phaser.Geom.Rectangle.Contains
    )
    .on('pointerover', () => {
      buttonBg.setFillStyle(0x2563eb)
      this.input.setDefaultCursor('pointer')
    })
    .on('pointerout', () => {
      buttonBg.setFillStyle(0x3b82f6)
      this.input.setDefaultCursor('default')
    })
    .on('pointerdown', onClick)

    return button
  }

  private togglePause() {
    this.isPaused = !this.isPaused

    if (this.isPaused) {
      // Stop the timer
      if (this.timerEvent) {
        this.timerEvent.paused = true
      }

      // Show pause menu
      if (!this.pauseMenu) {
        this.createPauseMenu()
      }
      this.pauseMenu.setVisible(true)

      // Pause all tweens
      this.tweens.pauseAll()

      // Emit pause event
      this.game.events.emit('GAME/PAUSED')
    } else {
      // Resume the timer
      if (this.timerEvent) {
        this.timerEvent.paused = false
      }

      // Hide pause menu
      if (this.pauseMenu) {
        this.pauseMenu.setVisible(false)
      }

      // Resume all tweens
      this.tweens.resumeAll()

      // Emit resume event
      this.game.events.emit('GAME/RESUMED')
    }
  }

  private restartGame() {
    // Reset game state
    this.registry.set('game:score', 0)
    this.registry.set('game:level', 1)
    this.difficultyManager.reset()
    this.detectiveToolsManager.resetForNewLevel()

    // Stop current timer
    if (this.timerEvent) {
      this.timerEvent.remove()
    }

    // Reset pause state
    this.isPaused = false
    if (this.pauseMenu) {
      this.pauseMenu.setVisible(false)
    }

    // Resume tweens
    this.tweens.resumeAll()

    // Start new question
    this.isProcessingAnswer = false
    this.startNewQuestion()

    // Emit restart event
    this.game.events.emit('GAME/RESTARTED')
  }

  private goToMainMenu() {
    // This would transition to a main menu scene
    // For now, we'll just restart the game
    this.restartGame()
  }

  // Add keyboard shortcut for pause
  private setupKeyboardShortcuts() {
    this.input.keyboard?.on('keydown-ESC', () => {
      this.togglePause()
    })
  }
}