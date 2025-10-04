import Phaser from 'phaser'
import { SaveManager } from '@/game/managers/SaveManager'
import { Strings } from '@/game/managers/Strings'
import { createTextButton } from '@/game/utils/uiFactory'

export default class UserScene extends Phaser.Scene {
  // 输入相关
  private inputField: Phaser.GameObjects.Text | null = null
  private inputText: string = ''
  private errorMessage: Phaser.GameObjects.Text | null = null

  // 列表/分页
  private users: { id: string; data: any }[] = []
  private currentUserId: string = ''
  private pageIndex: number = 0
  private readonly pageSize: number = 8
  private listItemContainers: Phaser.GameObjects.Container[] = []
  private pagePrevBtn: Phaser.GameObjects.Text | null = null
  private pageNextBtn: Phaser.GameObjects.Text | null = null
  private pageIndicator: Phaser.GameObjects.Text | null = null

  // 弹窗
  private modalContainer: Phaser.GameObjects.Container | null = null
  private isModalOpen: boolean = false
  private keyHandler: ((e: KeyboardEvent) => void) | null = null

  constructor() {
    super('UserScene')
  }

  create() {
    const { width, height } = this.scale

    // 数据
    this.users = SaveManager.getAllUsers()
    this.currentUserId = SaveManager.getCurrentUserId()

    // 标题与"新建用户"按钮
    this.add.text(width / 2, 60, Strings.t('ui.select_user'), { fontFamily: 'sans-serif', fontSize: '32px', color: '#ffffff' }).setOrigin(0.5)
    const createBtnTop = createTextButton(this, width - 140, 40, {
      text: Strings.t('ui.new_user'),
      style: { backgroundColor: '#ffd166', fontSize: '20px' },
      configKey: 'secondaryButton',
    }).setOrigin(0.5, 0.5)
    createBtnTop.on('pointerup', () => this.openCreateDialog())

    // 用户列表（分页）
    this.renderUserList()

    // 返回按钮（仅当已有用户时）
    if (this.users.length > 0) {
      const backBtn = createTextButton(this, width / 2, height - 60, {
        text: Strings.t('ui.return'),
        style: { backgroundColor: '#a9ffea' },
        configKey: 'button',
      })
      backBtn.on('pointerup', () => this.scene.start('MainMenuScene'))
    }
    // ESC 返回
    this.input.keyboard?.on('keydown-ESC', () => {
      if (!this.isModalOpen && this.users.length > 0) this.scene.start('MainMenuScene')
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

  private renderUserList() {
    const { width } = this.scale

    // 清理旧项
    this.listItemContainers.forEach(c => c.destroy())
    this.listItemContainers = []
    this.pagePrevBtn?.destroy()
    this.pageNextBtn?.destroy()
    this.pageIndicator?.destroy()

    const listLeft = 60
    const listRight = width - 60
    const rowWidth = listRight - listLeft
    const rowHeight = 44
    const startY = 120

    const start = this.pageIndex * this.pageSize
    const end = Math.min(start + this.pageSize, this.users.length)
    const slice = this.users.slice(start, end)

    let y = startY
    slice.forEach(({ id, data }) => {
      const bg = this.add.rectangle(rowWidth / 2, 0, rowWidth, rowHeight, 0x1a2332)
        .setStrokeStyle(2, id === this.currentUserId ? 0x2de1c2 : 0x3a4a5c)

      const text = this.add.text(12, 0, `${id}  ${Strings.t('ui.level_prefix')}${data.bestLevel}  ${Strings.t('ui.badges_count')}:${data.badges.length}  ${Strings.t('ui.exp_prefix')}${data.exp}`, {
        fontFamily: 'monospace', fontSize: '18px', color: id === this.currentUserId ? '#2de1c2' : '#a9ffea'
      }).setOrigin(0, 0.5)

      const row = this.add.container(listLeft, y, [bg, text]).setSize(rowWidth, rowHeight).setInteractive({ useHandCursor: true })

      row.on('pointerup', () => {
        SaveManager.setCurrentUser(id)
        this.scene.start('MainMenuScene')
      })

      row.on('pointerover', () => {
        bg.setFillStyle(0x2a3a4a)
      })
      row.on('pointerout', () => {
        bg.setFillStyle(0x1a2332)
      })

      this.listItemContainers.push(row)
      y += rowHeight + 8
    })

    // 分页控件
    const totalPages = Math.max(1, Math.ceil(this.users.length / this.pageSize))
    const pagerY = y + 10
    this.pagePrevBtn = createTextButton(this, listLeft + 120, pagerY, {
      text: Strings.t('ui.prev_page'),
      style: { backgroundColor: '#132235', color: '#a9ffea', fontSize: '18px' },
      configKey: 'secondaryButton',
      useHandCursor: totalPages > 1,
    }).setOrigin(0.5)
      .on('pointerup', () => {
        if (this.pageIndex > 0) {
          this.pageIndex -= 1
          this.renderUserList()
        }
      })

    this.pageIndicator = this.add.text(listLeft + rowWidth / 2, pagerY, `${this.pageIndex + 1} / ${totalPages}`, { fontFamily: 'monospace', fontSize: '14px', color: '#a9ffea' }).setOrigin(0.5)

    this.pageNextBtn = createTextButton(this, listLeft + rowWidth - 120, pagerY, {
      text: Strings.t('ui.next_page'),
      style: { backgroundColor: '#132235', color: '#a9ffea', fontSize: '18px' },
      configKey: 'secondaryButton',
      useHandCursor: totalPages > 1,
    }).setOrigin(0.5)
      .on('pointerup', () => {
        if (this.pageIndex < totalPages - 1) {
          this.pageIndex += 1
          this.renderUserList()
        }
      })
  }

  private openCreateDialog() {
    if (this.isModalOpen) return
    this.isModalOpen = true
    const { width, height } = this.scale

    this.inputText = ''
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.5).setInteractive()
    const panelW = 480
    const panelH = 220
    const cx = width / 2
    const cy = height / 2
    const panel = this.add.rectangle(cx, cy, panelW, panelH, 0x1a2332).setStrokeStyle(2, 0x3a4a5c)
    const title = this.add.text(cx, cy - panelH / 2 + 16, Strings.t('ui.create_user'), { fontFamily: 'sans-serif', fontSize: '18px', color: '#ffffff' }).setOrigin(0.5, 0)

    const inputBg = this.add.rectangle(cx, cy - 10, panelW - 80, 44, 0x0f1724).setStrokeStyle(1, 0x3a4a5c)
    this.inputField = this.add.text(cx, cy - 10, '_', { fontFamily: 'monospace', fontSize: '18px', color: '#ffffff' }).setOrigin(0.5)
    const hint = this.add.text(cx, cy + 20, Strings.t('ui.enter_user_id'), { fontFamily: 'sans-serif', fontSize: '14px', color: '#666666' }).setOrigin(0.5)
    this.errorMessage = this.add.text(cx, cy + 44, '', { fontFamily: 'sans-serif', fontSize: '14px', color: '#ff4444' }).setOrigin(0.5)

    const ok = createTextButton(this, cx - 100, cy + 80, {
      text: Strings.t('ui.create'),
      style: { backgroundColor: '#2de1c2' },
      configKey: 'primaryButton',
    })
    const cancel = createTextButton(this, cx + 100, cy + 80, {
      text: Strings.t('ui.cancel'),
      style: { backgroundColor: '#666666', color: '#ffffff' },
      configKey: 'secondaryButton',
    })

    ok.on('pointerup', () => this.createUser())
    cancel.on('pointerup', () => this.closeCreateDialog())

    this.modalContainer = this.add.container(0, 0, [overlay, panel, title, inputBg, this.inputField, hint, this.errorMessage, ok, cancel])

    // 键盘处理（仅弹窗期间）
    this.keyHandler = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        this.createUser()
      } else if (event.key === 'Escape') {
        this.closeCreateDialog()
      } else if (event.key === 'Backspace') {
        this.inputText = this.inputText.slice(0, -1)
        this.updateInputDisplay()
      } else if (event.key.length === 1 && this.inputText.length < 20) {
        if (/[a-zA-Z0-9_]/.test(event.key)) {
          this.inputText += event.key
          this.updateInputDisplay()
        }
      }
    }
    this.input.keyboard?.on('keydown', this.keyHandler)
  }

  private closeCreateDialog() {
    if (!this.isModalOpen) return
    this.isModalOpen = false
    if (this.keyHandler) this.input.keyboard?.off('keydown', this.keyHandler)
    this.keyHandler = null
    this.modalContainer?.destroy()
    this.modalContainer = null
    this.inputField = null
    this.errorMessage = null
    this.inputText = ''
  }

  private createUser() {
    const id = this.inputText.trim()

    if (!id) {
      this.showError(Strings.t('errors.user_id_empty'))
      return
    }

    if (!/^[a-zA-Z0-9_]+$/.test(id)) {
      this.showError(Strings.t('errors.user_id_invalid'))
      return
    }

    if (SaveManager.getAllUsers().some(user => user.id === id)) {
      this.showError(Strings.t('errors.user_id_exists'))
      return
    }

    SaveManager.createUser(id)
    // 刷新数据与界面，保持在此场景，不自动切换
    this.users = SaveManager.getAllUsers()
    this.renderUserList()
    this.closeCreateDialog()
  }
}