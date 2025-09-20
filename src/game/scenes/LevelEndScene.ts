export default class LevelEndScene extends Phaser.Scene {
  private score: number = 0
  private accuracy: number = 0
  private level: number = 1
  private isSuccess: boolean = false
  private earnedBadge: boolean = false

  constructor() {
    super('LevelEndScene')
  }

  init() {
    // Load level results from registry using correct key format
    this.score = this.registry.get('level:score') || 0
    this.accuracy = this.registry.get('level:accuracy') || 0
    this.level = this.registry.get('game:level') || 1
    this.isSuccess = this.registry.get('level:completed') || false

    // Award badge if successful
    if (this.isSuccess) {
      this.awardBadge()
    }

    // Save game progress
    this.saveGameProgress()
  }

  create() {
    this.createBackground()
    this.createResultDisplay()
    this.createActionButtons()
    this.playResultAnimation()
  }

  createBackground() {
    const background = this.add.rectangle(
      0, 0,
      this.cameras.main.width,
      this.cameras.main.height,
      0x0f1320
    )
    background.setOrigin(0, 0)
  }

  createResultDisplay() {
    const centerX = this.cameras.main.width / 2
    const centerY = this.cameras.main.height / 3

    const resultText = this.isSuccess ? '案件告破！' : '让教授逃跑了！'
    const resultColor = this.isSuccess ? '#10b981' : '#ef4444'

    this.add.text(centerX, centerY - 120, `第 ${this.level} 关`, {
      fontSize: '24px',
      color: '#888888'
    }).setOrigin(0.5)

    this.add.text(centerX, centerY - 60, resultText, {
      fontSize: '48px',
      color: resultColor
    }).setOrigin(0.5)

    this.add.text(centerX, centerY, `正确答案: ${this.score}/10`, {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5)

    this.add.text(centerX, centerY + 40, `准确率: ${Math.round(this.accuracy * 100)}%`, {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5)

    if (this.isSuccess) {
      this.add.text(centerX, centerY + 90, '恭喜获得侦探徽章！', {
        fontSize: '20px',
        color: '#ffd700'
      }).setOrigin(0.5)

      if (this.earnedBadge) {
        this.add.text(centerX, centerY + 120, '新徽章已解锁！', {
          fontSize: '16px',
          color: '#ffd700'
        }).setOrigin(0.5)
      }
    } else {
      this.add.text(centerX, centerY + 90, 'Tica侦探，整理线索，我们再来一次！', {
        fontSize: '18px',
        color: '#ffffff'
      }).setOrigin(0.5)

      const requiredScore = Math.ceil(10 * 0.8) // 80% of 10 questions
      this.add.text(centerX, centerY + 120, `需要 ${requiredScore} 个正确答案才能破案`, {
        fontSize: '14px',
        color: '#888888'
      }).setOrigin(0.5)
    }
  }

  createActionButtons() {
    const centerX = this.cameras.main.width / 2
    const centerY = this.cameras.main.height * 0.7

    const retryButton = this.createButton(centerX - 80, centerY, '再试一次', () => {
      this.retryLevel()
    })

    const menuButton = this.createButton(centerX + 80, centerY, '返回菜单', () => {
      this.returnToMenu()
    })

    if (this.accuracy >= 0.8) {
      const nextButton = this.createButton(centerX, centerY + 80, '下一关', () => {
        this.nextLevel()
      })
    }
  }

  createButton(x: number, y: number, text: string, onClick: () => void): Phaser.GameObjects.Container {
    const container = this.add.container(x, y)

    const background = this.add.rectangle(0, 0, 140, 50, 0x4a5568)
    background.setStrokeStyle(2, 0xffd700)

    const buttonText = this.add.text(0, 0, text, {
      fontSize: '18px',
      color: '#ffffff'
    }).setOrigin(0.5)

    container.add([background, buttonText])

    container.setInteractive(new Phaser.Geom.Rectangle(-70, -25, 140, 50), Phaser.Geom.Rectangle.Contains)
      .on('pointerover', () => {
        background.setFillStyle(0x5a6578)
      })
      .on('pointerout', () => {
        background.setFillStyle(0x4a5568)
      })
      .on('pointerdown', onClick)

    return container
  }

  playResultAnimation() {
    const centerX = this.cameras.main.width / 2
    const centerY = this.cameras.main.height / 3

    const resultText = this.children.list.find(child =>
      child instanceof Phaser.GameObjects.Text &&
      (child.text.includes('案件告破') || child.text.includes('让教授逃跑了'))
    ) as Phaser.GameObjects.Text

    if (resultText) {
      resultText.setScale(0)
      this.tweens.add({
        targets: resultText,
        scaleX: 1,
        scaleY: 1,
        duration: 500,
        ease: 'Back.easeOut'
      })
    }
  }

  retryLevel() {
    this.scene.start('GameScene')
    this.scene.launch('UIScene')
  }

  returnToMenu() {
    this.scene.start('MainMenuScene')
  }

  nextLevel() {
    // Level is already incremented in GameScene, just proceed
    this.scene.start('GameScene')
    this.scene.launch('UIScene')
  }

  private awardBadge() {
    const badges = this.registry.get('game:badges') || []
    const badgeName = `Level ${this.level} Badge`

    // Check if badge already earned
    if (!badges.includes(badgeName)) {
      badges.push(badgeName)
      this.registry.set('game:badges', badges)
      this.earnedBadge = true
    }
  }

  private saveGameProgress() {
    try {
      // Save level progress
      localStorage.setItem('math-game:level', this.level.toString())

      // Save badges
      const badges = this.registry.get('game:badges') || []
      localStorage.setItem('math-game:badges', JSON.stringify(badges))

      // Save audio settings
      const volumeSettings = {
        music: this.registry.get('audio:volume:music') || 0.7,
        sfx: this.registry.get('audio:volume:sfx') || 0.8,
        muted: this.registry.get('audio:muted') || false
      }
      localStorage.setItem('math-game:volume', JSON.stringify(volumeSettings))

    } catch (error) {
      console.warn('Failed to save game progress:', error)
    }
  }
}