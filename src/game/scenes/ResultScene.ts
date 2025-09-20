import Phaser from 'phaser'
import type { ResultSummary } from '@/game/utils/types'

export default class ResultScene extends Phaser.Scene {
  constructor() {
    super('ResultScene')
  }

  create(data: { summary?: ResultSummary }) {
    const { width, height } = this.scale
    const sum = data.summary

    const title = this.add.text(width / 2, height / 2 - 140, sum?.grade === 'C' ? '让教授逃跑了！' : '案件告破！', {
      fontFamily: 'sans-serif', fontSize: '36px', color: '#ffffff'
    }).setOrigin(0.5)

    const detail = this.add.text(width / 2, title.y + 70,
      `正确率：${Math.round((sum?.accuracy ?? 0) * 100)}%\n评级：${sum?.grade ?? 'C'}\n连击：${sum?.comboMax ?? 0}，道具使用：${sum?.toolsUsed ?? 0}`,
      { fontFamily: 'sans-serif', fontSize: '20px', color: '#a9ffea', align: 'center' }
    ).setOrigin(0.5)

    const back = this.add.text(width / 2, detail.y + 120, '返回事务所', {
      fontFamily: 'sans-serif', fontSize: '24px', color: '#0b1021', backgroundColor: '#a9ffea', padding: { x: 16, y: 8 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })

    const again = this.add.text(width / 2, back.y + 60, '再来一局', {
      fontFamily: 'sans-serif', fontSize: '22px', color: '#0b1021', backgroundColor: '#2de1c2', padding: { x: 16, y: 8 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })

    back.on('pointerup', () => {
      this.scene.stop('GameScene')
      this.scene.stop('UIScene')
      this.scene.start('MainMenuScene')
    })

    again.on('pointerup', () => {
      this.scene.stop('ResultScene')
      this.scene.start('GameScene')
      this.scene.launch('UIScene')
    })

    this.input.keyboard?.once('keydown-ENTER', () => again.emit('pointerup'))
  }
}
