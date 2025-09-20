export default class PreloaderScene extends Phaser.Scene {
  private progressBar!: Phaser.GameObjects.Rectangle
  private progressText!: Phaser.GameObjects.Text
  private loadingText!: Phaser.GameObjects.Text

  constructor() {
    super('PreloaderScene')
  }

  preload() {
    this.createProgressBar()

    this.load.pack('game-pack', 'assets/game-pack.json')

    this.load.on('progress', this.updateProgressBar.bind(this))
    this.load.on('complete', this.onLoadComplete.bind(this))
  }

  createProgressBar() {
    const centerX = this.cameras.main.width / 2
    const centerY = this.cameras.main.height / 2

    this.loadingText = this.add.text(centerX, centerY - 50, '正在加载...', {
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(0.5)

    this.progressBar = this.add.rectangle(
      centerX - 200,
      centerY,
      400,
      30,
      0x333333
    )

    this.progressText = this.add.text(centerX, centerY + 50, '0%', {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5)
  }

  updateProgressBar(progress: number) {
    const width = 400 * progress
    this.progressBar.setSize(width, 30)
    this.progressText.setText(`${Math.round(progress * 100)}%`)
  }

  onLoadComplete() {
    this.loadingText.setText('加载完成！')
    this.time.delayedCall(1000, () => {
      this.scene.start('MainMenuScene')
    })
  }
}