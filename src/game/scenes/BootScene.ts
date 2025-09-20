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

    // 全局 ESC：跳到荣誉墙
    this.input.keyboard?.on('keydown-ESC', () => {
      if (!this.scene.isActive('HonorScene')) {
        this.scene.launch('HonorScene')
      }
    })

    emit('boot:ready', undefined as any)
    this.scene.start('PreloadScene')
  }
}
