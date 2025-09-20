export default class GameScene extends Phaser.Scene {
  private currentQuestion: string = ''
  private isCurrentQuestionTrue: boolean = false
  private timeRemaining: number = 30
  private currentQuestionIndex: number = 0
  private correctAnswers: number = 0

  constructor() {
    super('GameScene')
  }

  create() {
    this.createBackground()
    this.createQuestionArea()
    this.createAnswerButtons()
    this.createTimer()
    this.createProgressBar()

    this.generateQuestion()
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

    this.add.text(centerX, centerY, '等待题目...', {
      fontSize: '32px',
      color: '#333333'
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
      })
      .on('pointerout', () => {
        const bg = button.list[0] as Phaser.GameObjects.Rectangle
        bg.setAlpha(1)
      })
      .on('pointerdown', onClick)
  }

  createTimer() {
    const centerX = this.cameras.main.width / 2
    const centerY = this.cameras.main.height * 0.8

    this.add.text(centerX - 50, centerY, '时间:', {
      fontSize: '20px',
      color: '#ffffff'
    })

    this.add.text(centerX + 20, centerY, this.timeRemaining.toString(), {
      fontSize: '20px',
      color: '#ffffff'
    })

    this.time.addEvent({
      delay: 1000,
      callback: this.updateTimer,
      callbackScope: this,
      loop: true
    })
  }

  createProgressBar() {
    const centerX = this.cameras.main.width / 2
    const centerY = 50

    this.add.text(centerX - 100, centerY - 20, `线索 ${this.currentQuestionIndex + 1}/10`, {
      fontSize: '18px',
      color: '#ffffff'
    }).setOrigin(0.5)

    const progressBg = this.add.rectangle(centerX, centerY, 200, 10, 0x333333)
    const progressFill = this.add.rectangle(centerX - 100, centerY, 20, 10, 0x10b981)
    progressFill.setOrigin(0, 0.5)
  }

  generateQuestion() {
    const num1 = Math.floor(Math.random() * 100) + 1
    const num2 = Math.floor(Math.random() * 100) + 1
    const operation = Math.random() > 0.5 ? '+' : '-'

    let answer: number
    if (operation === '+') {
      answer = num1 + num2
    } else {
      answer = num1 - num2
    }

    const isCorrect = Math.random() > 0.5
    const displayAnswer = isCorrect ? answer : answer + (Math.random() > 0.5 ? 1 : -1)

    this.currentQuestion = `${num1} ${operation} ${num2} = ${displayAnswer}`
    this.isCurrentQuestionTrue = isCorrect

    this.updateQuestionDisplay()
  }

  updateQuestionDisplay() {
    const centerX = this.cameras.main.width / 2
    const centerY = this.cameras.main.height / 3

    this.children.list.forEach(child => {
      if (child instanceof Phaser.GameObjects.Text && child.text.includes('等待题目') || child.text.includes('=')) {
        child.destroy()
      }
    })

    this.add.text(centerX, centerY, this.currentQuestion, {
      fontSize: '32px',
      color: '#333333'
    }).setOrigin(0.5)
  }

  updateTimer() {
    this.timeRemaining--

    if (this.timeRemaining <= 0) {
      this.answerQuestion(false)
    }
  }

  answerQuestion(answer: boolean) {
    const isCorrect = answer === this.isCurrentQuestionTrue

    if (isCorrect) {
      this.correctAnswers++
    }

    this.currentQuestionIndex++
    this.timeRemaining = 30

    if (this.currentQuestionIndex >= 10) {
      this.endLevel()
    } else {
      this.generateQuestion()
    }
  }

  endLevel() {
    const accuracy = this.correctAnswers / 10

    this.registry.set('levelScore', this.correctAnswers)
    this.registry.set('levelAccuracy', accuracy)

    this.game.events.emit('LEVEL/END', {
      score: this.correctAnswers,
      accuracy: accuracy
    })

    this.scene.stop('UIScene')
    this.scene.start('LevelEndScene')
  }
}