export default class MainMenuScene extends Phaser.Scene {
  private startButton!: Phaser.GameObjects.Container
  private manualButton!: Phaser.GameObjects.Container
  private trophiesButton!: Phaser.GameObjects.Container

  constructor() {
    super('MainMenuScene')
  }

  create() {
    this.createBackground()
    this.createTitle()
    this.createButtons()
    this.createDecorations()
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

  createTitle() {
    const centerX = this.cameras.main.width / 2
    const centerY = this.cameras.main.height / 3

    this.add.text(centerX, centerY - 100, 'Tica侦探事务所', {
      fontSize: '48px',
      color: '#ffd700',
      fontWeight: 'bold'
    }).setOrigin(0.5)

    this.add.text(centerX, centerY - 50, '数字谜案', {
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(0.5)
  }

  createButtons() {
    const centerX = this.cameras.main.width / 2
    const centerY = this.cameras.main.height / 2

    this.startButton = this.createButton(centerX, centerY, '开始破案', () => {
      this.scene.start('GameScene')
      this.scene.launch('UIScene')
    })

    this.manualButton = this.createButton(centerX, centerY + 80, '侦探手册', () => {
      console.log('打开侦探手册')
    })

    this.trophiesButton = this.createButton(centerX, centerY + 160, '荣誉墙', () => {
      console.log('打开荣誉墙')
    })
  }

  createButton(x: number, y: number, text: string, onClick: () => void): Phaser.GameObjects.Container {
    const container = this.add.container(x, y)

    const background = this.add.rectangle(0, 0, 200, 50, 0x4a5568)
    background.setStrokeStyle(2, 0xffd700)

    const buttonText = this.add.text(0, 0, text, {
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(0.5)

    container.add([background, buttonText])

    container.setInteractive(new Phaser.Geom.Rectangle(-100, -25, 200, 50), Phaser.Geom.Rectangle.Contains)
      .on('pointerover', () => {
        background.setFillStyle(0x5a6578)
      })
      .on('pointerout', () => {
        background.setFillStyle(0x4a5568)
      })
      .on('pointerdown', onClick)

    return container
  }

  createDecorations() {
    const centerX = this.cameras.main.width / 2

    this.add.text(centerX, this.cameras.main.height - 50, '为8-10岁儿童设计的数学推理游戏', {
      fontSize: '16px',
      color: '#888888'
    }).setOrigin(0.5)
  }
}