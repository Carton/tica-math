import Phaser from 'phaser'
import { SaveManager } from '@/game/managers/SaveManager'

export default class HonorScene extends Phaser.Scene {
  constructor() {
    super('HonorScene')
  }

  create() {
    const { width, height } = this.scale

    // 标题
    this.add.text(width / 2, 60, '荣誉墙', { fontFamily: 'sans-serif', fontSize: '32px', color: '#ffffff' }).setOrigin(0.5)

    // 多用户列表（可点击切换当前用户）
    const users = SaveManager.getAllUsers()
    const cur = SaveManager.getCurrentUserId()

    let y = 120
    users.forEach(({ id, data }) => {
      const line = this.add.text(80, y, `${id}  Lv.${data.bestLevel}  徽章:${data.badges.length}  EXP:${data.exp}`, {
        fontFamily: 'monospace',
        fontSize: '18px',
        color: id === cur ? '#2de1c2' : '#a9ffea'
      }).setInteractive({ useHandCursor: true })

      line.on('pointerup', () => {
        SaveManager.setCurrentUser(id)
        this.scene.restart()
      })
      y += 32
    })

    // 返回按钮
    const back = this.add.text(width / 2, height - 80, '返回', { fontFamily: 'sans-serif', fontSize: '22px', color: '#0b1021', backgroundColor: '#a9ffea', padding: { x: 16, y: 8 } }).setOrigin(0.5).setInteractive({ useHandCursor: true })
    back.on('pointerup', () => this.scene.start('MainMenuScene'))

    this.input.keyboard?.on('keydown-ESC', () => this.scene.start('MainMenuScene'))
  }
}
