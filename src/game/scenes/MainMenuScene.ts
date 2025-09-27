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

    // 如果有背景图，则创建沉浸式热区；否则显示文字按钮
    if (this.textures.exists('bg_office')) {
      // 沉浸式热区模式
      const deskHotspot = this.add.rectangle(width * 0.41, height * 0.68, width * 0.35, height * 0.12, 0x00ff00, 0)
        .setInteractive({ useHandCursor: true })
        .on('pointerover', () => {
          deskHotspot.setFillStyle(0xffffff, 0.3)
          const glowFx = deskHotspot.preFX?.addGlow(0xffffff, 0.3, 0, false)
        })
        .on('pointerout', () => {
          deskHotspot.setFillStyle(0x0, 0)
          deskHotspot.preFX?.clear()
        })
        .on('pointerup', () => {
          const level = user.bestLevel || 1
          ToolManager.resetToDefault()
          this.scene.launch('UIScene', { level })
          this.scene.start('GameScene', { level })
        })

      const nameHotspot = this.add.rectangle(width * 0.255, height * 0.37, width * 0.05, height * 0.12, 0xff0000, 0)
        .setInteractive({ useHandCursor: true })
        .on('pointerover', () => {
          nameHotspot.setFillStyle(0xffffff, 0.3)
          const glowFx = nameHotspot.preFX?.addGlow(0xffffff, 0.3, 0, false)
        })
        .on('pointerout', () => {
          nameHotspot.setFillStyle(0x0, 0)
          nameHotspot.preFX?.clear()
        })
        .on('pointerup', () => this.scene.start('UserScene'))

      const manualHotspot = this.add.rectangle(width * 0.81, height * 0.48, width * 0.17, height * 0.37, 0x0000ff, 0)
        .setInteractive({ useHandCursor: true })
        .on('pointerover', () => {
          manualHotspot.setFillStyle(0xffffff, 0.3)
          const glowFx = manualHotspot.preFX?.addGlow(0xffffff, 0.3, 0, false)
        })
        .on('pointerout', () => {
          manualHotspot.setFillStyle(0x0, 0)
          manualHotspot.preFX?.clear()
        })
        .on('pointerup', () => this.scene.start('ManualScene'))

      const honorHotspot = this.add.rectangle(width * 0.71, height * 0.01, width * 0.38, height * 0.55, 0xffffff, 0)
        .setInteractive({ useHandCursor: true })
        .on('pointerover', () => {
          honorHotspot.setFillStyle(0xffffff, 0.3)
          const glowFx = honorHotspot.preFX?.addGlow(0xffffff, 0.3, 0, false)
        })
        .on('pointerout', () => {
          honorHotspot.setFillStyle(0xffffff, 0)
          honorHotspot.preFX?.clear()
        })
        .on('pointerup', () => this.scene.start('HonorScene'))
    } else {
      // 按钮模式 - 只有在背景无法加载时显示
      const buttonStyle = {
        fontFamily: 'sans-serif',
        fontSize: '20px',
        color: '#0b1021',
        backgroundColor: '#2de1c2',
        padding: { x: 16, y: 10 }
      }

      const startY = title.y + 120
      const spacing = 60
      const buttonWidth = 110  // 统一按钮宽度

      const startBtn = this.add.text(width / 2, startY, '开始破案', buttonStyle)
        .setOrigin(0.5).setInteractive({ useHandCursor: true })

      const manualBtn = this.add.text(width / 2, startY + spacing, '侦探手册', buttonStyle)
        .setOrigin(0.5).setInteractive({ useHandCursor: true })

      const honorBtn = this.add.text(width / 2, startY + spacing * 2, '荣誉墙', buttonStyle)
        .setOrigin(0.5).setInteractive({ useHandCursor: true })

      const manageBtn = this.add.text(width / 2, startY + spacing * 3, '切换用户', buttonStyle)
        .setOrigin(0.5).setInteractive({ useHandCursor: true })

      // 设置所有按钮为统一宽度
      startBtn.setFixedSize(buttonWidth, 0)
      manualBtn.setFixedSize(buttonWidth, 0)
      honorBtn.setFixedSize(buttonWidth, 0)
      manageBtn.setFixedSize(buttonWidth, 0)

      // 按钮事件处理
      startBtn.on('pointerup', () => {
        const level = user.bestLevel || 1
        ToolManager.resetToDefault()
        this.scene.launch('UIScene', { level })
        this.scene.start('GameScene', { level })
      })

      manualBtn.on('pointerup', () => this.scene.start('ManualScene'))
      honorBtn.on('pointerup', () => this.scene.start('HonorScene'))
      manageBtn.on('pointerup', () => this.scene.start('UserScene'))

      this.input.keyboard?.once('keydown-ENTER', () => startBtn.emit('pointerup'))
    }

    // 进入时尝试播放主菜单BGM（如果资源就绪）
    AudioManager.tryStartBgm('bgm_main')
  }
}
