import Phaser from 'phaser'
import { emit } from '@/game/managers/EventBus'

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene')
  }

  create() {
    this.scale.on('resize', () => {
      // 未来可加入 UI 缩放夹紧策略
    })

    emit('boot:ready', undefined as any)
    this.scene.start('PreloadScene')
  }
}
