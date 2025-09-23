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

    // 当前用户信息
    const currentUser = SaveManager.getCurrent()
    const userId = SaveManager.getCurrentUserId()

    this.add.text(width / 2, 120, `用户: ${userId}`, {
      fontFamily: 'sans-serif',
      fontSize: '20px',
      color: '#2de1c2'
    }).setOrigin(0.5)

    // 统计信息
    this.add.text(width / 2, 160, `最高关卡: ${currentUser.bestLevel}`, {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#a9ffea'
    }).setOrigin(0.5)

    this.add.text(width / 2, 190, `经验值: ${currentUser.exp}`, {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#a9ffea'
    }).setOrigin(0.5)

    // 徽章显示
    this.add.text(width / 2, 240, '获得徽章', {
      fontFamily: 'sans-serif',
      fontSize: '22px',
      color: '#ffffff'
    }).setOrigin(0.5)

    if (currentUser.badges.length > 0) {
      // 徽章网格显示
      const badgeSize = 60
      const badgeSpacing = 20
      const badgesPerRow = 5
      const startX = width / 2 - (badgesPerRow * (badgeSize + badgeSpacing)) / 2 + badgeSize / 2

      currentUser.badges.forEach((badge, index) => {
        const row = Math.floor(index / badgesPerRow)
        const col = index % badgesPerRow
        const x = startX + col * (badgeSize + badgeSpacing)
        const y = 300 + row * (badgeSize + badgeSpacing)

        // 解析徽章字符串（格式如 "S_1", "S_2"）
        const badgeMatch = badge.match(/([A-Z]+)_(\d+)/)
        const badgeType = badgeMatch ? badgeMatch[1] : 'S'
        const badgeLevel = badgeMatch ? parseInt(badgeMatch[2]) : 1

        // 徽章背景
        const badgeBg = this.add.circle(x, y, badgeSize / 2, 0x2de1c2)

        // 徽章图标（统一使用奖杯图标）
        const badgeIcon = this.add.text(x, y, '🏆', {
          fontSize: '24px'
        }).setOrigin(0.5)

        // 徽章提示
        const badgeText = this.add.text(x, y + badgeSize / 2 + 15, `${badgeType} 级别 ${badgeLevel}`, {
          fontFamily: 'sans-serif',
          fontSize: '12px',
          color: '#a9ffea'
        }).setOrigin(0.5)
      })
    } else {
      this.add.text(width / 2, 300, '暂无徽章，继续努力！', {
        fontFamily: 'sans-serif',
        fontSize: '16px',
        color: '#666666'
      }).setOrigin(0.5)
    }

    // 成就显示
    this.add.text(width / 2, 420, '成就记录', {
      fontFamily: 'sans-serif',
      fontSize: '22px',
      color: '#ffffff'
    }).setOrigin(0.5)

    const achievements = [
      { name: '初出茅庐', condition: currentUser.bestLevel >= 1 },
      { name: '小有成就', condition: currentUser.bestLevel >= 5 },
      { name: '经验丰富', condition: currentUser.bestLevel >= 10 },
      { name: '数学大师', condition: currentUser.bestLevel >= 20 },
      { name: '徽章收集者', condition: currentUser.badges.length >= 5 },
      { name: '徽章大师', condition: currentUser.badges.length >= 10 },
    ]

    let achY = 460
    achievements.forEach(achievement => {
      const color = achievement.condition ? '#2de1c2' : '#666666'
      const prefix = achievement.condition ? '✓' : '○'
      this.add.text(width / 2, achY, `${prefix} ${achievement.name}`, {
        fontFamily: 'monospace',
        fontSize: '16px',
        color: color
      }).setOrigin(0.5)
      achY += 25
    })

    // 返回按钮
    const back = this.add.text(width / 2, height - 60, '返回', {
      fontFamily: 'sans-serif',
      fontSize: '20px',
      color: '#0b1021',
      backgroundColor: '#a9ffea',
      padding: { x: 16, y: 8 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })

    back.on('pointerup', () => this.scene.start('MainMenuScene'))

    // 管理用户按钮
    const manageBtn = this.add.text(width / 2, height - 110, '管理用户', {
      fontFamily: 'sans-serif',
      fontSize: '16px',
      color: '#0b1021',
      backgroundColor: '#ffd166',
      padding: { x: 12, y: 6 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })

    manageBtn.on('pointerup', () => this.scene.start('UserScene'))

    this.input.keyboard?.on('keydown-ESC', () => this.scene.start('MainMenuScene'))
  }
}
