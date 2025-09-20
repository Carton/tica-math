import Phaser from 'phaser'

export default class MainMenuScene extends Phaser.Scene {
  constructor() {
    super('MainMenuScene')
  }

  create() {
    const { width, height } = this.scale
    const title = this.add.text(width / 2, height / 2 - 80, 'Tica 侦探事务所：数字谜案', {
      fontFamily: 'sans-serif',
      fontSize: '32px',
      color: '#ffffff',
    }).setOrigin(0.5)

    const start = this.add.text(width / 2, title.y + 100, '开始破案 ▶', {
      fontFamily: 'sans-serif',
      fontSize: '28px',
      color: '#00e18c',
      backgroundColor: '#132235',
      padding: { x: 16, y: 10 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })

    start.on('pointerup', () => {
      this.scene.start('GameScene')
      this.scene.launch('UIScene')
    })

    this.input.keyboard?.once('keydown-ENTER', () => start.emit('pointerup'))
  }
}
