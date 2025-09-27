import Phaser from 'phaser'
import { on, off, emit } from '@/game/managers/EventBus'
import { ToolManager } from '@/game/managers/ToolManager'
import { SaveManager } from '@/game/managers/SaveManager'

export default class UIScene extends Phaser.Scene {
  private headerLeftText?: Phaser.GameObjects.Text
  private headerToolText?: Phaser.GameObjects.Text
  private countdownText?: Phaser.GameObjects.Text
  private footerToolText?: Phaser.GameObjects.Text
  private hintText?: Phaser.GameObjects.Text
  private footerHintText?: Phaser.GameObjects.Text
  private toolUpdateHandler?: () => void
  private remainingMs = 0
  private timer?: Phaser.Time.TimerEvent
  private pausedOverlay?: Phaser.GameObjects.Rectangle
  private pausedDialog?: Phaser.GameObjects.Container
  private isPaused = false
  private currentLevel = 1
  private userId = ''
  private clueIndex = 0
  private clueTotal = 0

  private progressHandler = ({ index, total }: { index: number; total: number }) => {
    this.clueIndex = index
    this.clueTotal = total
    this.updateHeaderLeftText()
  }
  private countdownStartHandler = ({ totalMs }: { totalMs: number }) => this.startCountdown(totalMs)
  private countdownExtendHandler = ({ deltaMs }: { deltaMs: number }) => this.extendCountdown(deltaMs)
  private hintHandler = ({ hint }: { hint: string }) => this.showHint(hint)

  private handleEscKey = () => this.togglePauseDialog()
  private handleTrueKey = () => this.emitChoice(true)
  private handleRightKey = () => this.emitChoice(true)
  private handleFalseKey = () => this.emitChoice(false)
  private handleLeftKey = () => this.emitChoice(false)

  constructor() {
    super('UIScene')
  }

  init(data: { level?: number } = {}) {
    if (data.level) this.currentLevel = data.level
  }

  create() {
    const { width, height } = this.scale
    const headerY = 34

    this.userId = SaveManager.getCurrentUserId() || ''
    this.clueIndex = 0
    this.clueTotal = 10
    this.headerLeftText = this.add.text(40, headerY, '', {
      fontFamily: 'sans-serif',
      fontSize: '20px',
      color: '#ffffff',
    }).setOrigin(0, 0.5)
    this.updateHeaderLeftText()

    this.countdownText = this.add.text(width - 40, headerY, '00:00', {
      fontFamily: 'sans-serif',
      fontSize: '20px',
      color: '#ffd166',
    }).setOrigin(1, 0.5)

    const hintAreaWidth = width * 0.36
    this.hintText = this.add.text(width / 2, headerY, '', {
      fontFamily: 'sans-serif',
      fontSize: '20px',
      color: '#a9ffea',
      align: 'center',
      wordWrap: { width: hintAreaWidth },
    }).setOrigin(0.5, 0.5)

    this.headerToolText = this.add.text(width * 0.82, headerY, '', {
      fontFamily: 'sans-serif',
      fontSize: '20px',
      color: '#a9ffea',
      align: 'center',
    }).setOrigin(0.5, 0.5)

    this.footerToolText = this.add.text(width - 260, height - 140, '', {
      fontFamily: 'sans-serif',
      fontSize: '18px',
      color: '#a9ffea',
    }).setOrigin(0, 0.5)

    this.footerHintText = this.add.text(40, height - 140, '', {
      fontFamily: 'sans-serif',
      fontSize: '18px',
      color: '#ffffff',
      wordWrap: { width: width - 300 },
    })

    // 使用印章精灵（若资源存在），否则使用文字按钮
    let btnTrue: Phaser.GameObjects.GameObject
    let btnFalse: Phaser.GameObjects.GameObject
    if (this.textures.exists('stamp_true') && this.textures.exists('stamp_false')) {
      const sTrue = this.add.image(width / 2 - 120, height - 80, 'stamp_true').setOrigin(0.5).setInteractive({ useHandCursor: true })
      const sFalse = this.add.image(width / 2 + 120, height - 80, 'stamp_false').setOrigin(0.5).setInteractive({ useHandCursor: true })

      // 缩放印章到160x160像素
      sTrue.setDisplaySize(160, 160)
      sFalse.setDisplaySize(160, 160)

      btnTrue = sTrue
      btnFalse = sFalse
    } else {
      const tTrue = this.add.text(width / 2 - 120, height - 80, '✅ 真相 (T/→)', {
        fontFamily: 'sans-serif', fontSize: '24px', color: '#0b1021', backgroundColor: '#2de1c2', padding: { x: 14, y: 8 }
      }).setOrigin(0.5).setInteractive({ useHandCursor: true })
      const tFalse = this.add.text(width / 2 + 120, height - 80, '❌ 伪证 (F/←)', {
        fontFamily: 'sans-serif', fontSize: '24px', color: '#0b1021', backgroundColor: '#ff6b6b', padding: { x: 14, y: 8 }
      }).setOrigin(0.5).setInteractive({ useHandCursor: true })
      btnTrue = tTrue
      btnFalse = tFalse
    }

    ;(btnTrue as any).on('pointerup', () => this.emitChoice(true))
    ;(btnFalse as any).on('pointerup', () => this.emitChoice(false))

    this.input.keyboard?.on('keydown-T', this.handleTrueKey)
    this.input.keyboard?.on('keydown-RIGHT', this.handleRightKey)
    this.input.keyboard?.on('keydown-F', this.handleFalseKey)
    this.input.keyboard?.on('keydown-LEFT', this.handleLeftKey)

    // 道具显示：图标xN格式
    const updateToolHeader = () => {
      const counts = ToolManager.getCounts()
      const text = `🔍x${counts.magnify}  ⏱️x${counts.watch}  ⚡x${counts.flash}`
      this.headerToolText?.setText(text)
      this.footerToolText?.setText(text)
      const useIcons = this.textures.exists('icon_magnify') && this.textures.exists('icon_watch') && this.textures.exists('icon_flash')
      this.footerToolText?.setVisible(!useIcons)
    }
    updateToolHeader()
    this.toolUpdateHandler = () => updateToolHeader()
    on('tool:update', this.toolUpdateHandler)

    on('progress:update', this.progressHandler)

    on('ui:countdown:start', this.countdownStartHandler)
    on('ui:countdown:extend', this.countdownExtendHandler)
    on('tool:hints', this.hintHandler)

    // ESC 暂停弹窗
    this.input.keyboard?.on('keydown-ESC', this.handleEscKey)

    this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
      off('progress:update', this.progressHandler)
      off('ui:countdown:start', this.countdownStartHandler)
      off('ui:countdown:extend', this.countdownExtendHandler)
      off('tool:hints', this.hintHandler)
      if (this.toolUpdateHandler) {
        off('tool:update', this.toolUpdateHandler)
        this.toolUpdateHandler = undefined
      }
      const keyboard = this.input.keyboard
      keyboard?.off('keydown-ESC', this.handleEscKey)
      keyboard?.off('keydown-T', this.handleTrueKey)
      keyboard?.off('keydown-RIGHT', this.handleRightKey)
      keyboard?.off('keydown-F', this.handleFalseKey)
      keyboard?.off('keydown-LEFT', this.handleLeftKey)
      this.closePauseDialog(false)
      this.timer?.remove()
      this.timer = undefined
    })
  }

  private emitChoice(choice: boolean) {
    if (this.isPaused) return
    emit('ui:choice', { choice })
  }

  private closePauseDialog(emitResume: boolean) {
    if (!this.isPaused) return
    this.isPaused = false
    this.pausedOverlay?.destroy()
    this.pausedOverlay = undefined
    this.pausedDialog?.destroy()
    this.pausedDialog = undefined
    if (emitResume) emit('ui:resume', undefined as any)
  }

  private togglePauseDialog() {
    if (this.isPaused) {
      // 恢复
      this.closePauseDialog(true)
      return
    }
    // 暂停
    this.isPaused = true
    emit('ui:pause', undefined as any)

    const { width, height } = this.scale
    this.pausedOverlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.5).setOrigin(0)
    this.pausedDialog = this.add.container(width / 2, height / 2)

    const bg = this.add.rectangle(0, 0, 420, 200, 0x1e2746, 0.95).setOrigin(0.5)
    const txt = this.add.text(0, -40, '暂停', { fontFamily: 'sans-serif', fontSize: '26px', color: '#ffffff' }).setOrigin(0.5)
    const btnBack = this.add.text(-80, 40, '返回事务所', { fontFamily: 'sans-serif', fontSize: '18px', color: '#0b1021', backgroundColor: '#a9ffea', padding: { x: 12, y: 6 } }).setOrigin(0.5).setInteractive({ useHandCursor: true })
    const btnResume = this.add.text(80, 40, '继续', { fontFamily: 'sans-serif', fontSize: '18px', color: '#0b1021', backgroundColor: '#2de1c2', padding: { x: 12, y: 6 } }).setOrigin(0.5).setInteractive({ useHandCursor: true })

    btnBack.on('pointerup', () => {
      this.closePauseDialog(false)
      this.scene.stop('UIScene')
      this.scene.stop('GameScene')
      this.scene.start('MainMenuScene')
    })
    btnResume.on('pointerup', () => this.togglePauseDialog())

    this.pausedDialog.add([bg, txt, btnBack, btnResume])
  }

  private startCountdown(totalMs: number) {
    this.timer?.remove()
    this.remainingMs = totalMs
    this.updateCountdownText()
    this.timer = this.time.addEvent({ delay: 100, loop: true, callback: () => {
      if (this.isPaused) return
      this.remainingMs -= 100
      if (this.remainingMs <= 0) {
        this.remainingMs = 0
        this.updateCountdownText()
        this.timer?.remove()
        emit('question:timeout', undefined as any)
      } else {
        this.updateCountdownText()
      }
    }})
  }

  private extendCountdown(deltaMs: number) {
    if (this.isPaused) return
    this.remainingMs += deltaMs
    this.updateCountdownText()
  }

  private updateCountdownText() {
    const sec = Math.ceil(this.remainingMs / 1000)
    const s = sec % 60
    const m = Math.floor(sec / 60)
    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`)
    this.countdownText?.setText(`${pad(m)}:${pad(s)}`)
  }

  private showHint(hint: string) {
    this.hintText?.setText(hint)
    this.footerHintText?.setText(hint)
  }

  private updateHeaderLeftText() {
    if (!this.headerLeftText) return
    const total = this.clueTotal > 0 ? this.clueTotal : 0
    const index = Math.max(0, this.clueIndex)
    const user = this.userId || '未知'
    this.headerLeftText.setText(`用户: ${user}  关卡: ${this.currentLevel}  线索 ${index}/${total}`)
  }
}
