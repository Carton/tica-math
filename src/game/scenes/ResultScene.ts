import Phaser from 'phaser'

export default class ResultScene extends Phaser.Scene {
  constructor() {
    super('ResultScene')
  }

  create() {
    const { width, height } = this.scale
    const title = this.add.text(width / 2, height / 2 - 40, '案件告一段落', {
      fontFamily: 'sans-serif', fontSize: '36px', color: '#ffffff'
    }).setOrigin(0.5)

    const back = this.add.text(width / 2, title.y + 100, '返回事务所', {
      fontFamily: 'sans-serif', fontSize: '24px', color: '#0b1021', backgroundColor: '#a9ffea', padding: { x: 16, y: 8 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })

    back.on('pointerup', () => {
      this.scene.stop('GameScene')
      this.scene.stop('UIScene')
      this.scene.start('MainMenuScene')
    })

    this.input.keyboard?.once('keydown-ENTER', () => back.emit('pointerup'))
  }
}
