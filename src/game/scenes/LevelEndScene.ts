export default class LevelEndScene extends Phaser.Scene {
  private score: number = 0
  private accuracy: number = 0

  constructor() {
    super('LevelEndScene')
  }

  init() {
    this.score = this.registry.get('levelScore') || 0
    this.accuracy = this.registry.get('levelAccuracy') || 0
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

    const isSuccess = this.accuracy >= 0.8
    const resultText = isSuccess ? '案件告破！' : '让教授逃跑了！'
    const resultColor = isSuccess ? '#10b981' : '#ef4444'

    this.add.text(centerX, centerY - 100, resultText, {
      fontSize: '48px',
      color: resultColor,
      fontWeight: 'bold'
    }).setOrigin(0.5)

    this.add.text(centerX, centerY - 30, `正确答案: ${this.score}/10`, {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5)

    this.add.text(centerX, centerY + 20, `准确率: ${Math.round(this.accuracy * 100)}%`, {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5)

    if (isSuccess) {
      this.add.text(centerX, centerY + 70, '恭喜获得侦探徽章！', {
        fontSize: '20px',
        color: '#ffd700'
      }).setOrigin(0.5)
    } else {
      this.add.text(centerX, centerY + 70, 'Tica侦探，整理线索，我们再来一次！', {
        fontSize: '18px',
        color: '#ffffff'
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
    const currentLevel = this.registry.get('game:level') || 1
    this.registry.set('game:level', currentLevel + 1)

    this.scene.start('GameScene')
    this.scene.launch('UIScene')
  }
}