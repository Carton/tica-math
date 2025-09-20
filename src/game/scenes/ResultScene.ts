import Phaser from 'phaser'
import type { ResultSummary } from '@/game/utils/types'
import { resultPrimaryActionLabel } from '@/game/utils/gameFlow'

export default class ResultScene extends Phaser.Scene {
  constructor() {
    super('ResultScene')
  }

  create(data: { summary?: ResultSummary; nextLevel?: number }) {
    const { width, height } = this.scale
    const sum = data.summary

    const title = this.add.text(width / 2, height / 2 - 140, sum?.pass ? '案件告破！' : '让教授逃跑了！', {
      fontFamily: 'sans-serif', fontSize: '36px', color: '#ffffff'
    }).setOrigin(0.5)

    const detail = this.add.text(width / 2, title.y + 70,
      `正确率：${Math.round((sum?.accuracy ?? 0) * 100)}%\n评级：${sum?.grade ?? 'C'}\n连击：${sum?.comboMax ?? 0}，道具使用：${sum?.toolsUsed ?? 0}`,
      { fontFamily: 'sans-serif', fontSize: '20px', color: '#a9ffea', align: 'center' }
    ).setOrigin(0.5)

    const back = this.add.text(width / 2, detail.y + 120, '返回事务所', {
      fontFamily: 'sans-serif', fontSize: '24px', color: '#0b1021', backgroundColor: '#a9ffea', padding: { x: 16, y: 8 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })

    const primaryLabel = resultPrimaryActionLabel(!!sum?.pass)
    const primary = this.add.text(width / 2, back.y + 60, primaryLabel, {
      fontFamily: 'sans-serif', fontSize: '22px', color: '#0b1021', backgroundColor: '#2de1c2', padding: { x: 16, y: 8 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })

    back.on('pointerup', () => {
      // 返回事务所：仅切换到菜单，由菜单决定如何开启新局
      this.scene.stop('GameScene')
      this.scene.stop('UIScene')
      this.scene.start('MainMenuScene')
    })

    primary.on('pointerup', () => {
      this.scene.stop('ResultScene')
      if (sum?.pass && data.nextLevel) {
        // 下一局：带 level 参数启动
        this.scene.start('GameScene', { level: data.nextLevel })
        this.scene.launch('UIScene')
      } else {
        // 再来一局：同关重试
        const level = sum?.level ?? 1
        // 确保先关闭残留
        if (this.scene.isActive('GameScene')) this.scene.stop('GameScene')
        if (this.scene.isActive('UIScene')) this.scene.stop('UIScene')
        this.scene.start('GameScene', { level })
        this.scene.launch('UIScene')
      }
    })

    this.input.keyboard?.once('keydown-ENTER', () => primary.emit('pointerup'))
  }
}
