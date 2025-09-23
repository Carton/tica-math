import Phaser from 'phaser'
import { SaveManager } from '@/game/managers/SaveManager'
import { ToolManager } from '@/game/managers/ToolManager'

export default class MainMenuScene extends Phaser.Scene {
  constructor() {
    super('MainMenuScene')
  }

  create() {
    const { width, height } = this.scale

    // 检查是否有用户，如果没有则跳转到用户创建界面
    const users = SaveManager.getAllUsers()
    if (users.length === 0) {
      this.scene.start('UserScene')
      return
    }

    const title = this.add.text(width / 2, height / 2 - 80, 'Tica 侦探事务所：数字谜案', {
      fontFamily: 'sans-serif',
      fontSize: '32px',
      color: '#ffffff',
    }).setOrigin(0.5)

    const userId = SaveManager.getCurrentUserId()
    const user = SaveManager.getCurrent()
    this.add.text(width / 2, title.y + 40, `当前用户: ${userId}  最高关: ${user.bestLevel}  徽章:${user.badges.length}`, { fontFamily: 'monospace', fontSize: '14px', color: '#a9ffea' }).setOrigin(0.5)

    const start = this.add.text(width / 2, title.y + 100, '开始破案 ▶', {
      fontFamily: 'sans-serif',
      fontSize: '28px',
      color: '#00e18c',
      backgroundColor: '#132235',
      padding: { x: 16, y: 10 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })

    const honor = this.add.text(width / 2 - 120, start.y + 60, '荣誉墙', {
      fontFamily: 'sans-serif', fontSize: '20px', color: '#0b1021', backgroundColor: '#a9ffea', padding: { x: 12, y: 6 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })

    const manual = this.add.text(width / 2 + 120, start.y + 60, '侦探手册', {
      fontFamily: 'sans-serif', fontSize: '20px', color: '#0b1021', backgroundColor: '#a9ffea', padding: { x: 12, y: 6 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })

    const manage = this.add.text(width / 2, start.y + 110, '切换用户', {
      fontFamily: 'sans-serif', fontSize: '16px', color: '#0b1021', backgroundColor: '#ffd166', padding: { x: 12, y: 6 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })

    start.on('pointerup', () => {
      const level = user.bestLevel || 1
      ToolManager.resetToDefault()
      this.scene.launch('UIScene', { level })
      this.scene.start('GameScene', { level })
    })

    honor.on('pointerup', () => this.scene.start('HonorScene'))
    manual.on('pointerup', () => this.scene.start('ManualScene'))
    manage.on('pointerup', () => this.scene.start('UserScene'))

    this.input.keyboard?.on('keydown-ESC', () => this.scene.start('HonorScene'))
    this.input.keyboard?.once('keydown-ENTER', () => start.emit('pointerup'))
  }
}
