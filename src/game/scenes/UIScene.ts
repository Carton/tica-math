import Phaser from 'phaser'
import { on, off, emit } from '@/game/managers/EventBus'
import { ToolManager } from '@/game/managers/ToolManager'
import { SaveManager } from '@/game/managers/SaveManager'

export default class UIScene extends Phaser.Scene {
  private progressText?: Phaser.GameObjects.Text
  private countdownText?: Phaser.GameObjects.Text
  private hintText?: Phaser.GameObjects.Text
  private toolText?: Phaser.GameObjects.Text
  private statusText?: Phaser.GameObjects.Text
  private remainingMs = 0
  private timer?: Phaser.Time.TimerEvent
  private pausedOverlay?: Phaser.GameObjects.Rectangle
  private pausedDialog?: Phaser.GameObjects.Container
  private isPaused = false
  private currentLevel = 1

  constructor() {
    super('UIScene')
  }

  init(data: { level?: number } = {}) {
    if (data.level) this.currentLevel = data.level
  }

  create() {
    const { width, height } = this.scale

    const userId = SaveManager.getCurrentUserId()
    this.statusText = this.add.text(20, 50, `用户: ${userId}  关卡: ${this.currentLevel}`, {
      fontFamily: 'monospace', fontSize: '16px', color: '#ffffff'
    })

    this.progressText = this.add.text(20, 20, '线索 0/10', {
      fontFamily: 'sans-serif',
      fontSize: '20px',
      color: '#a9ffea',
    }).setDepth(10)

    this.countdownText = this.add.text(width - 20, 20, '00:00', {
      fontFamily: 'monospace',
      fontSize: '20px',
      color: '#ffd166',
    }).setOrigin(1, 0)

    const btnTrue = this.add.text(width / 2 - 120, height - 80, '✅ 真相 (T/→)', {
      fontFamily: 'sans-serif', fontSize: '24px', color: '#0b1021', backgroundColor: '#2de1c2', padding: { x: 14, y: 8 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })

    const btnFalse = this.add.text(width / 2 + 120, height - 80, '❌ 伪证 (F/←)', {
      fontFamily: 'sans-serif', fontSize: '24px', color: '#0b1021', backgroundColor: '#ff6b6b', padding: { x: 14, y: 8 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })

    btnTrue.on('pointerup', () => this.emitChoice(true))
    btnFalse.on('pointerup', () => this.emitChoice(false))

    this.input.keyboard?.on('keydown-T', () => this.emitChoice(true))
    this.input.keyboard?.on('keydown-RIGHT', () => this.emitChoice(true))
    this.input.keyboard?.on('keydown-F', () => this.emitChoice(false))
    this.input.keyboard?.on('keydown-LEFT', () => this.emitChoice(false))

    // 道具显示：图标xN格式
    const toolsY = height - 140
    this.toolText = this.add.text(width - 260, toolsY, '', { fontFamily: 'monospace', fontSize: '20px', color: '#a9ffea' }).setInteractive({ useHandCursor: true })
    const syncTools = () => {
      const c = ToolManager.getCounts()
      this.toolText?.setText(`🔍x${c.magnify}  ⏱️x${c.watch}  ⚡x${c.flash}`)
    }

    // 为道具文本添加点击区域检测
    this.toolText.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      if (this.isPaused) return

      const text = this.toolText?.text || ''
      const x = pointer.x - this.toolText!.x
      const y = pointer.y - this.toolText!.y

      // 根据点击位置判断使用哪个道具
      if (x < 60) {
        ToolManager.use('magnify')
      } else if (x < 120) {
        ToolManager.use('watch')
      } else {
        ToolManager.use('flash')
      }
    })
    syncTools()

    on('tool:update', () => syncTools())

    this.hintText = this.add.text(20, height - 140, '', { fontFamily: 'sans-serif', fontSize: '18px', color: '#ffffff', wordWrap: { width: width - 300 } })

    on('progress:update', ({ index, total }) => {
      this.progressText?.setText(`线索 ${index}/${total}`)
    })

    on('ui:countdown:start', ({ totalMs }) => this.startCountdown(totalMs))
    on('ui:countdown:extend', ({ deltaMs }) => this.extendCountdown(deltaMs))
    on('tool:hints', ({ hint }) => this.showHint(hint))

    // ESC 暂停弹窗
    this.input.keyboard?.on('keydown-ESC', () => this.togglePauseDialog())

    this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
      off('progress:update', () => {})
      off('ui:countdown:start', () => {})
      off('ui:countdown:extend', () => {})
      off('tool:hints', () => {})
      off('tool:update', () => {})
      this.timer?.remove()
    })
  }

  private emitChoice(choice: boolean) {
    if (this.isPaused) return
    emit('ui:choice', { choice })
  }

  private togglePauseDialog() {
    if (this.isPaused) {
      // 恢复
      this.isPaused = false
      this.pausedOverlay?.destroy()
      this.pausedDialog?.destroy()
      emit('ui:resume', undefined as any)
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
  }
}
