import Phaser from 'phaser'
import { on, off, emit } from '@/game/managers/EventBus'

export default class UIScene extends Phaser.Scene {
  private progressText?: Phaser.GameObjects.Text

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

    const btnTrue = this.add.text(width / 2 - 120, height - 80, '✅ 真相 (T/→)', {
      fontFamily: 'sans-serif', fontSize: '24px', color: '#0b1021', backgroundColor: '#2de1c2', padding: { x: 14, y: 8 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })

    const btnFalse = this.add.text(width / 2 + 120, height - 80, '❌ 伪证 (F/←)', {
      fontFamily: 'sans-serif', fontSize: '24px', color: '#0b1021', backgroundColor: '#ff6b6b', padding: { x: 14, y: 8 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })

    btnTrue.on('pointerup', () => emit('question:answer', { isCorrect: true, timeMs: 1000 }))
    btnFalse.on('pointerup', () => emit('question:answer', { isCorrect: false, timeMs: 1000 }))

    on('progress:update', ({ index, total }) => {
      this.progressText?.setText(`线索 ${index}/${total}`)
    })

    this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
      off('progress:update', () => {})
    })
  }
}
