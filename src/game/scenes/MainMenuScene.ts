import Phaser from 'phaser'
import { SaveManager } from '@/game/managers/SaveManager'
import { ToolManager } from '@/game/managers/ToolManager'
import { AudioManager } from '@/game/managers/AudioManager'

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

    // 尝试渲染像素律所背景（若资源存在）
    let titleY = height / 2 - 80
    try {
      const hasBg = this.textures.exists('bg_office')
      if (hasBg) {
        const bg = this.add.image(width / 2, height / 2, 'bg_office')
        bg.setOrigin(0.5).setDepth(-10)
        bg.setDisplaySize(1280, 720)
        // 沉浸式：隐藏显式按钮，使用热区
        titleY = 80
      }
    } catch {}

    const title = this.add.text(width / 2, titleY, 'Tica 侦探事务所：数字谜案', {
      fontFamily: 'sans-serif',
      fontSize: '32px',
      color: '#ffffff',
    }).setOrigin(0.5)

    const userId = SaveManager.getCurrentUserId()
    const user = SaveManager.getCurrent()
    this.add.text(width / 2, title.y + 40, `当前用户: ${userId}  最高关: ${user.bestLevel}  徽章:${user.badges.length}`, { fontFamily: 'monospace', fontSize: '14px', color: '#a9ffea' }).setOrigin(0.5)

    // 如果有背景图，则创建沉浸式热区；否则保留文字按钮
    let start: Phaser.GameObjects.Text | Phaser.GameObjects.Rectangle
    if (this.textures.exists('bg_office')) {
      // 模拟：桌面热区（开始游戏）、公告板（手册）、书架（荣誉墙）、门（切换用户）
      const deskHotspot = this.add.rectangle(width * 0.5, height * 0.7, width * 0.35, height * 0.2, 0x00ff00, 0)
        .setInteractive({ useHandCursor: true })
        .on('pointerover', () => deskHotspot.setStrokeStyle(2, 0x2de1c2))
        .on('pointerout', () => deskHotspot.setStrokeStyle())
        .on('pointerup', () => {
          const level = user.bestLevel || 1
          ToolManager.resetToDefault()
          this.scene.launch('UIScene', { level })
          this.scene.start('GameScene', { level })
        })
      start = deskHotspot

      const boardHotspot = this.add.rectangle(width * 0.18, height * 0.35, width * 0.25, height * 0.25, 0xff0000, 0)
        .setInteractive({ useHandCursor: true })
        .on('pointerover', () => boardHotspot.setStrokeStyle(2, 0xffd166))
        .on('pointerout', () => boardHotspot.setStrokeStyle())
        .on('pointerup', () => this.scene.start('ManualScene'))

      const shelfHotspot = this.add.rectangle(width * 0.85, height * 0.45, width * 0.2, height * 0.5, 0x0000ff, 0)
        .setInteractive({ useHandCursor: true })
        .on('pointerover', () => shelfHotspot.setStrokeStyle(2, 0xa9ffea))
        .on('pointerout', () => shelfHotspot.setStrokeStyle())
        .on('pointerup', () => this.scene.start('HonorScene'))

      const doorHotspot = this.add.rectangle(width * 0.05, height * 0.85, width * 0.1, height * 0.25, 0xffffff, 0)
        .setInteractive({ useHandCursor: true })
        .on('pointerover', () => doorHotspot.setStrokeStyle(2, 0xffffff))
        .on('pointerout', () => doorHotspot.setStrokeStyle())
        .on('pointerup', () => this.scene.start('UserScene'))
    } else {
      start = this.add.text(width / 2, title.y + 100, '开始破案 ▶', {
        fontFamily: 'sans-serif',
        fontSize: '28px',
        color: '#00e18c',
        backgroundColor: '#132235',
        padding: { x: 16, y: 10 },
      }).setOrigin(0.5).setInteractive({ useHandCursor: true })
    }

    const honor = this.add.text(width / 2 - 120, (start instanceof Phaser.GameObjects.Text ? start.y : title.y + 140), '荣誉墙', {
      fontFamily: 'sans-serif', fontSize: '20px', color: '#0b1021', backgroundColor: '#a9ffea', padding: { x: 12, y: 6 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })

    const manual = this.add.text(width / 2 + 120, (start instanceof Phaser.GameObjects.Text ? start.y : title.y + 140), '侦探手册', {
      fontFamily: 'sans-serif', fontSize: '20px', color: '#0b1021', backgroundColor: '#a9ffea', padding: { x: 12, y: 6 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })

    const manage = this.add.text(width / 2, (start instanceof Phaser.GameObjects.Text ? start.y + 110 : title.y + 200), '切换用户', {
      fontFamily: 'sans-serif', fontSize: '16px', color: '#0b1021', backgroundColor: '#ffd166', padding: { x: 12, y: 6 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })

    if (start instanceof Phaser.GameObjects.Text) {
      start.on('pointerup', () => {
        const level = user.bestLevel || 1
        ToolManager.resetToDefault()
        this.scene.launch('UIScene', { level })
        this.scene.start('GameScene', { level })
      })
    }

    honor.on('pointerup', () => this.scene.start('HonorScene'))
    manual.on('pointerup', () => this.scene.start('ManualScene'))
    manage.on('pointerup', () => this.scene.start('UserScene'))
    if (start instanceof Phaser.GameObjects.Text) {
      this.input.keyboard?.once('keydown-ENTER', () => start.emit('pointerup'))
    }

    // 进入时尝试播放主菜单BGM（如果资源就绪）
    AudioManager.tryStartBgm('bgm_main')
  }
}
