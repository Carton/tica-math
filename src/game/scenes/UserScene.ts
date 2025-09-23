import Phaser from 'phaser'
import { SaveManager } from '@/game/managers/SaveManager'

export default class UserScene extends Phaser.Scene {
  private inputField: Phaser.GameObjects.Text | null = null
  private inputText: string = ''
  private errorMessage: Phaser.GameObjects.Text | null = null

  constructor() {
    super('UserScene')
  }

  create() {
    const { width, height } = this.scale

    // 标题
    this.add.text(width / 2, 60, '选择用户', { fontFamily: 'sans-serif', fontSize: '32px', color: '#ffffff' }).setOrigin(0.5)

    // 显示现有用户
    const users = SaveManager.getAllUsers()
    const cur = SaveManager.getCurrentUserId()

    let y = 120
    users.forEach(({ id, data }) => {
      const userBg = this.add.rectangle(width / 2, y, width - 160, 40, 0x1a2332)
        .setStrokeStyle(2, id === cur ? 0x2de1c2 : 0x3a4a5c)

      const userText = this.add.text(width / 2, y, `${id}  Lv.${data.bestLevel}  徽章:${data.badges.length}  EXP:${data.exp}`, {
        fontFamily: 'monospace',
        fontSize: '18px',
        color: id === cur ? '#2de1c2' : '#a9ffea'
      }).setOrigin(0.5)

      const userContainer = this.add.container(width / 2, y, [userBg, userText])
        .setSize(width - 160, 40)
        .setInteractive({ useHandCursor: true })

      userContainer.on('pointerup', () => {
        SaveManager.setCurrentUser(id)
        this.scene.start('MainMenuScene')
      })

      // 悬停效果
      userContainer.on('pointerover', () => {
        userBg.setFillStyle(0x2a3a4a)
      })
      userContainer.on('pointerout', () => {
        userBg.setFillStyle(0x1a2332)
      })

      y += 50
    })

    // 新建用户区域
    const createY = y + 20
    this.add.text(width / 2, createY, '新建用户', { fontFamily: 'sans-serif', fontSize: '24px', color: '#ffffff' }).setOrigin(0.5)

    // 输入框背景
    const inputBg = this.add.rectangle(width / 2, createY + 40, 300, 40, 0x1a2332)
      .setStrokeStyle(2, 0x3a4a5c)

    // 输入框
    this.inputField = this.add.text(width / 2, createY + 40, '', {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#ffffff'
    }).setOrigin(0.5)

    // 输入提示
    this.add.text(width / 2, createY + 65, '输入用户ID (字母数字下划线)', {
      fontFamily: 'sans-serif',
      fontSize: '14px',
      color: '#666666'
    }).setOrigin(0.5)

    // 错误信息显示
    this.errorMessage = this.add.text(width / 2, createY + 85, '', {
      fontFamily: 'sans-serif',
      fontSize: '14px',
      color: '#ff4444'
    }).setOrigin(0.5)

    // 创建按钮
    const createBtn = this.add.text(width / 2, createY + 110, '创建用户', {
      fontFamily: 'sans-serif',
      fontSize: '18px',
      color: '#0b1021',
      backgroundColor: '#2de1c2',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })

    createBtn.on('pointerup', () => this.createUser())

    // 取消按钮（只有在有用户时才显示）
    if (users.length > 0) {
      const cancelBtn = this.add.text(width / 2, createY + 150, '取消', {
        fontFamily: 'sans-serif',
        fontSize: '16px',
        color: '#0b1021',
        backgroundColor: '#666666',
        padding: { x: 16, y: 8 }
      }).setOrigin(0.5).setInteractive({ useHandCursor: true })

      cancelBtn.on('pointerup', () => {
        this.scene.start('MainMenuScene')
      })
    }

    // 键盘输入处理
    this.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        this.createUser()
      } else if (event.key === 'Escape' && users.length > 0) {
        this.scene.start('MainMenuScene')
      } else if (event.key === 'Backspace') {
        this.inputText = this.inputText.slice(0, -1)
        this.updateInputDisplay()
      } else if (event.key.length === 1 && this.inputText.length < 20) {
        // 只允许字母数字和下划线
        if (/[a-zA-Z0-9_]/.test(event.key)) {
          this.inputText += event.key
          this.updateInputDisplay()
        }
      }
    })
  }

  private updateInputDisplay() {
    if (this.inputField) {
      this.inputField.setText(this.inputText || '_')
    }
    this.clearError()
  }

  private showError(message: string) {
    if (this.errorMessage) {
      this.errorMessage.setText(message)
    }
  }

  private clearError() {
    if (this.errorMessage) {
      this.errorMessage.setText('')
    }
  }

  private createUser() {
    const id = this.inputText.trim()

    if (!id) {
      this.showError('用户ID不能为空')
      return
    }

    if (!/^[a-zA-Z0-9_]+$/.test(id)) {
      this.showError('用户ID只能包含字母、数字和下划线')
      return
    }

    if (SaveManager.getAllUsers().some(user => user.id === id)) {
      this.showError('用户ID已存在')
      return
    }

    SaveManager.createUser(id)
    SaveManager.setCurrentUser(id)
    this.scene.start('MainMenuScene')
  }
}