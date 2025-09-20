import Phaser from 'phaser'
import { on, off, emit } from '@/game/managers/EventBus'
import { ToolManager } from '@/game/managers/ToolManager'

export default class UIScene extends Phaser.Scene {
  private progressText?: Phaser.GameObjects.Text
  private countdownText?: Phaser.GameObjects.Text
  private hintText?: Phaser.GameObjects.Text
  private remainingMs = 0
  private timer?: Phaser.Time.TimerEvent

  constructor() {
    super('UIScene')
  }

  create() {
    const { width, height } = this.scale

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

    btnTrue.on('pointerup', () => emit('ui:choice', { choice: true }))
    btnFalse.on('pointerup', () => emit('ui:choice', { choice: false }))

    this.input.keyboard?.on('keydown-T', () => emit('ui:choice', { choice: true }))
    this.input.keyboard?.on('keydown-RIGHT', () => emit('ui:choice', { choice: true }))
    this.input.keyboard?.on('keydown-F', () => emit('ui:choice', { choice: false }))
    this.input.keyboard?.on('keydown-LEFT', () => emit('ui:choice', { choice: false }))

    // 道具按钮
    const toolsY = height - 140
    const b1 = this.add.text(width - 260, toolsY, '🔍', { fontSize: '28px' }).setInteractive({ useHandCursor: true })
    const b2 = this.add.text(width - 200, toolsY, '⏱️', { fontSize: '28px' }).setInteractive({ useHandCursor: true })
    const b3 = this.add.text(width - 140, toolsY, '⚡', { fontSize: '28px' }).setInteractive({ useHandCursor: true })

    b1.on('pointerup', () => ToolManager.use('magnify'))
    b2.on('pointerup', () => ToolManager.use('watch'))
    b3.on('pointerup', () => ToolManager.use('flash'))

    this.hintText = this.add.text(20, height - 140, '', { fontFamily: 'sans-serif', fontSize: '18px', color: '#ffffff', wordWrap: { width: width - 300 } })

    on('progress:update', ({ index, total }) => {
      this.progressText?.setText(`线索 ${index}/${total}`)
    })

    on('ui:countdown:start', ({ totalMs }) => this.startCountdown(totalMs))
    on('ui:countdown:extend', ({ deltaMs }) => this.extendCountdown(deltaMs))
    on('tool:hints', ({ hint }) => this.showHint(hint))

    this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
      off('progress:update', () => {})
      off('ui:countdown:start', () => {})
      off('ui:countdown:extend', () => {})
      off('tool:hints', () => {})
      this.timer?.remove()
    })
  }

  private startCountdown(totalMs: number) {
    this.timer?.remove()
    this.remainingMs = totalMs
    this.updateCountdownText()
    this.timer = this.time.addEvent({ delay: 100, loop: true, callback: () => {
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
